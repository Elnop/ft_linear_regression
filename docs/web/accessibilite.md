# Accessibilité

L'app est d'abord une animation, mais tout ce qu'elle montre doit rester utilisable au clavier, avec un lecteur d'écran et sans mouvement. Cette page décrit ce qui est en place, pourquoi, et comment c'est vérifié.

## Structure

- Le dashboard est le landmark `<main>`. Il commence par un titre `h1` réservé aux lecteurs d'écran (`ft_linear_regression`).
- La documentation est une `section` nommée par son titre `h2` (« Comment la droite est trouvée »). Chaque étape est un `article` avec son titre `h3`.
- Les groupes du dashboard sont nommés : « Paramètres du modèle » (θ0, θ1, itération), « Prédiction et précision » (la colonne de droite), « Précision » (R², RMSE, MAE), « Entraînement » (la barre du bas). Les chips et les métriques sont des listes de définitions (`dl`), et c'est la `section` qui les entoure qui porte le nom, parce qu'un `dl` ne peut pas en porter.
- Les graphes ont un rôle `img` et un nom qui dit ce qu'ils montrent (« Graphe du prix (3k à 9k €) en fonction du kilométrage (0 à 250k km) », « Évolution du coût sur 10000 itérations »).
- Ce qui ne porte aucune information est caché aux technologies d'assistance : les autocollants, la bombe et sa brume, le marqueur du prix sur le mur (la valeur est déjà dans le champ de prédiction), les icônes des boutons et les bandes de scotch des panneaux.
- Pendant l'intro, l'interface n'est pas encore là : `Reveal` la rend `inert` et `aria-hidden`, donc ni la souris, ni le clavier, ni un lecteur d'écran n'y accèdent avant qu'elle apparaisse.

## Noms des contrôles

- Le bouton qui lance l'entraînement affiche TAGUER. Son nom accessible est « TAGUER (entraîner le modèle) » : il commence par le texte visible, ce qui permet de l'activer à la voix en disant « Taguer » (WCAG 2.5.3), et précise ce qu'il fait.
- Le bouton d'icône qui efface le mur s'appelle « Effacer le mur ». GRAPHE et DATA sont des boutons bascule (`aria-pressed`).
- Le champ kilométrage a son `label`. Une saisie invalide passe le champ en `aria-invalid` et affiche un message lié par `aria-describedby`, annoncé immédiatement (`role="alert"`). Le prix calculé est un `output` annoncé à chaque changement : c'est bavard pendant la frappe, et c'est un choix assumé.
- Le slider du learning rate a son `label` et affiche sa valeur. L'avertissement « ça va couler partout… » est un `role="status"`.

## Clavier et focus

- Tous les contrôles se suivent au clavier, et le focus est visible : contour `--acid` de 3 px sur les boutons, champs et liens, cyan sur les onglets.
- Le tableau du dataset défile au clavier : sa zone prend le focus (`tabIndex={0}`) et a un nom.
- Les onglets de la documentation suivent le modèle ARIA des onglets : un seul onglet est dans l'ordre de tabulation, les flèches gauche et droite passent à l'onglet voisin, Home et End vont au premier et au dernier. Seul l'onglet actif pointe vers son panneau (`aria-controls`), puisque l'autre panneau n'est pas rendu.
- Le bouton DOC et les liens du sommaire passent par `scrollToElement` (`shared/lib/scrollToElement.ts`). Il fait défiler jusqu'à la cible, y déplace le focus sans second défilement, et écrit l'ancre dans l'adresse avec `history.replaceState`. La touche Tab suivante continue donc depuis la section ou l'étape atteinte, et pas depuis le haut de la page. Les cibles ont `tabIndex={-1}` et pas de contour, puisque ce ne sont pas des contrôles.

## Mouvement

Le réglage système « réduire les animations » est exposé aux pages par la media query `prefers-reduced-motion`. `prefersReducedMotion()` (`shared/lib/prefersReducedMotion.ts`) est le seul code qui la lit. Quand elle vaut `reduce` :

- le director ne joue ni l'intro ni les entraînements : il affiche leur état final dès qu'il est calculé, comme *Passer* ;
- la bombe ne démarre pas ;
- `MotionConfig reducedMotion="user"` retire les déplacements et les ressorts de l'interface (apparition des panneaux, sticker du prix), et ne garde que les fondus ;
- le défilement vers la documentation et vers une étape n'est pas animé.

Pour tout le monde, le bouton *Passer* arrête l'intro et les entraînements animés, ce qui répond à WCAG 2.2.2 pour une animation qui dure plus de 5 secondes. Les seules transitions CSS restantes sont des fondus de couleur.

Pour tester sans changer son système : dans Chrome, DevTools → menu ⋮ → More tools → Rendering → « Emulate CSS media feature prefers-reduced-motion ».

## Contrastes

- Le texte posé sur une couleur vive est sombre : `--on-accent` pour le bouton Taguer, les boutons bascule actifs et la petite ligne « MON PRIX EST » du sticker du prix (en blanc sur magenta, elle n'atteignait qu'environ 3,3:1), `--background` pour l'onglet actif.
- La scrollbar de la page est visible (fine et sombre). Elle était masquée, ce qui retirait un repère de position sur une page de plusieurs écrans.

## Vérification

Le 2 novembre 2026, sur Chromium headless :

- axe-core sur le dashboard et sur les deux onglets de la documentation : aucune violation. Avant ce travail, il en signalait deux (contraste du sticker du prix, titre et chips hors de tout landmark).
- Un parcours clavier scripté : DOC puis Entrée place le focus sur la documentation, un lien du sommaire le place sur l'étape, et les flèches, Home et End changent d'onglet.
- En mouvement réduit, l'état final est atteint sans intro et sans bouton *Passer*. Un entraînement à α = 3 affiche directement son résultat divergé.

Ces contrôles sont dans le repo : `npm run e2e` les relance (25 tests passés le 2 novembre 2026, dont ceux du zoom et de la police à 20 px), en local et dans la CI (voir [verifications.md](verifications.md)). En les automatisant, on a trouvé que le bouton *Passer* apparaissait quand même en mouvement réduit, pendant 400 ms, une fois l'état final peint. Il est maintenant masqué dans ce mode.

Zoom à 200 % : une fenêtre de 1280 × 720 zoomée à 200 % a un viewport de 640 × 360, une de 1920 × 1080 en a un de 960 × 540. Aux deux tailles, le test vérifie que la page ne défile pas horizontalement, que chaque bouton et champ est entièrement dans l'écran (sans WebGL), et qu'aucun texte ne sort de sa boîte parmi `.dashboard-panel`, `.dashboard-bar` (la barre d'entraînement), `.readout-chip` et, avec WebGL, `.price-sticker`. À 640 × 360 le mur ne fait que la hauteur de l'écran, donc le titre peint est petit. À 320, 375, 414 et 768 px de large, à l'état final comme après une divergence, chaque chip θ0, θ1 et ITÉRATION et chaque bouton de l'en-tête a ses bords gauche et droit dans l'écran, et aucune étiquette ni valeur de chip n'est coupée par une ellipse : sur un écran trop étroit, le chip ITÉRATION passe à la ligne. Ces contrôles sont automatisés dans `web/e2e/zoom.spec.ts`.

Taille de police de l'utilisateur : le texte et les espacements sont en `rem` (voir [styles.md](styles.md)), donc une police par défaut agrandie agrandit toute l'interface. Le même fichier relance les contrôles avec une police par défaut de 20 px (`Page.setFontSizes`). À cette taille, le mode large commence à 1280 px au lieu de 1024 : à 1200 × 800, le panneau de droite passe sous le graphe. À 320 et 375 px de large, la page ne défile pas horizontalement (le sommaire de la documentation compris), aucun texte ne sort de la barre d'entraînement, des chips ni du sommaire, et l'étiquette de la prédiction reste dans le graphe sans WebGL. Le plancher de 12 px ne vient pas de ces tests e2e : il est garanti par l'échelle de texte, dont le plus petit niveau vaut 12 px pour une racine de 16 px, et `web/src/shared/lib/typeScale.test.ts` le vérifie. `web/src/shared/configs/TypeScaleConfig.test.ts` refuse toute taille en `px` ou en `vw` nu dans les feuilles et tout `fontSize` en dur dans les composants, et `DescentFigure.test.tsx` vérifie que les étiquettes du graphe de descente, dont la taille est recalculée d'après la largeur affichée de la figure, ne passent jamais sous 12 px. Les blocs de code de la documentation prennent le focus (`tabIndex={0}`), parce qu'un texte plus grand les fait défiler (règle `scrollable-region-focusable` d'axe).

Le sticker du prix appartient au mur peint, qui demande WebGL : ses contrôles sont dans le projet `painting` (`@painting`), le reste dans `paintless` (`@paintless`).

Pas encore testé : un vrai lecteur d'écran (NVDA, TalkBack, VoiceOver).
