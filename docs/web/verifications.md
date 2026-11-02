# Vérifications

Tout ce qui suit tourne en local et dans la CI. Seul `npm run e2e` demande un navigateur (Chromium headless).

## Commandes

| Commande (à la racine) | Ce qu'elle lance |
|---|---|
| `npm run typecheck` | `tsc` sur `core/`, `cli/`, `tests/`, puis sur `web/` et `web/tests/` |
| `npm run check` | Oxlint sur `core/`, `cli/` et `tests/`, `tsc` sur ces trois dossiers, puis le check du web : typecheck, Oxlint sur `src/` et `tests/`, dependency-cruiser, vérification des dossiers |
| `npm test` | les tests de `tests/`, puis ceux de `web/tests/` |
| `npm run e2e` | build du web, puis `web/tests/browser.e2e.ts` dans Chromium headless contre `vite preview` |

`npm run check` contient déjà tout le typecheck, et `npm run build` ne lance plus que `vite build`. Le workflow [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) a deux jobs en parallèle : `build` lance `npm run check`, `npm test` puis le build, `e2e` installe Chromium headless et lance `npm run e2e`. Chaque vérification ne tourne qu'une fois, et le déploiement attend les deux jobs. Les actions utilisées (`checkout@v7`, `setup-node@v7`, `upload-pages-artifact@v5`, `deploy-pages@v5`) tournent sur Node 24, le projet est testé sur Node 22.

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

## Tests dans le navigateur

`web/tests/browser.e2e.ts` utilise `playwright-core` et `axe-core` (devDependencies du web) avec le runner de Node, comme les autres tests. Il sert le build avec `vite preview` et ouvre deux Chromium : un sans WebGL, un avec WebGL logiciel (SwiftShader).

- axe-core ne trouve aucune violation sur le dashboard et sur les deux onglets de la doc.
- Au clavier, DOC puis Entrée place le focus sur la doc et met `#documentation` dans l'URL, un lien du sommaire le place sur son étape, et les flèches, Home et End changent d'onglet.
- Sans WebGL, la vue GRAPHE est active dès le départ.
- En mouvement réduit, TAGUER est actif en moins de 10 s et le bouton *Passer* n'apparaît jamais.

En local, il faut installer Chromium une fois : `npx playwright-core install --only-shell chromium` dans `web/`.

Le rendu de la peinture (`PaintEngine`, `AnimationDirector`) n'a pas de test automatique : on le vérifie à l'œil dans le navigateur.
