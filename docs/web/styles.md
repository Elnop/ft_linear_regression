# Styles

## Une seule palette

Les trois couleurs de peinture sont définies une fois, en TypeScript, dans `shared/configs/PaletteConfig.ts` :

| Nom | Valeur | Usage |
|---|---|---|
| `magenta` | `#ff2bd6` | titre, droites, bouton Taguer |
| `cyan` | `#00f0ff` | points, valeurs des chips |
| `acid` | `#e6ff00` | droites divergentes, focus, marqueur du prix |

Le moteur de peinture en a besoin en hexadécimal, et les autocollants les lisent aussi. Le CSS les reçoit par `applyPalette` (`shared/lib/applyPalette.ts`), que `main.tsx` appelle avant le premier rendu : il pose `--magenta`, `--cyan` et `--acid` sur `:root`. `globals.css` ne les déclare donc pas, et changer une couleur dans `PALETTE` change à la fois la peinture et l'interface.

## Tokens

Les autres couleurs et les polices sont des variables de `app/globals.css` :

| Token | Rôle |
|---|---|
| `--background` | fond de la page |
| `--ink` | texte |
| `--ink-dimmed` | texte secondaire |
| `--danger` | divergence |
| `--danger-text` | texte d'erreur, plus clair que `--danger` pour rester lisible sur fond sombre |
| `--glass`, `--glass-line` | fond et bord des panneaux de verre |
| `--panel` | fond opaque sombre (graphe, dataset) |
| `--on-accent` | texte posé sur une couleur vive (boutons, sticker du prix) |
| `--monospace`, `--marker`, `--anton` | polices |

La coloration du code de la documentation a ses propres variables, déclarées sur `.documentation-code` dans `code.css` (`--syntax-number`, `--syntax-call`), à côté des couleurs de la palette qu'elle réutilise.

Les nuances de `--ink` ne sont pas recopiées en `rgba` : elles passent par `color-mix(in srgb, var(--ink) X%, transparent)`. C'est le cas des grilles et des traits à la craie des axes, et de la ligne de base du coût. Ces traits sont dessinés en SVG, mais leur couleur vient d'une classe CSS (`wall-axes-grid`, `wall-axes-chalk`, `cost-baseline`), pas d'un attribut écrit dans le TSX.

## Organisation des feuilles

- `app/globals.css` : tokens, reset, scrollbar, classes utilitaires (`.sr-only`, `.glass`, `.label`).
- Une feuille par composant ou par sous-feature, importée par le composant qui l'utilise.
- `features/dashboard/shared/shared.css` : ce que plusieurs sous-features du dashboard partagent, comme `.dashboard-panel` et `.head-button` (les boutons GRAPHE, DATA et DOC).

Les classes propres à une feature portent son préfixe (`.predict-error`, `.training-hint`, `.readout-chip`, `.readout-metric`, `.price-sticker`, `.dashboard-panel`), pour que deux features ne se marchent pas dessus avec un nom générique. Seules les utilitaires de `globals.css` gardent un nom court (`.label`, `.glass`, `.tape`, `.sr-only`).

Aucune règle n'utilise `!important`. Quand une règle générique l'emporte, on écrit un sélecteur plus précis (`.dataset .dataset-km` face à `.dataset td`, `.documentation .documentation-title` face à `.documentation h2`).

## La scrollbar

`<html>` garde une piste de scrollbar en permanence (`overflow-y: scroll`), fine et sombre (`scrollbar-width: thin`, `scrollbar-color`). Sans cette piste, la scrollbar classique de Windows ou Linux apparaîtrait au moment où la documentation rend la page défilable, c'est-à-dire au début de l'intro : le canvas perdrait sa largeur et l'animation sauterait à la fin. `scrollbar-gutter: stable` a été essayé et ne réservait pas la place avant que la page déborde.

## Valeurs partagées entre TS et CSS

Les largeurs que le TS connaît ne sont pas recopiées dans le CSS :

- `ASIDE_WIDTH` (`shared/configs/SceneConfig.ts`) arrive en variable `--aside-width`, posée par `DashboardLayout` avec `--dashboard-top` et `--dashboard-padding`, et `.dashboard-aside` la lit ;
- `STICKER_WIDTH` est la largeur en style du sticker du prix, dans `WallMarker.tsx`.

Le passage en mode large, `WIDE = 1024`, ne peut pas suivre ce chemin, parce qu'une media query ne lit pas de variable CSS. Les feuilles écrivent donc `@media (max-width: 1023px)`, et `web/src/shared/configs/SceneConfig.test.ts` vérifie que chaque media query de largeur bascule exactement à `WIDE`.
