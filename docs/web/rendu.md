# Rendu

## Direction artistique

Un mur de béton la nuit, tagué à la bombe, avec quelques autocollants abîmés (école 42, stack TypeScript / React, sujet) et une interface en panneaux de verre posée par-dessus.

Le mur est une photo de béton banché assombrie (Poly Haven, CC0). La droite, les points et le titre sont peints en direct par le moteur de peinture décrit plus bas, aucun n'est une image.

Une bombe de peinture en SVG (logo 42, aux couleurs du site) suit la buse du moteur. Elle prend la couleur de la peinture en cours, secoue quand la couleur change et enfonce le diffuseur pendant le spray. Quand plus rien n'est peint, elle tombe en tournant jusqu'en bas de l'écran, puis sa boucle d'animation s'arrête jusqu'au prochain trait. Elle est masquée pendant *Passer* et ne démarre pas si l'utilisateur a demandé moins d'animations.

Les autocollants sont dessinés en SVG, un presenter par dessin dans `web/src/features/graffiti/features/stickers/components/presenters/`, et `web/src/features/graffiti/features/stickers/configs/ArtsConfig.ts` donne la taille et le composant de chacun : logo 42, Piscine survivor, Norminette, TypeScript, React, formule `θ₀ + θ₁·km`, voiture km → €, descente de gradient. Ils font environ 8 cm à l'échelle du mur et sont regroupés. Certains sont grattés jusqu'au papier blanc, d'autres ont un coin décollé ou un bord déchiré. L'usure vient de filtres SVG, avec une graine aléatoire fixe par autocollant. Le logo 42 de la bombe et celui de l'autocollant viennent du même fichier (`web/src/features/graffiti/shared/configs/LogoConfig.ts`).

Les réglages du rendu sont dans les dossiers `configs/` des sous-features du graffiti : placement et échelle des autocollants (`web/src/features/graffiti/features/stickers/configs/StickersLayoutConfig.ts`), taille et point de départ de la bombe (`web/src/features/graffiti/features/spray-can/configs/CanSizeConfig.ts`), cadence et épaisseur du titre (`web/src/features/graffiti/features/animation-director/configs/TitlePaintConfig.ts`), valeurs par défaut des tracés et des points (`web/src/features/graffiti/features/animation-director/configs/NozzleConfig.ts`).

Les panneaux de l'interface (θ0, θ1, coût, précision, champ kilométrage, réglages) sont en verre dépoli. Les couleurs viennent d'une seule palette, voir [styles.md](styles.md).

## Séquence d'animation

L'animation montre ce que fait le programme du sujet : une descente de gradient sur tout le dataset, θ0 et θ1 partant de 0.

1. Le titre se tague, la bombe suit le tracé des lettres.
2. L'interface apparaît en fondu.
3. Les 24 points se peignent un par un, dans un ordre aléatoire (environ 8 s), la bombe se déplaçant de point en point. Aucun entraînement à ce stade : on montre la distribution des données.
4. La descente de gradient se peint sur les 24 points, avec les réglages par défaut de `npm run train` (lr 0.5, 10 000 itérations). Un passage de bombe est peint aux itérations 0, 1, 2, 4, 8, … (échelle logarithmique) et à la dernière.
   - Avec θ0 = θ1 = 0, le prix estimé vaut 0 : les premières droites sont sous le graphe (qui commence à 3 000) et y entrent par le bas. C'est l'initialisation imposée par le sujet.
   - Le coût, θ0 et θ1 se mettent à jour à chaque passage. Le chip du haut affiche l'itération en cours.
5. Les anciennes droites s'atténuent : dès qu'une nouvelle droite est peinte, la précédente vire entièrement au gris, et plus une droite est ancienne, plus elle est pâle (opacité `0.22 + 0.78 × 0.8^âge`, jamais sous 22 %). Seule la dernière garde sa couleur : c'est la régression finale. L'éventail gris montre le chemin parcouru par la droite.
   - Chaque droite couvre toute la largeur du graphe. Chaque passage de bombe part du début de l'axe des abscisses (0 km).
   - Les passages intermédiaires sont peints vite et avec peu de peinture, donc peu de coulures. Le dernier est lent et chargé.
   - Bouton *Passer* pour aller directement à l'état final, pendant l'intro comme pendant un entraînement relancé.
   - Les droites passent par-dessus les points. Une fois la descente finie, les points sont repeints par-dessus la droite finale pour rester lisibles.
6. L'interface devient interactive : prédiction d'un prix à partir d'un kilométrage, et bouton *Taguer* qui rejoue la même descente de gradient avec un autre learning rate (démonstration de la divergence au-delà de 1.76).
   - Les passages d'une descente qui diverge sont peints en jaune, mais θ explose dès les premières itérations et la droite quitte l'écran presque tout de suite. À 1440 × 900, on voit 3 passages jaunes à α = 1.77, 1 seul à 1.8 et 1.9, et aucun à partir de 2. La divergence se lit alors dans la courbe du coût, les chips θ0, θ1 et la précision, et l'avertissement du slider.

### Saisie du kilométrage

Le champ accepte ce qu'on tape sur un clavier français : `100 000` et `100,5` sont nettoyés (`normalizeMileage`) avant de passer par `parseMileage` de `core/`, le même parseur que la CLI. Une saisie invalide affiche un message d'erreur. Un kilométrage valide dont le prix sort de l'échelle affichable (au-delà de 10 millions d'euros en valeur absolue) affiche « prix hors de l'échelle affichable » au lieu d'un tiret muet. Le marqueur du prix sur le mur disparaît quand son point sort de l'écran.

### Cas particuliers

- Sans WebGL2, ou si la photo du mur ne charge pas, rien n'est peint. L'erreur part dans la console et l'interface affiche directement le modèle entraîné, avec la prédiction, le coût et la précision (`PaintlessDirector`). Comme le mur reste vide, le dashboard affiche le graphe à la place de la vue « mur » : GRAPHE est actif dès le départ, et désactiver DATA ramène au graphe.
- Avec le réglage système « réduire les animations », l'intro et chaque entraînement peignent directement leur état final, comme *Passer*. Voir [accessibilite.md](accessibilite.md).
- Pendant un redimensionnement, la peinture déjà posée suit le graphe et le titre comme une image étirée, sans recalcul. 300 ms après le dernier événement, une version nette est calculée en tâche de fond et la remplace avec un fondu. Pendant l'intro, un changement de hauteur de moins de 15 % (la barre d'adresse sur mobile) ne déclenche pas ce recalcul.
- *Passer* affiche un état final calculé en tâche de fond depuis le début de l'animation. Avant, il était peint d'un bloc au clic : la page gelait 0,8 à 1,2 s (mesuré entre 617 et 1526 px de large), et plus de 6 s dans Chromium headless avec WebGL logiciel. Si on clique très tôt, il reste un court délai pendant lequel le mur est figé, mais la page ne gèle plus.

## Moteur de peinture

Le moteur dépose une épaisseur de peinture pixel par pixel, puis la laisse couler là où il y en a trop.

Chaque élément peint (titre, points, chaque droite) a sa propre couche, une grille qui stocke une épaisseur et une couleur par pixel. Les couches sont séparées pour qu'on puisse atténuer une ancienne droite sans toucher au reste.

La buse se déplace le long d'un tracé (droite, lettres du titre) ou reste sur place (points), et pulvérise des gouttelettes. Plus elle va lentement, plus elle dépose de peinture. Là où l'épaisseur dépasse un seuil, la peinture coule vers le bas (simulation de film mince), donc les coulures apparaissent d'elles-mêmes aux endroits où la buse a trop chargé. Tant qu'une couche est humide, le moteur la fait couler et redessine tout le mur à chaque image : après *Passer*, les coulures continuent une vingtaine de secondes. En mouvement réduit, le mur final est séché d'un coup avant d'être affiché, donc rien ne bouge et le moteur s'arrête.

Au rendu, le relief est calculé à partir de l'épaisseur pour donner un reflet humide par-dessus le mur. Quand une nouvelle droite arrive, l'opacité de la couche de chaque ancienne droite baisse, coulures comprises.

Le découpage du moteur en classes (`PaintEngine`, `Scheduler`, `PaintLayer`) est décrit dans [architecture.md](architecture.md#le-moteur).
