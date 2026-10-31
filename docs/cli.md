# Programmes en ligne de commande

Les deux programmes de la partie obligatoire (`train`, `predict`) et le programme de précision du bonus (`precision`). Ils nécessitent Node ≥ 22.18 et aucune dépendance npm.

## `train`

Lit un dataset, entraîne le modèle et sauvegarde `θ0` et `θ1` dans `model.json`.

```
npm run train -- [dataset.csv] [--lr <rate>] [--iterations <n>]
```

Équivalent sans npm : `node cli/train.ts [arguments]`.

| Argument | Défaut | Description |
|---|---|---|
| `dataset.csv` | `data.csv` | fichier CSV `km,price` |
| `--lr <rate>` | `0.5` | learning rate, nombre strictement positif |
| `--iterations <n>` | `10000` | nombre d'étapes de descente de gradient, entier ≥ 0 |
| `-h`, `--help` | | affiche l'aide |

Avec `npm run`, le `--` est nécessaire pour transmettre les options au programme plutôt qu'à npm.

### Exemples

```
$ npm run train
Dataset: data.csv (24 samples)
Training: lr=0.5, iterations=10000
Done: theta0=8499.599649933207  theta1=-0.02144896359170222  cost=222822.62
Saved to model.json
```

Learning rate trop grand :

```
$ npm run train -- --lr 3
Dataset: data.csv (24 samples)
Training: lr=3, iterations=10000
Error: training diverged at iteration 788, model not saved (try a smaller --lr)
```

### Format du dataset

- Première ligne : l'en-tête exact `km,price` (la casse et les espaces autour sont ignorés).
- Puis une ligne par voiture : deux nombres séparés par une virgule.
- Les lignes vides sont ignorées.
- `km` ne peut pas être négatif.
- Il faut au moins une ligne de données, et au moins deux kilométrages différents (les km sont normalisés pour l'entraînement).

## `predict`

Charge `model.json`, demande un kilométrage et affiche le prix estimé.

```
$ npm run predict
Mileage (km): 100000
Estimated price: 6354.70
```

Équivalent sans npm : `node cli/predict.ts`.

- Si `model.json` n'existe pas (aucun entraînement encore), `θ0 = θ1 = 0` et le prix estimé vaut `0.00`, comme le demande le sujet.
- Le kilométrage doit être un nombre décimal positif écrit simplement : `42`, `42.5`. Les notations `1e5` ou `0x10` sont refusées volontairement. La règle est écrite une seule fois, dans `parseMileage` ([`core/parseMileage.ts`](../core/parseMileage.ts)), et l'app web utilise la même pour son champ de prédiction.

## `precision` (bonus)

Calcule la précision du modèle entraîné sur un dataset.

```
$ npm run precision
Model: theta0=8499.599649933207  theta1=-0.02144896359170222
Dataset: data.csv (24 samples)
R²:   0.7330  (share of the price variance explained by the mileage)
RMSE: 667.57  (typical error, large errors weigh more)
MAE:  557.84  (mean absolute error, 8.8% of the mean price)
```

Équivalent sans npm : `node cli/precision.ts [dataset.csv]` (par défaut `data.csv`).

- Il faut avoir entraîné le modèle avant : sans `model.json`, le programme s'arrête avec `model.json not found, run the training first (npm run train)`.
- Les mesures sont expliquées dans [algorithme.md § 7](algorithme.md#7-précision-bonus).

## Gestion des erreurs

En cas d'erreur, les trois programmes écrivent `Error: …` sur la sortie d'erreur (stderr) et quittent avec le code 1, sans stack trace.

Ctrl+C pendant la saisie affiche `Interrupted` et quitte avec le code 130.

### Cas gérés par `predict`

| Situation | Message |
|---|---|
| entrée vide ou espaces | `no mileage given` |
| Ctrl+D sans saisie | `no mileage given` |
| `abc`, `-5`, `1e5`, `0x10`, `12 34` | `invalid mileage "…", expected a non-negative number of km` |
| nombre trop grand pour être représenté (des centaines de chiffres) | même message `invalid mileage "…"` |
| `model.json` illisible (droits, dossier…) | `cannot read model.json: <code>` |
| `model.json` qui n'est pas du JSON | `model.json is not valid JSON, run the training again` |
| `model.json` sans `theta0` / `theta1` numériques | `model.json is corrupted, run the training again` |

Un `model.json` absent n'est pas une erreur (θ = 0). Un `model.json` présent mais invalide en est une : renvoyer 0 en silence masquerait le problème.

### Cas gérés par `train`

| Situation | Message |
|---|---|
| `--lr` non numérique, nul ou négatif | `--lr must be a positive number, got "…"` |
| `--iterations` non entier ou négatif | `--iterations must be a non-negative integer, got "…"` |
| option inconnue, argument manquant | message de `parseArgs` suivi de l'aide |
| plusieurs fichiers CSV | `expected at most one dataset file` |
| fichier absent, dossier, droits | `cannot read "<fichier>": ENOENT` (ou `EISDIR`, `EACCES`…) |
| CSV invalide | `<fichier>: line <n>: …` (en-tête, nombre de champs, valeur non numérique, km négatif, dataset vide) |
| tous les km identiques | `cannot normalize: all mileages are identical` |
| divergence | `training diverged at iteration <n>, model not saved (…)` |
| écriture de `model.json` impossible | `cannot write model: <code>` |

En cas de divergence, `model.json` reste tel quel : le dernier modèle valide est conservé.

### Cas gérés par `precision`

| Situation | Message |
|---|---|
| `model.json` absent | `model.json not found, run the training first (npm run train)` |
| `model.json` illisible, pas du JSON ou corrompu | mêmes messages que `predict` |
| fichier CSV absent ou invalide, plusieurs fichiers, option inconnue | mêmes messages que `train` |

Contrairement à `predict`, un `model.json` absent est une erreur : mesurer la précision de θ = 0 n'aurait pas de sens.

## Organisation du code

Les trois programmes partagent quelques modules, chacun avec un seul rôle. Le calcul lui-même vient de `core/`.

| Fichier | Rôle |
|---|---|
| [`cli/train.ts`](../cli/train.ts) | programme `train` |
| [`cli/predict.ts`](../cli/predict.ts) | programme `predict` |
| [`cli/precision.ts`](../cli/precision.ts) | programme `precision` |
| [`cli/parseCli.ts`](../cli/parseCli.ts) | `parseCli` : argument `[dataset.csv]`, options, `--help` et erreurs d'usage |
| [`cli/loadDataset.ts`](../cli/loadDataset.ts) | `loadDataset` : lit le fichier et le passe à `parseDataset` |
| [`cli/model.ts`](../cli/model.ts) | `readModel` / `writeModel` : lecture, validation et écriture de `model.json` |
| [`cli/process.ts`](../cli/process.ts) | `fail` (message `Error: …` sur stderr, code 1) et `errorCode` |
