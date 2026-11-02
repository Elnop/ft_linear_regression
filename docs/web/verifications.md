# Vérifications

Tout ce qui suit tourne en local et dans la CI. Les tests de composant et `npm run e2e` demandent un navigateur (Chromium headless).

## Commandes

| Commande (à la racine) | Ce qu'elle lance |
|---|---|
| `npm run typecheck` | `tsc` sur `core/`, `cli/`, `tests/`, puis sur le code de prod du web (`web/tsconfig.app.json`) et sur ses tests et son e2e (`web/tsconfig.test.json`) |
| `npm run check` | Prettier en mode `--check` sur tout le repo (sauf le Markdown), Oxlint sur `core/`, `cli/` et `tests/`, `tsc` sur ces trois dossiers, puis le check du web : typecheck, Oxlint sur `src/` et `e2e/`, dependency-cruiser, vérification des dossiers |
| `npm run format` | Prettier en écriture sur tout le repo (guillemets simples, virgules finales, 200 colonnes) |
| `npm test` | les tests de `tests/` (`node --test`), puis ceux du web (Vitest) : unitaires dans Node, composants dans Chromium |
| `npm run e2e` | build du web, puis les tests de `web/e2e/` avec Playwright, dans Chromium headless contre `vite preview` |

`npm run check` contient déjà tout le typecheck, et `npm run build` ne lance plus que `vite build`. Le workflow [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) a deux jobs en parallèle : `build` installe Chromium headless pour les tests de composant, puis lance `npm run check`, `npm test` et le build, `e2e` installe Chromium headless et lance `npm run e2e`. Chaque vérification ne tourne qu'une fois, et le déploiement attend les deux jobs. Les actions utilisées (`checkout@v7`, `setup-node@v7`, `upload-pages-artifact@v5`, `deploy-pages@v5`) tournent sur Node 24, le projet est testé sur Node 22.

## Lint

Oxlint applique les catégories `correctness` et `suspicious`, plus des règles TypeScript typées (promesses non attendues, assertions de type inutiles, imports de types). Dans le web, il refuse aussi tout import relatif : on importe par `@/` ou `@core/`, même entre voisins. Dans `web/e2e/`, l'alias `@e2e/` (déclaré dans `web/tsconfig.test.json`, que Playwright lit) remplace `./`.

## Sens des dépendances

dependency-cruiser (`web/.dependency-cruiser.cjs`) vérifie le sens des dépendances :

- une couche n'importe que les couches en dessous d'elle : `src/shared/` ne connaît ni `states/` ni les features, `states/` ne connaît ni les features ni `app/`, et une feature ne remonte jamais vers `app/` ;
- une feature n'importe jamais une autre feature (`no-cross-feature`), et un état n'importe pas un autre état (`no-cross-state`) ;
- une sous-feature (`features/<x>/features/<y>/`) n'importe ni ses voisines ni la racine de sa feature, seulement le `shared/` de sa feature, et ce `shared/` ne connaît aucune sous-feature ;
- un presenter n'importe aucun store ni aucun hook d'état, et un store vit à la racine ou dans le `stores/` de son niveau ;
- aucun cycle d'imports.

- le code de prod n'importe jamais un fichier de test (`no-prod-to-tests`).

`web/scripts/checkFolders.mjs` refuse un dossier vide et un dossier de catégorie (`components`, `lib`, `types`...) qui ne contient qu'un fichier. Les fichiers `*.test.ts` et `*.test.tsx` ne comptent pas : un test vit à côté de sa source.

## Quel type de test écrire

| Type | Ce qu'il teste | Outil | Emplacement et nommage | Commande (dans `web/`) |
|---|---|---|---|---|
| Unitaire | une fonction ou une classe pure (`lib/`, configs) | Vitest, dans Node | `Timeline.test.ts` à côté de `Timeline.ts` | `npm run test:unit` |
| Composant | un presenter seul, par ses props et ses interactions | Vitest browser mode et `vitest-browser-react`, dans Chromium | `SkipButton.test.tsx` à côté de `SkipButton.tsx` | `npm run test:component` |
| E2e | un parcours dans le site buildé, servi par `vite preview` | `@playwright/test`, dans Chromium | `web/e2e/<sujet>.spec.ts` | `npm run e2e` |

- Un test reste à côté de sa source, sans dossier dédié. L'extension choisit le type : `.test.ts` tourne dans Node, `.test.tsx` dans le navigateur.
- On cherche un élément par son rôle et son nom accessible (`getByRole('button', { name: /PASSER/ })`), jamais par une classe CSS.
- On attend avec une assertion qui réessaie (`expect.element(...)` en composant, les locators en e2e), jamais avec un `setTimeout`.
- On ne teste en composant que les presenters, qui reçoivent tout par props. Les containers et les layouts lisent des stores : l'e2e les couvre.
- Un test e2e porte le tag de son navigateur (`@paintless` ou `@painting`). Ce qui sert à plusieurs fichiers va dans `web/e2e/fixtures.ts`.
- Un test doit pouvoir échouer : avant de le garder, on casse le code qu'il protège et on vérifie qu'il passe au rouge.

## Tests

Les tests de `core/` tournent avec `node --test`, sans bibliothèque de test. Ceux du web tournent avec Vitest (`web/vitest.config.ts`), qui reprend `web/vite.config.ts` et donc ses alias `@/`, `@core/` et `@dataset`. Un test lit `data.csv` ou une source de `core/` par un import `?raw`, comme le code de prod.

Chaque test unitaire du web est à côté du fichier qu'il teste : `Timeline.ts` et `Timeline.test.ts` dans le même dossier. Dans le web, `npm run test:unit` ne lance que ces tests. `npm run test:watch` relance les tests unitaires et de composant à chaque modification (il ouvre donc aussi Chromium). `npm run coverage` mesure la couverture, sans seuil.

Un test de composant (`*.test.tsx`) affiche un presenter seul dans un vrai Chromium, avec Vitest browser mode et `vitest-browser-react`. Il tourne avec `npm run test:component` dans le web. En local, il faut installer Chromium une fois : `npx playwright install --only-shell chromium` dans `web/`.

| Dossier | Ce qui est testé |
|---|---|
| `tests/` | `core/` : parsing du dataset et du kilométrage, normalisation, métriques, convergence vers les θ de `data.csv`, divergence, borne de stabilité du learning rate |
| `tests/docsPaths.test.ts` | chaque fichier ou lien cité dans le README et dans `docs/` (sous-dossiers compris) existe encore |
| `web/src/**/*.test.tsx` | composants seuls dans Chromium : `SkipButton` (clic, disparition après l'animation de sortie), `ViewToggles` (`aria-pressed`, vue envoyée au clic) |
| `web/src/**/*.test.ts` | plan d'entraînement animé, `Timeline`, `Scheduler`, `Slicer`, ancrage des couches (`anchoredRectangle`), `PaintlessDirector`, mouvement de la bombe, sélecteurs, formatage des nombres et saisie à la française, géométrie du graphe et `axisLayout`, extraction du code affiché dans la doc, chiffres calculés de la doc, touches des onglets |

## Tests dans le navigateur

Les tests de bout en bout sont dans `web/e2e/`, un fichier par sujet, et tournent avec `@playwright/test` (`web/playwright.config.ts`). Playwright lance `vite preview` sur le build et l'arrête à la fin. La config déclare deux projets, deux Chromium : `paintless` sans WebGL, `painting` avec WebGL logiciel (SwiftShader). Chaque test porte le tag de son navigateur (`@paintless` ou `@painting`) et ne tourne que sur lui.

`web/e2e/fixtures.ts` regroupe ce qui est commun : ouvrir l'app, attendre qu'elle soit stable, lancer axe avec `@axe-core/playwright`. Une fixture automatique fait échouer tout test pendant lequel la page lève une erreur JavaScript.

| Fichier | Navigateur | Ce qui est vérifié |
|---|---|---|
| `web/e2e/accessibility.spec.ts` | `paintless` | axe et clavier |
| `web/e2e/fallbacks.spec.ts` | les deux | sans WebGL, mouvement réduit |
| `web/e2e/performance.spec.ts` | `painting` | clic sur *Passer* |
| `web/e2e/build.spec.ts` | `paintless` | fond flouté du build |

- axe-core ne trouve aucune violation sur le dashboard et sur les deux onglets de la doc.
- Au clavier, DOC puis Entrée place le focus sur la doc et met `#documentation` dans l'URL, un lien du sommaire le place sur son étape, et les flèches, Home et End changent d'onglet.
- Sans WebGL, la vue GRAPHE est active dès le départ.
- En mouvement réduit, TAGUER est actif en moins de 10 s et le bouton *Passer* n'apparaît jamais.
- Un clic sur *Passer* pendant l'intro ne bloque jamais la page plus d'une seconde (tâches longues relevées avec `PerformanceObserver`). Avant le calcul en tâche de fond, ce clic gelait la page plus de 6 s sur ce Chromium.
- Le fond flouté de la doc (`backdrop-filter`) est bien présent dans le CSS du build. La minification de Vite 8 (lightningcss) ne garde que la dernière des deux déclarations `backdrop-filter` et `-webkit-backdrop-filter`. Quand le préfixe était en dernier, la version standard disparaissait en prod et Chrome n'affichait plus de flou. Le flou restait visible en dev, où le CSS n'est pas minifié.

En local, il faut installer Chromium une fois : `npx playwright install --only-shell chromium` dans `web/`. Après un échec, `npx playwright show-report` dans `web/` ouvre le rapport HTML, avec la trace de chaque test qui a échoué.

Le rendu de la peinture (`PaintEngine`, `AnimationDirector`) n'a pas de test automatique : on le vérifie à l'œil dans le navigateur.
