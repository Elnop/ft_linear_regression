# Travailler sur ce projet

Régression linéaire en TypeScript : `core/` (l'algorithme, sans Node ni DOM), `cli/` (train, predict, precision) et `web/` (app Vite + React qui anime l'entraînement). Les conventions sont vérifiées par des outils. `docs/web/architecture.md` explique l'organisation du web et `docs/web/verifications.md` chaque règle avec l'outil qui la fait respecter.

## Avant de dire qu'un changement est fini

Lancer `npm run check` : `brutal-check` lance tous les contrôles décrits dans `docs/web/verifications.md` et nomme ceux qui échouent. Chaque message dit quoi changer. Puis `npm test`, et `npm run e2e` quand le changement se voit à l'écran.

## Conventions à connaître d'abord

- `web/src/app/` compose les features, `web/src/features/` a un dossier par feature, `web/src/shared/` un dossier par concept pour le code que plusieurs features utilisent. Une couche n'importe que les couches en dessous, et une feature n'importe jamais une autre feature.
- Un composant est soit un orchestrateur (`XContainer`, `XLayout`, `XPage`), qui compose des presenters et lit seul l'état par des hooks, soit un presenter qui ne reçoit que des props. `web/src/app/` importe les orchestrateurs d'une feature, jamais ses presenters.
- Les styles sont dans une feuille par feature, et une couleur est un `var()` d'un token de `web/src/app/globals.css`.
- Un test unitaire est dans `web/test/unit/`, au chemin de sa source sous `web/src/`, et n'importe de `src/` que sa source et des fichiers `xConfig.ts` ou `xTypes.ts`. Un helper partagé par plusieurs tests va dans `web/test/support/` (alias `@test-support/`). Les tests e2e sont dans `web/test/e2e/` (alias `@test-e2e/`).
- `core/` n'importe ni package, ni module `node:`, ni `cli/`, ni `web/`.
- Pas de commentaires, pas d'import relatif (`@/`, `@core/`, `@dataset` à la place), pas d'`index.ts`.

## Quand un outil brutalway gêne

Les contrôles et leurs configs viennent de [brutalway](https://github.com/Elnop/brutalway). Quand l'un d'eux refuse du code valide, laisse passer un cas qu'il devrait attraper, plante, ou affiche un message qui ne dit pas quoi changer, ne le contourne pas en silence avec un `oxlint-disable` ou une règle coupée. Dire à l'utilisateur ce qui bloque et proposer de le signaler à brutalway, avec un brouillon (le paquet et sa version, le plus petit code qui montre le problème, le message, ce qui était attendu), puis attendre son accord avant d'ouvrir quoi que ce soit.
