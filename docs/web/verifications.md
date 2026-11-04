# Vérifications

Tout ce qui suit tourne en local et dans la CI. Les tests de composant et `npm run e2e` demandent un navigateur (Chromium headless).

## Commandes

| Commande (à la racine) | Ce qu'elle lance |
|---|---|
| `npm run typecheck` | `tsc` sur `core/` et `cli/`, puis sur le code de prod du web (`web/tsconfig.app.json`) et sur ses tests et son e2e (`web/tsconfig.test.json`) |
| `npm run check` | Prettier en mode `--check` sur tout le repo (sauf le Markdown), Oxlint sur `core/` et `cli/`, `tsc` sur ces deux dossiers, alint (chaque chemin, lien et ancre cité dans le README et dans `docs/` existe encore), knip, puis le check du web : typecheck, Oxlint sur `src/` et `e2e/`, dependency-cruiser, `check-tree` sur `web/src/` |
| `npm run format` | Prettier en écriture sur tout le repo (guillemets simples, virgules finales, 200 colonnes, config `@elnop/prettier-config` déclarée dans le `package.json` racine) |
| `npm test` | les tests du web (Vitest) : unitaires dans Node, composants dans Chromium |
| `npm run e2e` | build du web, puis les tests de `web/e2e/` avec Playwright, dans Chromium headless contre `vite preview` |

`npm run check` contient déjà tout le typecheck, et `npm run build` ne lance plus que `vite build`. Le workflow [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) a deux jobs en parallèle : `build` installe Chromium headless pour les tests de composant, puis lance `npm run check`, `npm test` et le build, `e2e` installe Chromium headless et lance `npm run e2e`. Chaque vérification ne tourne qu'une fois, et le déploiement attend les deux jobs. Les actions utilisées (`checkout@v7`, `setup-node@v7`, `upload-pages-artifact@v5`, `deploy-pages@v5`) tournent sur Node 24, le projet est testé sur Node 26.

`tsconfig.json` étend `@elnop/tsconfig/node.json` et `web/tsconfig.app.json` étend `@elnop/tsconfig/react-vite.json`. Les deux ne gardent que leurs `paths`, `include` et `exclude`. `tsc` tourne donc en `strict` avec en plus `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature` et `exactOptionalPropertyTypes` (d'où `process.env['CI']` dans `web/playwright.config.ts`), à la racine comme dans le web.

Deux hooks font tourner les checks avant la CI. `npm install` pointe git vers `.githooks/`, dont le `pre-commit` lance `npm run check`. Dans Claude Code, `.claude/settings.json` lance `elnop-agent-hook --tree web/src` (paquet `@elnop/agent-hook`) après chaque `Edit` ou `Write`. Oxlint passe sur le fichier s'il est en `.ts` ou `.tsx`, depuis le dossier du `oxlint.config.ts` le plus proche (la racine ou `web/`). Après un `Write` (un fichier créé ou réécrit) ou une modification d'un `.md`, alint passe sur tout le repo, et `check-tree` sur `web/src/` si le fichier y est : un fichier posé dans le mauvais dossier est signalé tout de suite, sans attendre le pre-commit. Les erreurs reviennent à l'agent (code de sortie 2).

## Lint

Les configs Oxlint et les plugins viennent de paquets npm publiés depuis [Elnop/elnop-tooling](https://github.com/Elnop/elnop-tooling), comme les configs TypeScript, Prettier, dependency-cruiser et alint, les fixtures Playwright et le hook. Chacun a un README qui détaille ses règles.

| Où | Paquet | Contenu |
|---|---|---|
| racine (`core/`, `cli/`) | `@elnop/oxlint-config-typescript` | la base TypeScript : catégories `correctness` et `suspicious`, règles typées, conventions de nommage et de placement des exports, style des fonctions et des types |
| `web/` | `@elnop/oxlint-config-react-vite` | étend `@elnop/oxlint-config-react` (hooks, props des composants), `@elnop/oxlint-config-zustand` (stores et selectors), qui étendent tous les deux la base TypeScript, et `@elnop/oxlint-config-vitest` (tests), et ajoute les réglages Vite |
| `web/` | `@elnop/check-tree` | binaire `check-tree` |

Le `oxlint.config.ts` de la racine étend la base et ajoute le plugin `node`. Celui du web étend le preset et ne garde que le message de la règle des imports, qui cite les alias du projet.

Oxlint applique les catégories `correctness` et `suspicious`, plus des règles TypeScript typées (promesses non attendues, assertions de type inutiles, imports de types). Dans le web, il refuse aussi tout import relatif : on importe par `@/` ou `@core/`, même entre voisins. Dans `web/e2e/`, l'alias `@e2e/` (déclaré dans `web/tsconfig.test.json`, que Playwright lit) remplace `./`.

[`eslint-plugin-check-file`](https://github.com/dukeluo/eslint-plugin-check-file), chargé par la base, refuse tout fichier `index` (`no-index`), même quand il ré-exporte par nom, et un `types.ts` sans domaine (`filename-blocklist`).

Deux règles natives d'Oxlint complètent : `oxc/no-barrel-file` refuse un fichier qui ré-exporte avec `export *`, et `unicorn/filename-case` impose le camelCase ou le PascalCase aux noms de fichiers TypeScript (un acronyme s'écrit comme un mot : `createGlRenderer.ts`).

`eslint-plugin-no-comments`, chargé par la base, refuse tout commentaire dans `core/`, `cli/`, `web/src/` et `web/e2e/`, tests compris. Son option `allow` laisse passer les directives (`oxlint-`, `eslint-`, `@ts-expect-error`, `/// <reference`). `npm run lint -- --fix` supprime les commentaires. Le plugin déclare `eslint` en peer dependency : npm installe donc ESLint 10, qui ne tourne jamais ici. ESLint 10.14 dépend de `minimatch` 10, touché par [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) et corrigé seulement en 11.0.1 : le `overrides` du `package.json` racine force `minimatch` 11 sous ce plugin. On pourra le retirer quand ESLint publiera une version avec `minimatch` 11 ([eslint/eslint#21476](https://github.com/eslint/eslint/pull/21476)).

La place des exports et le typage des props passent par la règle `no-restricted-syntax` d'ESLint et ses sélecteurs ESQuery, qu'Oxlint charge depuis `oxlint-plugin-eslint`. Un override par motif de fichier choisit la liste :

- partout : un type exporté vit dans un `XTypes.ts`, une constante exportée (littéral, tableau, objet sans fonction, enum, résultat d'appel) dans un `XConfig.ts`. Un objet qui contient des fonctions (`engineActions`), une instance (`new X()`), le résultat d'un `defineX(...)` (`defineRule`, `defineConfig`), une fonction et une classe restent libres ;
- `*Types.ts` n'exporte que des types, `*Config.ts` et `*Content.ts(x)` que des constantes, `*Store.ts` échappe à la règle des constantes ;
- dans un `.tsx`, un composant (fonction dont le nom commence par une majuscule) type ses props avec un type nommé qui finit par `Props`. Des props sans type, typées par un objet écrit dans la signature ou par un type comme `Props` ou `Options` sont refusées. Aucun outil ne vérifie que le préfixe est exactement le nom du composant (`CodeProps` pour `Code`) : un sélecteur ne compare pas deux attributs, et ni eslint-plugin-react, ni eslint-react, ni `@typescript-eslint/naming-convention` n'ont cette règle ;
- les tests et `web/e2e/` échappent à ces règles.

Deux conventions sont des plugins Oxlint, parce qu'elles dépendent du nom du fichier, qu'aucun sélecteur ne voit :

- `file-named-after-export/file-named-after-export` : un fichier qui n'exporte qu'une chose porte son nom, sauf les `XTypes`, `XConfig` et `XContent`, et sauf les `*Store.ts`, que la règle suivante couvre ;
- `store-layout/store-layout` : `xStore.ts` n'exporte que `xStore` et `xActions`.

Chaque message d'erreur dit quoi faire, en anglais, pour qu'un agent puisse corriger sans connaître la convention.

Les paquets imposent aussi un style commun, essayé ici avant d'être publié :

- `func-style` en `declaration` : toute fonction nommée s'écrit `function f() {}`, y compris les one-liners et les fonctions locales. Les callbacks passés en argument restent fléchés. Une fonction déclarée est hoistée, donc TypeScript n'y garde pas le rétrécissement d'une variable capturée : `createGlRenderer` passe par `webGl2Context()` pour avoir un `gl` non nul ;
- `curly` en `multi-line` : un `if` sans accolades tient sur une ligne ;
- `interface` refusée, sauf pour augmenter un global comme `Window` dans `declare global` ;
- un `*Selectors.ts` n'exporte que des fonctions `selectX` ;
- `typescript/switch-exhaustiveness-check` : un `switch` sur une union couvre tous les cas ;
- `@elnop/oxlint-config-vitest` : `it()` dans un `describe`, `test()` en dehors, mocks typés (`vi.fn<() => void>()`), `toThrow` avec le message attendu.

Une config est de la donnée : `check-file/filename-blocklist` refuse un `XConfig.tsx`, et son JSX va dans un composant (les dessins des autocollants sont des presenters, `ArtsConfig.ts` ne garde que leurs dimensions et le composant à afficher). Un `XContent.tsx` reste accepté, la doc y est écrite en JSX.

Une deuxième série, essayée ici puis publiée (base TypeScript 0.3.0), impose une seule écriture pour chaque chose :

- les fonctions d'un type s'écrivent en propriété (`x: (km: number) => number`), jamais en méthode ;
- pas de `public` : on écrit `private` et `protected`, le reste est public sans mot-clé ;
- `for...of` au lieu de `forEach`, `replaceAll` pour une regex globale, `Number.parseFloat` et `Number.NaN` au lieu des globaux, `import type { X }` au lieu de `import { type X }` ;
- les regex ont le flag `u`, pas de ternaire imbriqué, pas de `!!x` ni de `+x` (on écrit `x !== null`), pas de paramètre réassigné, `console` réservé à `console.error` (coupé dans `cli/`) ;
- avec `--type-aware` : un membre de classe jamais réassigné est `readonly`, une API dépréciée est refusée, une expression `void` n'est acceptée que comme corps d'une flèche.

La config React (0.2.0) et la config Vitest (0.2.0) ajoutent leur part de cette série. Un type `XProps` nomme ses callbacks `onX`. Un hook vit dans un `useX.ts`, qui n'exporte que des hooks (plugin `hook-naming`). Pas d'accolades autour d'une chaîne en JSX. Côté tests, `toStrictEqual` remplace `toEqual`, `toBe(true)` remplace `toBeTruthy()`, `toBeNull()` remplace `toBe(null)` et `toHaveBeenCalledTimes(1)` remplace `toHaveBeenCalledOnce()`.

Écartées après mesure : `unicorn/prefer-at` (sans `noUncheckedIndexedAccess`, `.at(-1)` ajoute `undefined` là où `[length - 1]` n'en a pas), `vitest/no-conditional-in-test` (elle signale les `&&` dans les `expect` et le code passé à `page.addInitScript`), `react/no-array-index-key` (les cinq listes concernées ne bougent jamais, l'index y est la bonne clé) et `react/jsx-handler-names` (les props passent des actions de store comme `viewActions.toggle`, qu'elle voudrait renommer en `handleX`).

Les règles sur `interface` (base TypeScript) et sur les selectors (`@elnop/oxlint-config-zustand`) passent aussi par `no-restricted-syntax`, chacune sous son propre nom de plugin.

`typescript/no-unnecessary-condition` et `typescript/strict-boolean-expressions` restent coupées : sans `noUncheckedIndexedAccess`, `history[history.length - 1]` est typé non nul et ces règles demanderaient de retirer des gardes utiles.

`react/immutability` est coupée : Oxlint 1.91.0 signale à tort un `let` déclaré dans un effet et réassigné par une closure de cet effet, comme `alive` dans `web/src/features/graffiti/features/canvas/PaintWallContainer.tsx` ([oxc-project/oxc#28401](https://github.com/oxc-project/oxc/issues/28401)).

## Sens des dépendances

dependency-cruiser vérifie le sens des dépendances. Les règles viennent de `@elnop/dependency-cruiser-config`, et `web/.dependency-cruiser.cjs` n'ajoute que les options du parser (`swc`, parce que dependency-cruiser 18 ne lit pas TypeScript 7) :

- une couche n'importe que les couches en dessous d'elle : `web/src/shared/` ne connaît ni `web/src/shared-features/` ni les features, `web/src/shared-features/` ne connaît ni les features ni `web/src/app/`, et une feature ne remonte jamais vers `web/src/app/` ;
- une feature n'importe jamais une autre feature (`no-cross-feature`), et une shared feature n'importe pas une autre shared feature (`no-cross-shared-feature`) ;
- une sous-feature (`features/<x>/features/<y>/`) n'importe ni ses voisines ni la racine de sa feature, seulement le `shared/` de sa feature, et ce `shared/` ne connaît aucune sous-feature ;
- un presenter n'importe aucun store ni aucun hook d'état, et un store vit à la racine ou dans le `stores/` de son niveau ;
- aucun cycle d'imports ;
- le code de prod n'importe jamais un fichier de test (`no-prod-to-tests`) ni une devDependency (`not-to-dev-dep`). Les imports de types ne comptent pas.

`core/` tourne aussi dans le navigateur. Un override du `oxlint.config.ts` racine lui interdit tout paquet, tout module `node:`, le global `process` et tout import de `cli/` ou `web/`.

`check-tree` (paquet `@elnop/check-tree`) refuse un dossier vide et un dossier de catégorie (`components`, `lib`, `types`...) qui ne contient qu'un fichier. Les fichiers `*.test.ts` et `*.test.tsx` ne comptent pas : un test vit à côté de sa source. Il refuse aussi deux CSS dans un dossier qui n'est pas `styles/`, et un CSS à côté d'un dossier `styles/`. Depuis la 0.2.0, il applique la même règle aux hooks (`useX.ts`), aux types (`xTypes.ts`), aux configs (`xConfig.ts`), aux stores (`xStore.ts`) et aux fichiers de `lib/` (les autres `.ts`, sauf `xContent.ts`) : un seul reste à la racine de son dossier, à partir de deux ils vont dans `hooks/`, `types/`, `configs/`, `stores/` ou `lib/`. Les composants suivent la même règle avec `components/` (un `.tsx` en PascalCase, sauf `XContent`), puis, à l'intérieur de `components/`, avec `orchestrators/` (`XContainer`, `XLayout`, `XPage`) et `presenters/` (les autres). Le nommage est celui de la règle `presenters-are-pure`. C'est pour ça que les deux hooks de la doc sont dans `web/src/features/docs/hooks/`. Un autre projet remplace la liste des dossiers de catégorie avec `--categories app,server,lib`.

knip (`knip.json`) lit le workspace, les scripts npm et les configs de Vite, Vitest et Playwright pour trouver les points d'entrée. Il refuse un export que personne n'importe, même si son propre fichier l'utilise, un fichier que rien n'importe, une dépendance inutilisée et un paquet importé sans être déclaré. Un import depuis un test compte. `@swc/core` est ignoré dans `web/` parce que dependency-cruiser le charge par son nom (`parser: 'swc'`), que knip ne voit pas.

`eslint-plugin-project-structure` a été essayé à la place des règles de placement : il se charge dans Oxlint mais vérifie le nom des types plutôt que l'annotation des props, ne sait pas exprimer « un seul export, même nom que le fichier », et ajoute ESLint et TypeScript 6 aux dépendances.

[alint](https://github.com/asamarts/alint) vérifie la doc avec trois règles. `.alint.yml` étend `@elnop/alint-config` et ne déclare lui-même que `markdown_paths_resolve`, dont les préfixes dépendent des dossiers du repo. `markdown_paths_resolve` contrôle qu'un chemin écrit entre backticks dans le README ou dans `docs/` existe, s'il commence par `web/`, `core/`, `cli/`, `docs/` ou `.github/`. Il résout depuis la racine du repo : on écrit donc toujours le chemin complet (`web/src/shared/lib/readRem.ts`), et un nom de dossier générique (`shared/`, `features/`) n'est pas vérifié. `markdown_links_resolve` contrôle les liens vers des fichiers, et `markdown_fragments_resolve` les ancres (`verifications.md#lint`). Les blocs de code sont ignorés. Trois règles `dir_only_contains` gardent les dossiers de catégorie propres : `styles/` ne contient que des `.css`, `types/` que des `*Types.ts`, `configs/` que des `*Config.ts` et leurs tests. La version est figée (0.21.0, avant la 1.0) et son `postinstall`, qui télécharge le binaire depuis les releases GitHub et vérifie son SHA-256, est approuvé dans `allowScripts` du `package.json` racine. Une règle `json_path_matches` refuse une version de dépendance qui n'est pas exacte (`^1.2.3`, `~1.2.3`, `latest`) dans chaque `package.json`. `.npmrc` les écrit exactes à chaque `npm install` (`save-exact`) et refuse d'installer avec une version de Node hors de `engines` (`engine-strict`). `oxlint` et `oxlint-tsgolint` sont déclarés à la racine et dans `web/`, parce que chaque workspace lance son propre lint et que knip demande que chacun déclare ce qu'il utilise.

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

Les tests du web tournent avec Vitest (`web/vitest.config.ts`), qui reprend `web/vite.config.ts` et donc ses alias `@/`, `@core/` et `@dataset`. Un test lit `data.csv` ou une source de `core/` par un import `?raw`, comme le code de prod.

Chaque test unitaire du web est à côté du fichier qu'il teste : `Timeline.ts` et `Timeline.test.ts` dans le même dossier. Dans le web, `npm run test:unit` ne lance que ces tests. `npm run test:watch` relance les tests unitaires et de composant à chaque modification (il ouvre donc aussi Chromium). `npm run coverage` mesure la couverture, sans seuil.

Un test de composant (`*.test.tsx`) affiche un presenter seul dans un vrai Chromium, avec Vitest browser mode et `vitest-browser-react`. Il tourne avec `npm run test:component` dans le web. En local, il faut installer Chromium une fois : `npx playwright install --only-shell chromium` dans `web/`.

| Dossier | Ce qui est testé |
|---|---|
| `web/src/**/*.test.tsx` | composants seuls dans Chromium : `SkipButton` (clic, disparition après l'animation de sortie), `ViewToggles` (`aria-pressed`, vue envoyée au clic) |
| `web/src/**/*.test.ts` | plan d'entraînement animé, `Timeline`, `Scheduler`, `Slicer`, ancrage des couches (`anchoredRectangle`), `PaintlessDirector`, mouvement de la bombe, sélecteurs, formatage des nombres et saisie à la française, géométrie du graphe et `axisLayout`, extraction du code affiché dans la doc, chiffres calculés de la doc, touches des onglets |

## Tests dans le navigateur

Les tests de bout en bout sont dans `web/e2e/`, un fichier par sujet, et tournent avec `@playwright/test` (`web/playwright.config.ts`). Playwright lance `vite preview` sur le build et l'arrête à la fin. La config déclare deux projets, deux Chromium : `paintless` sans WebGL, `painting` avec WebGL logiciel (SwiftShader). Chaque test porte le tag de son navigateur (`@paintless` ou `@painting`) et ne tourne que sur lui. SwiftShader dessine sur le CPU : un mur qui continue de couler sature le navigateur et ralentit le test suivant. Avant la correction du mouvement réduit, un test passait de 4 s seul à plus de 60 s en suite, bloqué à la création de son contexte. `fallbacks.spec.ts` vérifie maintenant qu'en mouvement réduit le mur ne fait plus aucun dessin WebGL une fois affiché, et le projet `painting` a un timeout de 90 s au lieu de 60 s.

`web/e2e/fixtures.ts` regroupe ce qui est commun : ouvrir l'app, attendre qu'elle soit stable, lancer axe une fois la page stable. Il reprend `test`, `expect` et `axeViolations` de `@elnop/playwright-fixtures`, dont la fixture automatique fait échouer tout test pendant lequel la page lève une erreur JavaScript.

| Fichier | Navigateur | Ce qui est vérifié |
|---|---|---|
| `web/e2e/accessibility.spec.ts` | `paintless` | axe et clavier |
| `web/e2e/fallbacks.spec.ts` | les deux | sans WebGL, mouvement réduit |
| `web/e2e/performance.spec.ts` | `painting` | clic sur *Passer* |
| `web/e2e/zoom.spec.ts` | les deux | zoom à 200 %, écrans étroits, police par défaut de 20 px |
| `web/e2e/build.spec.ts` | `paintless` | fond flouté du build |

- axe-core ne trouve aucune violation sur le dashboard et sur les deux onglets de la doc.
- Au clavier, DOC puis Entrée place le focus sur la doc et met `#documentation` dans l'URL, un lien du sommaire le place sur son étape, et les flèches, Home et End changent d'onglet.
- Sans WebGL, la vue GRAPHE est active dès le départ.
- En mouvement réduit, sans WebGL, TAGUER est actif en moins de 10 s et le bouton *Passer* n'apparaît jamais. Avec le WebGL logiciel du projet `painting`, l'état final peint d'un coup et le mur sec sont vérifiés avec une attente de 30 s : le rendu sur CPU de la CI varie de 5 s d'un run à l'autre (12,6 à 18 s pour le même test sur un même commit), et une limite de 10 s y échouait sans aucune régression.
- Un clic sur *Passer* pendant l'intro ne bloque jamais la page plus d'une seconde (tâches longues relevées avec `PerformanceObserver`). Avant le calcul en tâche de fond, ce clic gelait la page plus de 6 s sur ce Chromium.
- Le fond flouté de la doc (`backdrop-filter`) est bien présent dans le CSS du build. La minification de Vite 8 (lightningcss) ne garde que la dernière des deux déclarations `backdrop-filter` et `-webkit-backdrop-filter`. Quand le préfixe était en dernier, la version standard disparaissait en prod et Chrome n'affichait plus de flou. Le flou restait visible en dev, où le CSS n'est pas minifié.

En local, il faut installer Chromium une fois : `npx playwright install --only-shell chromium` dans `web/`. Après un échec, `npx playwright show-report` dans `web/` ouvre le rapport HTML, avec la trace de chaque test qui a échoué.

Le rendu de la peinture (`PaintEngine`, `AnimationDirector`) n'a pas de test automatique : on le vérifie à l'œil dans le navigateur.
