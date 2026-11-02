# Application web (bonus)

> État : intégrée. Le moteur de peinture, la séquence d'intro, le titre tagué, l'interface et la documentation intégrée sont en place. Le parcours complet a été testé dans Chromium headless, avec et sans WebGL, au clavier et en mouvement réduit. Reste à valider la fluidité sur mobile et le rendu avec un vrai lecteur d'écran.

Publiée sur GitHub Pages : <https://elnop.github.io/ft_linear_regression/>

## Objectif

Couvrir les trois bonus du sujet de manière visuelle :

- afficher les données sur un graphe ;
- tracer la droite de régression sur ce même graphe ;
- afficher la précision de l'algorithme (R², RMSE, MAE).

L'app entraîne elle-même le modèle dans le navigateur avec les fonctions de `core/`, les mêmes que la CLI. Elle consomme le générateur `trainSteps` frame par frame, ce qui permet d'animer la droite pendant qu'elle converge. On peut aussi changer le learning rate pour voir l'entraînement diverger (au-delà d'environ 1.76).

## Conformité au bonus

- Données sur un graphe : les 24 points sont peints à leurs coordonnées exactes. Les axes (graduations en km et en prix, titres) restent lisibles par-dessus le mur, et le bouton GRAPHE affiche le même graphe sur fond uni.
- Droite de régression sur le même graphe : la dernière droite, seule en couleur, est la régression sur tout le dataset. Le web utilise les mêmes réglages par défaut que `npm run train` (`core/configs/TrainingConfig.ts`), donc les θ0 et θ1 affichés sont ceux de `model.json`.
- Programme de précision : `npm run precision` en ligne de commande, et R², RMSE, MAE affichés dans l'interface.

## Sommaire

| Document | Contenu |
|---|---|
| [rendu.md](rendu.md) | direction artistique, séquence d'animation, moteur de peinture, mode sans WebGL |
| [doc-integree.md](doc-integree.md) | la documentation affichée sous le mur : contenu, code extrait de `core/`, chiffres calculés |
| [architecture.md](architecture.md) | couches, features, scène, director, moteur, stores, règles de nommage |
| [styles.md](styles.md) | palette, tokens CSS, organisation des feuilles de style, valeurs dupliquées entre TS et CSS |
| [accessibilite.md](accessibilite.md) | structure, clavier, focus, mouvement réduit, contrastes, et comment c'est vérifié |
| [verifications.md](verifications.md) | lint, sens des dépendances, quel type de test écrire, tests, CI |

## Stack

| Outil | Rôle |
|---|---|
| Vite 8 | serveur de dev et build |
| React 19 | interface |
| Motion | animations de l'interface |
| Zustand | état partagé, un store par domaine |
| WebGL2 | rendu du moteur de peinture, sans bibliothèque |
| Oxlint | lint (règles TypeScript typées via tsgolint, compatible TypeScript 7) |
| dependency-cruiser | sens des dépendances entre couches, absence de cycles |

Le dataset est importé au build avec `import raw from '@dataset?raw'`. Il est intégré au bundle, sans requête réseau.

## Lancer en local

```
npm install
npm run web        # serveur de dev
npm run build      # build de production dans web/dist
```

## Déploiement

- Le workflow [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) vérifie, teste, build et déploie à chaque push sur `main` (détail dans [verifications.md](verifications.md)).
- Il faut avoir activé une fois *Settings → Pages → Source : GitHub Actions* sur le repo GitHub.
- `base: '/ft_linear_regression/'` dans `web/vite.config.ts` est obligatoire : le site est servi dans un sous-dossier, et sans ce réglage les assets ne se chargent pas.
- GitHub Pages ne sert que des fichiers statiques et ne gère pas les routes côté client : l'app tient en une seule page.
