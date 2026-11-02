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

- le director démarre ses runs en mode instantané : l'intro et chaque entraînement peignent leur état final d'un coup, comme *Passer*, puis les coulures sont figées ;
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

- axe-core 4.10 sur le dashboard et sur les deux onglets de la documentation : aucune violation. Avant ce travail, il en signalait deux (contraste du sticker du prix, titre et chips hors de tout landmark).
- Un parcours clavier scripté : DOC puis Entrée place le focus sur la documentation, un lien du sommaire le place sur l'étape, et les flèches, Home et End changent d'onglet.
- En mouvement réduit, l'état final est atteint sans intro et sans bouton *Passer*. Un entraînement à α = 3 affiche directement son résultat divergé.

Ces scripts ne font pas partie du repo, pour ne pas ajouter de dépendances au projet. On les reproduit avec l'extension axe DevTools ou l'audit Accessibilité de Lighthouse, et au clavier.

Pas encore testé : un vrai lecteur d'écran (NVDA, VoiceOver) et un zoom à 200 %.
