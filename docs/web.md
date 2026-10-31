# Application web (bonus)

> État : intégrée. Le moteur de peinture, la séquence d'intro, le titre tagué et l'interface sont en place. Reste à valider le rendu et la fluidité dans un vrai navigateur : les tests automatisés tournent sans carte graphique.

## Objectif

Couvrir les trois bonus du sujet de manière visuelle :

- afficher les données sur un graphe ;
- tracer la droite de régression sur ce même graphe ;
- afficher la précision de l'algorithme (R², RMSE, MAE).

L'app entraîne elle-même le modèle dans le navigateur avec les fonctions de `core/`, les mêmes que la CLI. Elle consomme le générateur `trainSteps` frame par frame, ce qui permet d'animer la droite pendant qu'elle converge. On peut aussi changer le learning rate pour voir l'entraînement diverger (au-delà d'environ 1.76).

## Direction artistique

Un mur de béton la nuit, tagué à la bombe, avec quelques autocollants abîmés (école 42, stack TypeScript / React, sujet) et une interface en panneaux de verre posée par-dessus.

Le mur est une photo de béton banché assombrie (Poly Haven, CC0). La droite, les points et le titre sont peints en direct par le moteur de peinture décrit plus bas, aucun n'est une image.

Une bombe de peinture en SVG (logo 42, aux couleurs du site) suit la buse du moteur. Elle prend la couleur de la peinture en cours, secoue quand la couleur change et enfonce le diffuseur pendant le spray. Quand plus rien n'est peint, elle tombe en tournant jusqu'en bas de l'écran. Elle est masquée pendant *Passer* et si l'utilisateur a demandé moins d'animations.

Les autocollants sont dessinés en SVG dans `web/src/features/wall/stickers/configs/ArtsConfig.tsx` : logo 42, Piscine survivor, Norminette, TypeScript, React, formule `θ₀ + θ₁·km`, voiture km → €, descente de gradient. Ils font environ 8 cm à l'échelle du mur et sont regroupés. Certains sont grattés jusqu'au papier blanc, d'autres ont un coin décollé ou un bord déchiré. L'usure vient de filtres SVG, avec une graine aléatoire fixe par autocollant.

Les panneaux de l'interface (θ0, θ1, coût, précision, champ kilométrage, réglages) sont en verre dépoli.

## Séquence d'animation

L'animation montre ce que fait le programme du sujet : une descente de gradient sur tout le dataset, θ0 et θ1 partant de 0.

1. Le titre se tague, la bombe suit le tracé des lettres.
2. L'interface apparaît en fondu.
3. Les 24 points se peignent un par un, dans un ordre aléatoire (environ 8 s), la bombe se déplaçant de point en point. Aucun entraînement à ce stade : on montre la distribution des données.
4. La descente de gradient se peint sur les 24 points, avec les réglages par défaut de `npm run train` (lr 0.5, 10 000 itérations). Un passage de bombe est peint aux itérations 0, 1, 2, 4, 8, … (échelle logarithmique) et à la dernière.
   - Avec θ0 = θ1 = 0, le prix estimé vaut 0 : les premières droites sont sous le graphe (qui commence à 3 000) et y entrent par le bas. C'est l'initialisation imposée par le sujet.
   - Le coût, θ0 et θ1 se mettent à jour à chaque passage.
5. Les anciennes droites s'atténuent : dès qu'une nouvelle droite est peinte, la précédente vire entièrement au gris, et plus une droite est ancienne, plus elle est pâle (opacité `0.22 + 0.78 × 0.8^âge`, jamais sous 22 %). Seule la dernière garde sa couleur : c'est la régression finale. L'éventail gris montre le chemin parcouru par la droite.
   - Chaque droite couvre toute la largeur du graphe. Chaque passage de bombe part du début de l'axe des abscisses (0 km).
   - Les passages intermédiaires sont peints vite et avec peu de peinture, donc peu de coulures. Le dernier est lent et chargé.
   - Bouton *Passer* pour aller directement à l'état final.
   - Les droites passent par-dessus les points. Une fois la descente finie, les points sont repeints par-dessus la droite finale pour rester lisibles.
6. L'interface devient interactive : prédiction d'un prix à partir d'un kilométrage, et bouton *Entraîner* qui rejoue la même descente de gradient avec un autre learning rate (démonstration de la divergence au-delà de 1.76 : les passages, en jaune, sortent du graphe).

## Documentation intégrée

Sous le premier écran (bouton *DOC* ou défilement), une feuille de verre presque pleine largeur présente la documentation en deux onglets. Le mur peint reste fixe en arrière-plan.

- Théorie : ce qu'est le machine learning et l'apprentissage supervisé (régression ou classification), les notions mathématiques utiles (notations θ, α, Σ…, fonction affine, symbole Σ, dérivée, dérivées partielles et gradient, fonctions composées), les 4 étapes de l'apprentissage supervisé (dataset, modèle, fonction coût, minimisation), puis la descente de gradient (intuition, formule, learning rate, calcul des dérivées), et enfin ce qui est propre au projet (normalisation, vérification).
- Code : les fonctions de `core/` dans le même ordre (`parseDataset`, `estimatePrice`, `cost` / `r2`, `gradientStep`, `normalizeSamples` / `denormalizeThetas`, `trainSteps`), puis la CLI et l'organisation du projet.

Le code affiché n'est pas recopié : les fichiers de `core/` sont importés en texte (`?raw`) au build, et chaque fonction en est extraite (`web/src/features/docs/lib/source.ts`). La documentation montre donc toujours le code qui tourne.

## Conformité au bonus

- Données sur un graphe : les 24 points sont peints à leurs coordonnées exactes. Les axes (graduations en km et en prix, titres) restent lisibles par-dessus le mur.
- Droite de régression sur le même graphe : la dernière droite, seule en couleur, est la régression sur tout le dataset. Le web utilise les mêmes réglages par défaut que `npm run train` (lr 0.5, 10 000 itérations), donc les θ0 et θ1 affichés sont ceux de `model.json`.
- Programme de précision : `npm run precision` en ligne de commande, et R², RMSE, MAE affichés dans l'interface.

## Moteur de peinture

Le moteur dépose une épaisseur de peinture pixel par pixel, puis la laisse couler là où il y en a trop.

Chaque élément peint (titre, points, chaque droite) a sa propre couche, une grille qui stocke une épaisseur et une couleur par pixel. Les couches sont séparées pour qu'on puisse atténuer une ancienne droite sans toucher au reste.

La buse se déplace le long d'un tracé (droite, lettres du titre) ou reste sur place (points), et pulvérise des gouttelettes. Plus elle va lentement, plus elle dépose de peinture. Là où l'épaisseur dépasse un seuil, la peinture coule vers le bas (simulation de film mince), donc les coulures apparaissent d'elles-mêmes aux endroits où la buse a trop chargé.

Au rendu, le relief est calculé à partir de l'épaisseur pour donner un reflet humide par-dessus le mur. Quand une nouvelle droite arrive, l'opacité de la couche de chaque ancienne droite baisse, coulures comprises.

## Stack

| Outil | Rôle |
|---|---|
| Vite 8 | serveur de dev et build |
| React 19 | interface |
| Motion | animations |
| Zustand | état partagé, un store par domaine |
| Oxlint | lint (règles TypeScript typées via tsgolint, compatible TypeScript 7) |
| dependency-cruiser | sens des dépendances entre couches, absence de cycles |

Le dataset est importé au build avec `import raw from '@dataset?raw'`. Il est intégré au bundle, sans requête réseau.

## Organisation du code

```
web/src/
├── main.tsx
├── app/                  composition de la page et jonction entre features (App, Dashboard, HeadBar, Reveal)
├── features/
│   ├── model/            état du modèle affiché : dataset, θ, métriques, historique, learning rate
│   ├── wall/             le mur peint
│   │   ├── shared/       moteur de peinture, aléatoire
│   │   ├── canvas/       PaintWall : crée le moteur et le publie
│   │   ├── sequence/     chorégraphie entraînement ↔ peinture, sans interface
│   │   ├── spray-can/    la bombe qui suit la buse
│   │   └── stickers/     les autocollants
│   ├── dashboard/        l'interface posée sur le mur
│   │   ├── shared/       ports, playgroundStore, prédiction, panneau de verre, formatage
│   │   ├── controls/     barre de réglages, Passer, choix des overlays
│   │   ├── panels/       coût, précision, prédiction, puces d'en-tête
│   │   └── dataset-panel/, plain-chart/, wall-axes/, wall-marker/
│   └── docs/             documentation intégrée (contenu, onglets)
└── shared/               ce que le mur, le dashboard et app/ utilisent tous :
                          la scène (mise en page, repère du graphe, titre)
```

Une feature est découpée en sous-features. Ce qui sert à plusieurs sous-features va dans le `shared/` de la feature, et le code transverse sans domaine propre va dans `src/shared/`.

Une feature n'importe jamais une autre feature. Quand elle a besoin d'une donnée qui vient d'ailleurs, elle déclare ce besoin chez elle, et `app/` branche la vraie source :

- le dashboard déclare dans `dashboard/shared/ports/DashboardPorts.ts` un contexte qui transporte trois stores (séquence, modèle, options d'entraînement), typés de son côté dans `PortsTypes.ts`, et les lit avec `useSequencePort`, `useModelPort` et `useTrainingOptionsPort` ;
- la séquence reçoit ses dépendances en paramètre, `useSequenceRuntime({ samples, defaults, model })`, et écrit le modèle à travers ce `model` sans savoir d'où il vient ;
- `App.tsx` fournit les stores au contexte et les dépendances à la séquence.

Les types de résultat partagés (`Metrics`, `CostPoint`) sont dans `core/types/CoreTypes.ts`.

La géométrie de la page est calculée à un seul endroit. `sceneFor(width, height)` (`src/shared/lib/sceneFor.ts`) renvoie la scène : marges, mode large ou étroit, repère du graphe, rectangle et lignes du titre, haut du dashboard. Le store `sceneStore` la garde à jour, les composants la lisent avec `useScene()` (`src/shared/hooks/`), et la séquence, qui n'est pas un composant, appelle `sceneFor` avec la taille du moteur. Comme ce calcul ne dépend que de la taille de la fenêtre, il reste dans `src/shared/` sans passer par des ports.

Chaque niveau range ses fichiers dans les mêmes dossiers :

| Dossier | Contenu |
|---|---|
| `components/orchestrators/` | composants qui lisent les stores |
| `components/presenters/` | composants qui affichent ce qu'on leur passe par props |
| `hooks/` | hooks React (`useX.ts`) |
| `lib/` | fonctions et classes, sans types ni constantes exportées |
| `stores/` | stores Zustand (`xStore.ts`) |
| `ports/` | contextes qui reçoivent les données d'une autre feature, et leurs hooks de lecture |
| `types/` | types exportés, un `XTypes.ts` par domaine |
| `configs/` | constantes exportées, un `XConfig.ts` par domaine |
| `styles/` | CSS |
| `content/` | textes de la documentation, un `XContent.ts` par sujet (seulement dans `docs/`) |

Un fichier qui n'exporte qu'une fonction ou une classe porte son nom (`hexToRgb.ts`, `PaintEngine.ts`). Un orchestrateur qui branche un presenter du même nom prend le suffixe `Container` (`CostPanelContainer` affiche `CostPanel`).

L'état partagé vit dans des stores Zustand, un par domaine, chacun avec un seul propriétaire qui écrit dedans :

| Store | Contenu | Écrit par |
|---|---|---|
| `features/wall/shared/stores/engineStore.ts` | le moteur de peinture | `PaintWall` |
| `shared/stores/sceneStore.ts` | la scène calculée pour la taille de la fenêtre | l'écouteur `resize` |
| `features/wall/sequence/stores/sequenceStore.ts` | phase, points visibles, entraînement en cours | le `SequenceController` (ses actions sont branchées par `useSequenceRuntime`) |
| `features/model/stores/modelStore.ts` | dataset, θ, itération, métriques, historique du coût, divergence | le `SequenceController`, à travers `modelActions` |
| `features/model/stores/trainingOptionsStore.ts` | learning rate et avertissement de divergence | le slider du dashboard (`setLearningRate`) |
| `features/dashboard/shared/stores/playgroundStore.ts` | kilométrage saisi, overlay affiché | ses actions `setKm`, `toggleOverlay` |

Les sélecteurs du dashboard (`selectIntro`, `selectCanSkip`, `selectUsableThetas`...) sont dans `dashboard/shared/lib/` et portent sur les types de ses ports.

dependency-cruiser vérifie le sens des dépendances :

- `src/shared/` ne connaît ni `app/` ni les features, et une feature ne remonte jamais vers `app/` ;
- une feature n'importe jamais une autre feature (`no-cross-feature`), c'est `app/` qui fait la jonction ;
- une sous-feature n'importe aucune de ses voisines, seulement le `shared/` de sa feature, et ce `shared/` ne connaît aucune sous-feature ;
- un presenter n'importe aucun store ni aucun port, et les stores restent dans un dossier `stores/`.

Imports par alias : `@/` pour `web/src`, `@core/` pour `core/`, `@dataset` pour `data.csv`.

`npm run check` (dans `web/`) lance le typecheck, Oxlint et dependency-cruiser.

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
