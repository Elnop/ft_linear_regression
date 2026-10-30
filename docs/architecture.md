# Architecture

## Vue d'ensemble

```
ft_linear_regression/
├── data.csv                  # dataset fourni (km,price)
├── package.json              # workspace npm, scripts train / predict / web / build
├── tsconfig.json             # typecheck de core/ et cli/
├── core/                     # calcul pur, partagé entre CLI et web
│   ├── types.ts              # Sample, Thetas, TrainOptions, TrainStep
│   ├── hypothesis.ts         # estimatePrice
│   ├── gradient.ts           # une étape de descente de gradient
│   ├── normalize.ts          # normalisation min-max et retour à l'échelle d'origine
│   ├── metrics.ts            # moyenne, somme des carrés des erreurs, coût, RMSE, MAE, R²
│   ├── thetas.ts             # hasFiniteThetas, partagé par l'entraînement, la CLI et le web
│   ├── mileage.ts            # parseMileage : saisie du kilométrage, partagée CLI / web
│   ├── csv.ts                # parsing et validation du dataset
│   └── train.ts              # générateur trainSteps
├── cli/                      # partie obligatoire
│   ├── process.ts            # fail(), errorCode()
│   ├── args.ts               # parseCli : arguments, --help, erreurs d'usage
│   ├── dataset.ts            # loadDataset : lecture et parsing du CSV
│   ├── model.ts              # lecture / écriture de model.json, validation des θ
│   ├── train.ts              # programme d'entraînement
│   ├── predict.ts            # programme de prédiction
│   └── precision.ts          # programme de précision (bonus)
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

Les entrées-sorties restent à l'extérieur. Par exemple, `parseDataset` reçoit le **texte** du CSV : c'est `cli/train.ts` qui lit le fichier, et le web qui l'importe au build.

### Une seule implémentation de l'algorithme

L'hypothèse et la formule d'entraînement imposées existent à un seul endroit : `core/hypothesis.ts` et `core/gradient.ts`. La CLI et le web appellent ces mêmes fonctions. Le correcteur n'a que deux petits fichiers à lire pour vérifier la conformité au sujet.

### Aucune lib ne fait le calcul

Le sujet interdit les bibliothèques qui font le travail (`numpy.polyfit`, etc.). La partie obligatoire n'a **aucune dépendance à l'exécution**. `typescript` et `@types/node` ne servent qu'à vérifier les types.

## TypeScript sans build

Node ≥ 22.18 exécute les fichiers `.ts` directement, en retirant simplement les annotations de type. Il n'y a donc pas d'étape de compilation pour la CLI. Ça impose deux contraintes, vérifiées par `erasableSyntaxOnly` dans `tsconfig.json` :

- pas de syntaxe TS qui génère du code (`enum`, `namespace`, propriétés de paramètres de constructeur) ;
- les imports locaux finissent par `.ts` (`import { … } from './types.ts'`).

`npm run typecheck` vérifie les types de `core/`, `cli/` et `web/`.

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
