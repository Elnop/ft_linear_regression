# ft_linear_regression

42 - Régression linéaire par descente de gradient.

Ce projet prédit le prix d'une voiture d'occasion à partir de son kilométrage. Le modèle est une droite, `prix = θ0 + θ1 × km`, dont les paramètres sont appris par **descente de gradient** sur un dataset de 24 voitures. Tout est codé à la main, sans bibliothèque de machine learning.

Il se compose de :

- **deux programmes en ligne de commande** (partie obligatoire) : `train` apprend θ0 et θ1, `predict` estime un prix ;
- **un programme de précision** (bonus) : `precision` affiche R², RMSE et MAE du modèle entraîné ;
- **une app web** (bonus, en cours) qui anime l'entraînement et affiche la précision du modèle : <https://elnop.github.io/ft_linear_regression/>

Le tout est écrit en TypeScript. Le cœur de l'algorithme (`core/`) est partagé entre la CLI et le web.

## Prérequis

- Node.js **≥ 22.18**, qui exécute le TypeScript directement, sans compilation.
- npm pour lancer les scripts. La CLI n'a aucune dépendance : `npm install` n'est utile que pour l'app web et la vérification des types. Sans npm, `node cli/train.ts` et `node cli/predict.ts` fonctionnent aussi.

## Utilisation

### Entraîner le modèle

```
npm run train
```

```
Dataset: data.csv (24 samples)
Training: lr=0.5, iterations=10000
Done: theta0=8499.599649933207  theta1=-0.02144896359170222  cost=222822.62
Saved to model.json
```

Options :

```
npm run train -- [dataset.csv] [--lr <rate>] [--iterations <n>]
```

| Option | Défaut | Rôle |
|---|---|---|
| `dataset.csv` | `data.csv` | dataset `km,price` à utiliser |
| `--lr` | `0.5` | learning rate |
| `--iterations` | `10000` | nombre d'itérations |

### Prédire un prix

```
npm run predict
```

```
Mileage (km): 100000
Estimated price: 6354.70
```

Avant tout entraînement, θ0 = θ1 = 0 et la prédiction vaut 0. En cas d'erreur (saisie invalide, fichier corrompu…), les programmes affichent un message sur la sortie d'erreur et quittent avec le code 1.

### Mesurer la précision (bonus)

```
npm run precision
```

```
R²:   0.7330
RMSE: 667.57
MAE:  557.84  (8.8% of the mean price)
```

### App web

```
npm install
npm run web
```

## Structure

```
core/    algorithme pur (hypothèse, gradient, normalisation, métriques), sans dépendance
cli/     programmes train, predict et precision
web/     app React (bonus)
docs/    documentation détaillée
```

## Documentation

| Document | Contenu |
|---|---|
| [docs/algorithme.md](docs/algorithme.md) | hypothèse, coût, descente de gradient, normalisation, vérification |
| [docs/architecture.md](docs/architecture.md) | organisation du code et choix techniques |
| [docs/cli.md](docs/cli.md) | référence complète des deux programmes et de leurs erreurs |
| [docs/web.md](docs/web.md) | app web et déploiement GitHub Pages |
| [docs/soutenance.md](docs/soutenance.md) | démonstration et questions probables |
