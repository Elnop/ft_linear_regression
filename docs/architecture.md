# Architecture

## Vue d'ensemble

```
ft_linear_regression/
├── data.csv                  # dataset fourni (km,price)
├── package.json              # workspace npm, scripts train / predict / web / build
├── tsconfig.json             # typecheck de core/, cli/ et tests/
├── core/                     # calcul pur, partagé entre CLI et web
│   ├── types/CoreTypes.ts    # Sample, Thetas, TrainOptions, TrainStep
│   ├── configs/TrainingConfig.ts # réglages par défaut (lr 0.5, 10 000 itérations), partagés CLI / web
│   ├── estimatePrice.ts      # l'hypothèse imposée
│   ├── gradientStep.ts       # une étape de descente de gradient
│   ├── normalize.ts          # normalisation min-max et retour à l'échelle d'origine
│   ├── metrics.ts            # moyenne, somme des carrés des erreurs, coût, RMSE, MAE, R²
│   ├── hasFiniteThetas.ts    # partagé par l'entraînement, la CLI et le web
│   ├── hasDiverged.ts        # θ ou coût non fini : critère d'arrêt de l'entraînement
│   ├── maxStableLearningRate.ts # plus grand learning rate qui converge sur un dataset
│   ├── parseMileage.ts       # saisie du kilométrage, partagée CLI / web
│   ├── parseDataset.ts       # parsing et validation du dataset
│   └── trainSteps.ts         # générateur d'entraînement
├── cli/                      # partie obligatoire
│   ├── process.ts            # fail(), errorCode()
│   ├── parseCli.ts           # arguments, --help, erreurs d'usage
│   ├── loadDataset.ts        # lecture et parsing du CSV
│   ├── model.ts              # lecture / écriture de model.json, validation des θ
│   ├── train.ts              # programme d'entraînement
│   ├── predict.ts            # programme de prédiction
│   └── precision.ts          # programme de précision (bonus)
├── tests/                    # vérification des chemins cités dans la doc (node --test)
├── web/                      # bonus : app React (Vite)
├── docs/                     # cette documentation
├── .github/workflows/        # déploiement GitHub Pages
└── model.json                # généré par train (ignoré par git)
```

## Principes

### `core/` ne dépend de rien

`core/` ne contient que des fonctions pures : aucune API Node (`fs`, `process`, `readline`), aucune dépendance npm. C'est ce qui permet de l'utiliser à la fois :

- dans la CLI, sous Node ;
- dans le navigateur, via Vite.

Les entrées-sorties restent à l'extérieur. Par exemple, `parseDataset` reçoit le texte du CSV : c'est `cli/train.ts` qui lit le fichier, et le web qui l'importe au build.

### Une seule implémentation de l'algorithme

L'hypothèse et la formule d'entraînement imposées existent à un seul endroit : `core/estimatePrice.ts` et `core/gradientStep.ts`. La CLI et le web appellent ces mêmes fonctions. Le correcteur n'a que deux petits fichiers à lire pour vérifier la conformité au sujet.

### Aucune lib ne fait le calcul

Le sujet interdit les bibliothèques qui font le travail (`numpy.polyfit`, etc.). La partie obligatoire n'a aucune dépendance à l'exécution. `typescript` et `@types/node` ne servent qu'à vérifier les types.

## TypeScript sans build

Node ≥ 26 exécute les fichiers `.ts` directement, en retirant les annotations de type. Il n'y a donc pas d'étape de compilation pour la CLI. Ça impose deux contraintes, vérifiées par `erasableSyntaxOnly` dans `tsconfig.json` :

- pas de syntaxe TS qui génère du code (`enum`, `namespace`, propriétés de paramètres de constructeur) ;
- les imports locaux finissent par `.ts` (`import { … } from './types/CoreTypes.ts'`).

`npm run typecheck` vérifie les types de `core/`, `cli/`, `tests/` et `web/`.

## Tests et vérifications

`tests/` tourne avec `node --test`, sans dépendance en plus. Il vérifie que chaque chemin cité dans `docs/` et le README existe encore (`tests/docsPaths.test.ts`). `core/` n'a pas de tests. Les tests unitaires du web tournent avec Vitest, chacun à côté du fichier qu'il teste dans `web/src/` (plan d'entraînement animé, `Timeline`, `Scheduler`, `PaintlessDirector`, mouvement de la bombe, sélecteurs, géométrie du graphe, extraction du code affiché dans la doc). Vitest reprend les alias de `web/vite.config.ts`. Le détail est dans [web/verifications.md](web/verifications.md).

```
npm test            # tests de core/ puis du web
npm run typecheck   # types de core/, cli/, tests/ et web/
npm run check       # Oxlint et tsc sur core/, cli/ et tests/, puis le check du web
```

Le workflow de déploiement lance `npm run check` et `npm test` avant le build (`check` contient déjà le typecheck).

## Flux de données

### CLI

```
data.csv ──readFileSync──▶ parseDataset ──▶ trainSteps (jusqu'au bout) ──▶ model.json
                                                                              │
clavier ──readline──▶ mileage ─────────────▶ estimatePrice(θ, mileage) ◀──────┘
```

### Web

```
data.csv ──import ?raw (au build)──▶ parseDataset ──▶ trainSteps (frame par frame) ──▶ animation
```

Le web ne lit pas `model.json` : il entraîne lui-même dans le navigateur, avec les réglages choisis dans l'interface.

## Format de `model.json`

```json
{
  "theta0": 8499.599649933207,
  "theta1": -0.02144896359170222
}
```

Les `θ` sont exprimés sur le kilométrage brut. Le fichier est écrit à la racine du projet, quel que soit le dossier depuis lequel la commande est lancée (le chemin est résolu depuis `cli/model.ts`).
