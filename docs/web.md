# Application web (bonus)

> **État : intégrée.** Le moteur de peinture, la séquence d'intro, le titre tagué et l'interface sont en place. Reste à valider le rendu et la fluidité dans un vrai navigateur : les tests automatisés tournent sans carte graphique.

## Objectif

Couvrir les trois bonus du sujet de manière visuelle :

- afficher les données sur un graphe ;
- tracer la droite de régression sur ce même graphe ;
- afficher la précision de l'algorithme (R², RMSE, MAE).

L'app **entraîne elle-même** le modèle dans le navigateur avec les fonctions de `core/`, les mêmes que la CLI. Elle consomme le générateur `trainSteps` frame par frame, ce qui permet d'animer la droite pendant qu'elle converge. On peut aussi changer le learning rate pour voir l'entraînement diverger (au-delà d'environ 1.76).

## Direction artistique

Un mur de béton la nuit, tagué à la bombe, avec quelques autocollants anti-IA abîmés et une interface en panneaux de verre posée par-dessus.

- **Mur** : photo de béton banché assombrie (Poly Haven, CC0).
- **Peinture** : la droite, les points et le titre sont **peints en direct** par un moteur de peinture (voir plus bas), pas affichés en images.
- **Autocollants** : petits (environ 8 cm à l'échelle du mur), regroupés, à moitié décollés ou grattés.
- **Interface** : panneaux en verre dépoli (θ0, θ1, coût, précision, champ kilométrage, réglages).

## Séquence d'animation

L'animation montre **ce que fait réellement le programme du sujet** : une descente de gradient sur tout le dataset, θ0 et θ1 partant de 0.

1. **Le titre se tague** : la bombe suit le tracé des lettres.
2. **L'interface apparaît** en fondu.
3. **Les 24 points se peignent** rapidement, dans un ordre aléatoire (environ 2 s). Aucun entraînement à ce stade : on montre la distribution des données.
4. **La descente de gradient se peint** sur les 24 points, avec les réglages par défaut de `npm run train` (lr 0.5, 10 000 itérations, normalisation). Un passage de bombe est peint aux itérations 0, 1, 2, 4, 8, … (échelle logarithmique) et à la dernière.
   - Avec θ0 = θ1 = 0, le prix estimé vaut 0 : les premières droites sont sous le graphe (qui commence à 3 000) et y entrent par le bas. C'est l'initialisation imposée par le sujet.
   - Le coût, θ0 et θ1 se mettent à jour à chaque passage.
5. **Les anciennes droites s'atténuent** : dès qu'une nouvelle droite est peinte, la précédente vire entièrement au gris, et plus une droite est ancienne, plus elle est pâle (opacité `0.22 + 0.78 × 0.8^âge`, jamais sous 22 %). Seule la dernière garde sa couleur : c'est la régression finale. L'éventail gris raconte la convergence.
   - Chaque droite couvre toute la largeur du graphe ; le sens du passage de bombe alterne.
   - Les passages intermédiaires sont peints vite et légers (peu de coulures) ; le dernier, lentement et chargé.
   - Bouton *Passer* pour aller directement à l'état final.
6. **L'interface devient interactive** : prédiction d'un prix à partir d'un kilométrage, et bouton *Entraîner* qui rejoue la même descente de gradient avec un autre learning rate (démonstration de la divergence au-delà de 1.76 : les passages, en jaune, sortent du graphe).

## Conformité au bonus

- **Données sur un graphe** : les 24 points sont peints à leurs coordonnées exactes. Les axes (graduations en km et en prix, titres) restent lisibles par-dessus le mur.
- **Droite de régression sur le même graphe** : la dernière droite, seule en couleur, est la régression sur tout le dataset. Le web utilise les mêmes réglages par défaut que `npm run train` (lr 0.5, 10 000 itérations, normalisation), donc les θ0 et θ1 affichés sont ceux de `model.json`.
- **Programme de précision** : `npm run precision` en ligne de commande, et R², RMSE, MAE affichés dans l'interface.

## Moteur de peinture

On ne dessine pas des formes : on **dépose de la matière** et la physique fait le reste.

- **Couches de peinture** : chaque élément peint (titre, points, chaque droite) a sa propre grille qui stocke, pour chaque pixel, une épaisseur et une couleur. Les couches sont séparées pour qu'on puisse atténuer une ancienne droite sans toucher au reste.
- **Buse** : elle se déplace le long d'un tracé (droite, lettres du titre) ou reste sur place (points), et pulvérise des gouttelettes. Plus elle va lentement, plus elle dépose de peinture.
- **Coulures** : là où l'épaisseur dépasse un seuil, la peinture coule vers le bas (simulation de film mince). Les coulures naissent donc toutes seules là où la buse a trop chargé.
- **Rendu** : le relief est calculé à partir de l'épaisseur de peinture pour obtenir un reflet humide, au-dessus du mur.
- **Atténuation** : l'opacité de la couche d'une droite baisse à chaque nouvelle droite, comme une peinture passée ou à moitié recouverte. Les coulures de cette droite s'atténuent avec elle.

## Stack

| Outil | Rôle |
|---|---|
| Vite 8 | serveur de dev et build |
| React 19 | interface |
| Motion | animations |

Le dataset est importé au build avec `import raw from '../../data.csv?raw'`. Il est intégré au bundle, sans requête réseau.

## Lancer en local

```
npm install
npm run web        # serveur de dev
npm run build      # build de production dans web/dist
```

## Déploiement

L'app est publiée sur GitHub Pages : <https://elnop.github.io/ft_linear_regression/>

- Le workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) build et déploie à chaque push sur `main`.
- Il faut avoir activé une fois *Settings → Pages → Source : GitHub Actions* sur le repo GitHub.
- `base: '/ft_linear_regression/'` dans `web/vite.config.ts` est obligatoire : le site est servi dans un sous-dossier, et sans ce réglage les assets ne se chargent pas.
- GitHub Pages ne sert que des fichiers statiques et ne gère pas les routes côté client : l'app tient en une seule page.
