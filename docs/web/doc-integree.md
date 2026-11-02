# Documentation intégrée

Sous le premier écran (bouton *DOC* ou défilement), une feuille de verre presque pleine largeur présente la documentation en deux onglets. Le mur peint reste fixe en arrière-plan.

- Théorie : ce qu'est le machine learning et l'apprentissage supervisé (régression ou classification), les notions mathématiques utiles (notations θ, α, Σ…, fonction affine, symbole Σ, dérivée, dérivées partielles et gradient, fonctions composées), les 4 étapes de l'apprentissage supervisé (dataset, modèle, fonction coût, minimisation), puis la descente de gradient (intuition, formule, learning rate, calcul des dérivées), et enfin ce qui est propre au projet (normalisation, vérification).
- Code : les fonctions de `core/` dans le même ordre (`parseDataset`, `estimatePrice`, `cost` / `r2`, `gradientStep`, `normalizeSamples` / `denormalizeThetas`, `trainSteps`), puis la CLI et l'organisation du projet.

Chaque onglet commence par un sommaire. Un lien du sommaire fait défiler jusqu'à l'étape, y place le focus et met à jour l'adresse (`#documentation-theory-4`), voir [accessibilite.md](accessibilite.md).

## Le code affiché est le vrai code

Le code n'est pas recopié : les fichiers de `core/` sont importés en texte (`?raw`) au build, et `pick` (`web/src/features/docs/lib/pick.ts`) en extrait chaque fonction. `tokenize` (`web/src/features/docs/lib/tokenize.ts`) le découpe ensuite pour la coloration. La documentation montre donc toujours le code qui tourne.

Si une fonction de `core/` est renommée, `pick` lève une erreur au chargement. Le test `web/tests/docsSource.test.ts` le détecte avant : il vérifie que chaque fonction citée par la doc est trouvée en entier.

## Les chiffres sont calculés

Aucun chiffre lié au dataset ou à l'entraînement n'est écrit à la main. `docFigures` (`web/src/features/docs/lib/docFigures.ts`) les calcule avec `core/` à partir des échantillons, et `web/src/features/docs/configs/DocFiguresConfig.ts` l'exécute une fois sur le dataset :

- le nombre de voitures, les deux premières lignes, les kilométrages minimum et maximum, la moyenne de `x²` ;
- θ0, θ1 et le coût après la descente avec les réglages par défaut ;
- la solution exacte des moindres carrés, qui sert de témoin ;
- R², RMSE, MAE et le prix prédit à 100 000 km ;
- l'itération à laquelle l'entraînement diverge avec α = 3.

Les pages de théorie, la page de code, l'en-tête et la transcription de la CLI lisent ces valeurs. La transcription est donc identique à ce qu'affiche vraiment `npm run train`, `predict` et `precision`. `scientific` écrit les grands nombres à la française (`1,3 × 10¹⁰`).

Si `data.csv` ou les réglages par défaut changent, la doc suit d'elle-même. `web/tests/docFigures.test.ts` fige les valeurs actuelles et vérifie que la descente retombe sur la solution des moindres carrés.

## Fichiers

| Fichier | Rôle |
|---|---|
| `features/docs/components/DocumentationPage.tsx` | assemble l'en-tête, les onglets et le panneau actif |
| `features/docs/content/` | textes, un `XContent` par sujet, et `theory/` pour les pages de théorie |
| `features/docs/configs/TabsConfig.ts` | les deux onglets |
| `features/docs/useDocumentationTabs.ts` | onglet actif et navigation au clavier (`nextTab`) |
| `features/docs/lib/sections.ts` | regroupe les étapes par section pour le sommaire |
