# Algorithme

Régression linéaire à une variable (le kilométrage), entraînée par descente de gradient.

## 1. Hypothèse

Le modèle est une droite :

```
estimatePrice(mileage) = θ0 + (θ1 * mileage)
```

- `θ0` : l'ordonnée à l'origine, prix estimé d'une voiture à 0 km.
- `θ1` : la pente, variation du prix par km parcouru (négative ici).

Avant tout entraînement, `θ0 = θ1 = 0`, donc toute estimation vaut 0.

Code : [`core/estimatePrice.ts`](../core/estimatePrice.ts).

## 2. Fonction de coût

Pour mesurer à quel point la droite colle aux données, on utilise l'erreur quadratique moyenne (divisée par 2) :

```
J(θ0, θ1) = 1/(2m) * Σ (estimatePrice(mileage[i]) - price[i])²
```

`m` est le nombre d'exemples du dataset (24 lignes dans `data.csv`).

Entraîner revient à chercher les `θ` qui minimisent `J`. Le `1/2` est une convention : il simplifie la dérivée et ne change pas le minimum.

Code : `cost` dans [`core/metrics.ts`](../core/metrics.ts).

## 3. Descente de gradient

Les dérivées partielles de `J` donnent les formules imposées par le sujet :

```
tmpθ0 = learningRate * 1/m * Σ (estimatePrice(mileage[i]) - price[i])
tmpθ1 = learningRate * 1/m * Σ (estimatePrice(mileage[i]) - price[i]) * mileage[i]

θ0 = θ0 - tmpθ0
θ1 = θ1 - tmpθ1
```

À chaque itération, on fait un petit pas dans la direction où le coût diminue le plus vite. Le `learningRate` règle la taille de ce pas.

### Mise à jour simultanée

Les deux sommes sont calculées avec les mêmes `θ`, ceux d'avant l'itération. On ne met à jour `θ0` et `θ1` qu'une fois les deux `tmp` calculés. Si on mettait `θ0` à jour avant de calculer `tmpθ1`, `tmpθ1` utiliserait un `θ0` déjà modifié : ce ne serait plus le gradient de `J`.

Dans [`core/gradientStep.ts`](../core/gradientStep.ts), une seule boucle accumule les deux sommes, puis la fonction renvoie un nouvel objet `{ theta0, theta1 }`. L'ancien n'est jamais modifié.

## 4. Pourquoi normaliser le kilométrage

Les kilométrages vont de 22 899 à 240 000. Avec des valeurs aussi grandes, le gradient de `θ1` (multiplié par `mileage[i]`) est des milliards de fois plus grand que celui de `θ0` :

- pour que `θ1` ne diverge pas, il faudrait un learning rate inférieur à environ 1.55 × 10⁻¹⁰ ;
- avec un pas aussi petit, `θ0` n'avancerait presque pas, et il faudrait des millions d'itérations.

Par exemple, sans normalisation et avec un learning rate de 0.1, `θ1` part vers −∞ dès l'itération 34. C'est pourquoi le programme normalise toujours.

### Normalisation min-max

On ramène les kilométrages dans `[0, 1]` uniquement pour l'entraînement :

```
km_norm = (km - min) / (max - min)
```

Les deux gradients sont alors du même ordre de grandeur. Sur ce dataset, tout learning rate inférieur à environ 1.76 converge. Avec une normalisation min-max, tout learning rate ≤ 1 converge, quel que soit le dataset.

Code : [`core/normalize.ts`](../core/normalize.ts).

### Retour à l'échelle d'origine

Les `θ` appris sur les km normalisés (`θ0n`, `θ1n`) ne sont pas utilisables tels quels sur un km brut. On développe :

```
prix = θ0n + θ1n * (km - min) / (max - min)
     = (θ0n - θ1n * min / (max - min)) + (θ1n / (max - min)) * km
       \__________ θ0 ___________/     \______ θ1 ______/
```

Donc :

```
θ0 = θ0n - θ1n * min / (max - min)
θ1 = θ1n / (max - min)
```

Ce sont ces `θ` (sur km brut) qui sont sauvegardés. `predict` applique donc l'hypothèse du sujet telle quelle, sans rien savoir de la normalisation.

## 5. Le générateur `trainSteps`

[`core/trainSteps.ts`](../core/trainSteps.ts) expose l'entraînement sous forme de générateur. À chaque itération, il produit :

```ts
{ iteration, theta0, theta1, cost }   // θ déjà ramenés sur km brut
```

- L'itération `0` correspond à l'état initial (`θ0 = θ1 = 0`).
- Le coût est toujours calculé sur les données brutes (km d'origine), comme celui qu'on cherche à minimiser.
- Si un `θ` devient non fini (`Infinity` ou `NaN`), le générateur produit cette étape puis s'arrête : c'est le signal de divergence.

Le même générateur sert à deux usages :
- la CLI le parcourt jusqu'au bout et garde la dernière étape ;
- l'app web le consomme frame par frame pour animer la droite.

## 6. Vérification

Une régression linéaire simple a aussi une solution exacte (moindres carrés) :

```
θ1 = Σ (km - moyenne_km)(prix - moyenne_prix) / Σ (km - moyenne_km)²
θ0 = moyenne_prix - θ1 * moyenne_km
```

Le projet ne l'utilise pas, puisque le sujet impose la descente de gradient. Elle sert seulement à vérifier le résultat.

| | θ0 | θ1 |
|---|---|---|
| Solution exacte | 8499.599649933 | −0.021448963592 |
| Descente de gradient (lr 0.5, 10 000 itérations) | 8499.599649933 | −0.021448963592 |

## 7. Précision (bonus)

[`core/metrics.ts`](../core/metrics.ts) fournit trois mesures, calculées sur le dataset :

| Mesure | Valeur sur `data.csv` | Signification |
|---|---|---|
| R² | 0.733 | 73 % de la variance des prix est expliquée par le kilométrage |
| RMSE | ≈ 668 | erreur typique, pénalise davantage les grosses erreurs |
| MAE | ≈ 558 | erreur moyenne en valeur absolue |

## 8. Limites du modèle

Au-delà d'environ 396 000 km, la droite passe sous zéro et le prix estimé devient négatif. Le modèle prolonge la droite en dehors des données et ne sait pas qu'un prix est positif.

Il n'y a qu'une variable : l'âge, la marque ou l'état de la voiture sont ignorés. Ça explique en partie pourquoi R² n'est que de 0.73.
