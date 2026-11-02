# Vérifications

Tout ce qui suit tourne en local et dans la CI. Rien ne demande de navigateur, sauf les contrôles d'accessibilité décrits dans [accessibilite.md](accessibilite.md).

## Commandes

| Commande (à la racine) | Ce qu'elle lance |
|---|---|
| `npm run typecheck` | `tsc` sur `core/`, `cli/`, `tests/`, puis sur `web/` et `web/tests/` |
| `npm run check` | Oxlint sur `core/`, `cli/` et `tests/`, `tsc` sur ces trois dossiers, puis le check du web : typecheck, Oxlint sur `src/` et `tests/`, dependency-cruiser, vérification des dossiers |
| `npm test` | les tests de `tests/`, puis ceux de `web/tests/` |

`npm run check` contient déjà tout le typecheck, et `npm run build` ne lance plus que `vite build`. Le workflow [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) lance donc `npm run check`, `npm test`, puis le build, et chaque vérification ne tourne qu'une fois. Un échec bloque le déploiement. Les actions utilisées (`checkout@v7`, `setup-node@v7`, `upload-pages-artifact@v5`, `deploy-pages@v5`) tournent sur Node 24, le projet est testé sur Node 22.

## Lint

Oxlint applique les catégories `correctness` et `suspicious`, plus des règles TypeScript typées (promesses non attendues, assertions de type inutiles, imports de types). Dans le web, il refuse aussi tout import relatif : on importe par `@/` ou `@core/`, même entre voisins.

## Sens des dépendances

dependency-cruiser (`web/.dependency-cruiser.cjs`) vérifie le sens des dépendances :

- une couche n'importe que les couches en dessous d'elle : `src/shared/` ne connaît ni `states/` ni les features, `states/` ne connaît ni les features ni `app/`, et une feature ne remonte jamais vers `app/` ;
- une feature n'importe jamais une autre feature (`no-cross-feature`), et un état n'importe pas un autre état (`no-cross-state`) ;
- une sous-feature (`features/<x>/features/<y>/`) n'importe ni ses voisines ni la racine de sa feature, seulement le `shared/` de sa feature, et ce `shared/` ne connaît aucune sous-feature ;
- un presenter n'importe aucun store ni aucun hook d'état, et un store vit à la racine ou dans le `stores/` de son niveau ;
- aucun cycle d'imports.

`web/scripts/checkFolders.mjs` refuse un dossier vide et un dossier de catégorie (`components`, `lib`, `types`...) qui ne contient qu'un fichier.

## Tests

Les tests tournent avec `node --test`, sans bibliothèque de test. Le web importe ses fichiers par alias : `web/tests/aliases.ts` les résout avec un hook `registerHooks` de Node.

| Dossier | Ce qui est testé |
|---|---|
| `tests/` | `core/` : parsing du dataset et du kilométrage, normalisation, métriques, convergence vers les θ de `data.csv`, divergence, borne de stabilité du learning rate |
| `tests/docsPaths.test.ts` | chaque fichier ou lien cité dans le README et dans `docs/` (sous-dossiers compris) existe encore |
| `web/tests/` | plan d'entraînement animé, `Timeline`, `Scheduler`, `PaintlessDirector`, mouvement de la bombe, sélecteurs, formatage des nombres et saisie à la française, géométrie du graphe et `axisLayout`, extraction du code affiché dans la doc, chiffres calculés de la doc, touches des onglets |

`AnimationDirector`, `PaintEngine` et les composants React ne sont pas testés automatiquement : ils demandent un canvas WebGL ou un DOM. Ils sont vérifiés dans le navigateur.
