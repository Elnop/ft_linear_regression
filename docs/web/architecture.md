# Architecture du web

Comment le code de `web/src/` est rangé, et qui a le droit d'écrire où. Le rendu est décrit dans [rendu.md](rendu.md), les vérifications automatiques dans [verifications.md](verifications.md).

## Vocabulaire

- *graffiti* : la feature qui peint, c'est-à-dire le moteur, l'animation, la bombe et les autocollants.
- *mur* (`wall` dans le code) : la surface peinte, la photo et le canvas. La vue `wall` du dashboard est celle qui pose ses calques (axes, marqueur du prix) directement sur le mur, par opposition aux vues GRAPHE et DATA.
- *itération* : une étape de descente de gradient. *Passage* : une itération qui est peinte (0, 1, 2, 4, 8… et la dernière).

## Organisation du code

```
web/src/
├── main.tsx
├── app/                                App : place GraffitiLayout et DashboardLayout
├── features/
│   ├── graffiti/                       le mur peint
│   │   ├── GraffitiLayout.tsx          assemble les sous-features et lance l'animation
│   │   ├── shared/                     moteur de peinture (PaintEngine, OffscreenWall, Scheduler, PaintLayer), engineStore, aléatoire
│   │   └── features/
│   │       ├── canvas/                 PaintWallContainer : crée le moteur et le publie
│   │       ├── animation-director/     enchaîne titre, points et droites, sans interface
│   │       ├── spray-can/              la bombe qui suit la buse
│   │       └── stickers/               les autocollants
│   ├── dashboard/                      l'interface posée sur le mur
│   │   ├── components/                 DashboardLayout, HeadBar, Reveal
│   │   ├── shared/                     kilométrage et prédiction, vue affichée, style des panneaux, formatage
│   │   └── features/
│   │       ├── training/               Taguer, effacer, learning rate, Passer
│   │       ├── views/                  boutons GRAPHE et DATA, et les vues qu'ils affichent (axes du mur, graphe, dataset)
│   │       ├── prediction/             champ kilométrage et marqueur du prix sur le mur
│   │       └── regression-readout/     θ et itération, coût, précision (lecture seule)
│   └── docs/                           documentation intégrée (contenu, onglets)
├── shared-features/                    l'état métier que plusieurs features lisent ou écrivent
│   ├── regression/                     dataset, θ, métriques, historique du coût, divergence, learning rate
│   └── animation-playback/             où en est l'animation : phase, points visibles, entraînement en cours, actions
└── shared/                             code sans métier utilisé partout : la scène (mise en page, repère du graphe, titre)
```

Le code est rangé en couches, et une couche n'importe que les couches en dessous d'elle : `web/src/app/` → `web/src/features/` → `web/src/shared-features/` → `web/src/shared/`. Le principe vient de Feature-Sliced Design, mais on n'en garde que les couches : les dossiers à l'intérieur gardent leurs noms React.

- Une feature range ses sous-features dans son propre dossier `features/`, à côté de son `shared/` et de ses dossiers techniques, comme `web/src/` le fait pour les features. Ce qui sert à plusieurs sous-features va dans le `shared/` de la feature.
- Une feature n'importe jamais une autre feature. Ce que deux features partagent descend dans `web/src/shared-features/` : graffiti écrit `web/src/shared-features/regression` et `web/src/shared-features/animation-playback` pendant l'animation, et le dashboard les lit.
- Un état n'importe pas un autre état. Le lien entre l'animation et la régression est fait par le director de graffiti.
- `src/shared/` ne contient aucun état métier, seulement du code transverse.

La racine d'une feature assemble ses sous-features, et `App.tsx` n'utilise que ces assemblages :

- `web/src/features/graffiti/GraffitiLayout.tsx` place le canvas, les autocollants et la bombe, et lance l'animation (`useAnimationDirector`) ;
- `web/src/features/dashboard/components/DashboardLayout.tsx` place tous les panneaux du dashboard et reçoit la documentation en prop (`documentation={<DocumentationPage />}`), ce qui lui évite d'importer la feature docs.

Les types de résultat partagés avec la CLI (`Metrics`, `CostPoint`) sont dans `core/types/CoreTypes.ts`.

## La scène

La géométrie de la page est calculée à un seul endroit. `sceneFor(width, height, rem)` (`web/src/shared/lib/sceneFor.ts`) renvoie la scène, où `Scene.rem` est la taille de la racine : marges, mode large ou étroit, repère du graphe, rectangle et lignes du titre, haut du dashboard. `web/src/shared/sceneStore.ts` est le seul code qui lit la taille de la fenêtre : la largeur sans la scrollbar (`clientWidth`, comme le canvas fixe), la hauteur avec `innerHeight` (qui suit la barre d'adresse sur mobile). `rem` vient de `readRem()` (`web/src/shared/lib/readRem.ts`). Il écoute `resize` et observe aussi `<html>`, dont la largeur change sans événement `resize` quand une scrollbar apparaît. Il recalcule au plus une fois par frame, et ne publie une nouvelle scène que si la taille ou `rem` a vraiment changé. Une taille de police changée dans le navigateur ne déclenche aucun événement : une sonde invisible (`height: 1rem`) est observée, et sa hauteur détecte le changement. Les composants la lisent avec `useScene()`, la brume de la bombe s'y abonne, et le director, qui n'est pas un composant, lit la scène du store qu'il reçoit. Quand `rem` change, `AnimationDirector` re-ancre le mur peint, comme pour un changement de taille de fenêtre.

Les deux vues du graphe (les axes posés sur le mur et le graphe sur fond uni du bouton GRAPHE) partagent `axisLayout` (`web/src/features/dashboard/features/views/lib/axisLayout.ts`) : à partir du repère, il calcule les lignes de grille et la position des graduations. Chaque vue garde son style.

## Le director

`useAnimationDirector` choisit un director et ne fait rien d'autre : `AnimationDirector` quand le moteur est publié, `PaintlessDirector` quand il a échoué, aucun avant. Le director reçoit ses dépendances (`playback`, `regression`, `samples`, `reducedMotion`), publie ses actions (`skip`, `train`, `replay`) dans `animationPlaybackStore` à sa création et remet les deux stores à zéro dans `destroy()`. C'est le seul code qui écrit dans ces deux états.

`AnimationDirector` déroule l'animation avec une `Timeline`. Chaque `restart()` renvoie un `Run` qui sait attendre (`sleep`, `wait`), qui est annulé dès que le run suivant démarre (son `signal` est alors abandonné), et qui porte son mode : animé ou instantané. `WallPainter` et `paintTitle` reçoivent ce run pour savoir comment peindre.

L'état final coûte environ une seconde de simulation goutte par goutte (0,8 à 1,2 s mesurées en navigateur, plus de 3 s dans Chromium headless). Le director ne le calcule donc jamais d'un bloc. Au début de l'intro et de chaque entraînement, il lance un run instantané sur une deuxième `Timeline`, qui peint l'état final dans un `OffscreenWall` : des couches hors écran que le moteur ne dessine pas. `paintFinalWall` y peint les points, le titre si besoin, les passages et les points repeints, puis fait sécher les couches 1,5 s (temps simulé). Le travail est découpé par un `Slicer` : 6 ms, puis il rend la main au navigateur. Quand l'animation va jusqu'au bout, ce calcul est abandonné.

*Passer* met la peinture affichée en pause (`hold()`), passe les tranches à 40 ms et attend la fin du calcul, puis `adopt()` remplace toutes les couches d'un coup. Si le calcul est déjà fini, c'est immédiat. En mouvement réduit, le director ne joue pas l'animation : il attend directement l'état final calculé de cette façon.

Un resize ne recalcule rien tout de suite. Chaque couche est ancrée à une région de la scène (`anchor` : le graphe ou le titre), et `reanchor()` la redessine à sa nouvelle place à chaque événement, comme une image : les droites et le titre sont étirés avec leur région, les points sont seulement déplacés pour rester ronds. 300 ms après le dernier événement, l'état final est recalculé en tâche de fond à la nouvelle taille, puis il remplace la version étirée avec un fondu de 250 ms. Pendant l'intro, un changement de hauteur de moins de 15 % à largeur égale (la barre d'adresse sur mobile) ne déclenche pas ce recalcul, le mur est recalé à la fin de l'intro.

## Le moteur

`PaintEngine` garde le canvas WebGL, le renderer, les couches et la boucle d'animation, et suit la taille du canvas et la densité de l'écran. Il implémente `Surface`, comme `OffscreenWall`, donc le même code peint à l'écran ou hors écran. `Scheduler` fait avancer les jobs de la buse et les fondus des couches, et règle leurs promesses, y compris celles du travail abandonné par un `clear()`. Il n'a pas de DOM, ce qui permet de le tester. La rugosité du mur n'est recalculée qu'à la première couche créée après un resize.

La bombe s'abonne à `onActivity` : sa boucle s'arrête quand elle est tombée et qu'aucun job ne tourne, et repart au job suivant.

## Fichiers et nommage

Chaque niveau range ses fichiers dans les mêmes dossiers :

| Dossier | Contenu |
|---|---|
| `components/orchestrators/` | composants qui lisent les stores (`XContainer`, `XLayout`, `XPage`) |
| `components/presenters/` | composants qui affichent ce qu'on leur passe par props (`XProps`) |
| `hooks/` | hooks React (`useX.ts`) |
| `lib/` | fonctions et classes, sans types ni constantes exportées |
| `stores/` | stores Zustand (`xStore.ts`) |
| `types/` | types exportés, un `XTypes.ts` par domaine |
| `configs/` | constantes exportées, un `XConfig.ts` par domaine |
| `styles/` | CSS |
| `content/` | textes de la documentation, un `XContent.ts` par sujet (seulement dans `docs/`) |

Un dossier de catégorie qui ne contient qu'un fichier disparaît et le fichier remonte d'un niveau. `check-tree` le vérifie, et refuse aussi deux CSS dans un même dossier sans `styles/`, et un CSS posé à côté d'un dossier `styles/`.

- Un fichier qui n'exporte qu'une chose porte son nom (`hexToRgb.ts`, `PaintEngine.ts`, `pick.ts`).
- Une famille de fonctions du même métier partage un fichier en minuscules nommé par ce métier (`random.ts`, `nozzle.ts`, `training.ts`, `animationPlaybackSelectors.ts`). Deux métiers différents vont dans deux fichiers.
- Un store suit la même forme partout : `xStore.ts` exporte le store et ses actions (`xActions`), et un hook `useX.ts` le lit.
- Les props d'un composant `X` ont un type nommé `XProps`, jamais un objet écrit dans la signature.

La place des types et des constantes du tableau ci-dessus et le typage des props sont vérifiés par `@elnop/oxlint-config-export-placement` et `@elnop/oxlint-config-component-props`, le nom des fichiers et la forme des stores par `@elnop/eslint-plugin-file-named-after-export` et `@elnop/eslint-plugin-store-layout`, le contenu de `styles/`, `types/` et `configs/` par alint, l'absence de commentaires par `eslint-plugin-no-comments`, les `index.ts` et un `types.ts` nu par `eslint-plugin-check-file` (voir [verifications.md](verifications.md)).

Tous les imports passent par un alias, même entre voisins : `@/` pour `web/src`, `@core/` pour `core/`, `@dataset` pour `data.csv`. Oxlint refuse `./` et `../`.

## Stores

L'état partagé vit dans des stores Zustand, un par domaine, chacun avec un seul écrivain :

| Store | Contenu | Écrit par |
|---|---|---|
| `web/src/features/graffiti/shared/engineStore.ts` | le moteur de peinture, ou son échec | `PaintWallContainer` (`engineActions`) |
| `web/src/shared/sceneStore.ts` | la scène calculée pour la taille de la fenêtre | l'écouteur `resize` et l'observateur de `<html>` |
| `web/src/shared-features/animation-playback/animationPlaybackStore.ts` | phase, points visibles, entraînement en cours, mur peint ou non, actions | le director actif |
| `web/src/shared-features/regression/stores/regressionStore.ts` | dataset, θ, itération, métriques, historique du coût, divergence | le director actif, à travers les `regressionActions` qu'il reçoit |
| `web/src/shared-features/regression/stores/trainingOptionsStore.ts` | learning rate et avertissement de divergence | le slider du dashboard (`setLearningRate`) |
| `web/src/features/dashboard/shared/stores/predictionStore.ts` | kilométrage saisi | le champ de prédiction (`predictionActions`) |
| `web/src/features/dashboard/shared/stores/viewStore.ts` | vue affichée (mur, graphe, données) | les boutons GRAPHE et DATA (`viewActions`) |

Les composants lisent les états avec `useAnimationPlayback`, `useRegression` et `useTrainingOptions`, les stores du dashboard avec `useKm` et `useView`, le moteur avec `useEngine`. Les sélecteurs du dashboard (`selectIntro`, `selectCanSkip`, `selectUsableThetas`...) sont dans `web/src/features/dashboard/shared/lib/`.

Le dashboard lit `selectCanSkip` pour afficher *Passer* pendant l'intro et pendant un entraînement relancé. `useView` ne renvoie pas toujours la vue choisie : quand le director annonce qu'il ne peint pas (`painted: false`, posé par `PaintlessDirector`), la vue « mur » est remplacée par le graphe (`shownView`).

L'avertissement de divergence du slider ne repose pas sur un seuil écrit à la main : `willDiverge` compare le learning rate à `maxStableLearningRate(DATA)` (`core/`), la borne 2/λmax calculée sur les km normalisés, soit 1.7599 pour `data.csv`.
