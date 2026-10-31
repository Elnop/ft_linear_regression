# Préparation de la soutenance

## Ce que le correcteur doit vérifier (d'après le sujet)

| Point | Où le montrer |
|---|---|
| Aucune lib ne fait le travail | `package.json` : aucune dépendance à l'exécution pour `core/` et `cli/` |
| Hypothèse imposée | [`core/estimatePrice.ts`](../core/estimatePrice.ts) |
| Fonction d'entraînement imposée | [`core/gradientStep.ts`](../core/gradientStep.ts) |

## Démonstration conseillée

```
rm -f model.json
npm run predict                                  # → 0.00 (θ = 0 avant entraînement)
npm run train                                    # → θ0 ≈ 8499.6, θ1 ≈ -0.02145
npm run predict                                  # 100000 → 6354.70
npm run train -- --lr 3                          # → divergence, model.json conservé
echo abc | npm run predict                       # → erreur propre, code 1
npm run train && npm run precision               # bonus : R² 0.733, RMSE 668, MAE 558
```

## Questions probables

**Que vaut `m` ?**
Le nombre d'exemples du dataset (24 pour `data.csv`).

**Pourquoi mettre à jour θ0 et θ1 en même temps ?**
Le gradient doit être calculé en un seul point. Si on modifie `θ0` avant de calculer `tmpθ1`, on calcule `tmpθ1` en un autre point, et ce n'est plus une descente de gradient. Voir [algorithme.md § 3](algorithme.md#mise-à-jour-simultanée).

**Pourquoi normaliser ?**
Les km (jusqu'à 240 000) rendent le gradient de `θ1` des milliards de fois plus grand que celui de `θ0`. Il faudrait un learning rate d'environ 10⁻¹⁰, et `θ0` ne bougerait presque plus. Une fois les km ramenés dans [0, 1], les deux gradients sont comparables.

**Comment `predict` peut-il utiliser des θ appris sur des données normalisées ?**
Ils sont convertis avant d'être sauvegardés : `θ0 = θ0n − θ1n·min/(max−min)` et `θ1 = θ1n/(max−min)`. Le calcul est détaillé dans [algorithme.md § 4](algorithme.md#retour-à-léchelle-dorigine).

**Comment savoir que le résultat est bon ?**
Il correspond à la solution exacte des moindres carrés à environ 10 chiffres significatifs (voir [algorithme.md § 6](algorithme.md#6-vérification)). Le coût diminue à chaque itération, et R² vaut 0.733.

**Que se passe-t-il avec un learning rate trop grand ?**
Chaque pas dépasse le minimum, de plus en plus loin, et les θ partent vers l'infini. `train` le détecte, s'arrête et ne sauvegarde pas le modèle.

**Pourquoi le prix devient-il négatif pour un très grand kilométrage ?**
La droite continue en dehors des données et passe sous zéro vers 396 000 km. Un modèle linéaire ne sait pas qu'un prix est positif.

**Pourquoi le coût est-il divisé par 2m et pas par m ?**
C'est une convention : le `1/2` s'annule en dérivant le carré. Le minimum reste le même.
