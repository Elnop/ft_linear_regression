# Styles

## Une seule palette

Les trois couleurs de peinture sont définies une fois, en TypeScript, dans `web/src/shared/configs/PaletteConfig.ts` :

| Nom | Valeur | Usage |
|---|---|---|
| `magenta` | `#ff2bd6` | titre, droites, bouton Taguer |
| `cyan` | `#00f0ff` | points, valeurs des chips |
| `acid` | `#e6ff00` | droites divergentes, focus, marqueur du prix |

Le moteur de peinture en a besoin en hexadécimal, et les autocollants les lisent aussi. Le CSS les reçoit par `applyPalette` (`web/src/shared/lib/applyPalette.ts`), que `main.tsx` appelle avant le premier rendu : il pose `--magenta`, `--cyan` et `--acid` sur `:root`. `globals.css` ne les déclare donc pas, et changer une couleur dans `PALETTE` change à la fois la peinture et l'interface.

## Tokens

Les autres couleurs et les polices sont des variables de `web/src/app/globals.css` :

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

- `web/src/app/globals.css` : tokens, reset, scrollbar, classes utilitaires (`.sr-only`, `.glass`, `.label`).
- Une feuille par composant ou par sous-feature, importée par le composant qui l'utilise.
- `web/src/features/dashboard/shared/shared.css` : ce que plusieurs sous-features du dashboard partagent, comme `.dashboard-panel` et `.head-button` (les boutons GRAPHE, DATA et DOC).

Les classes propres à une feature portent son préfixe (`.predict-error`, `.training-hint`, `.readout-chip`, `.readout-metric`, `.price-sticker`, `.dashboard-panel`), pour que deux features ne se marchent pas dessus avec un nom générique. Seules les utilitaires de `globals.css` gardent un nom court (`.label`, `.glass`, `.tape`, `.sr-only`).

Aucune règle n'utilise `!important`. Quand une règle générique l'emporte, on écrit un sélecteur plus précis (`.dataset .dataset-km` face à `.dataset td`, `.documentation .documentation-title` face à `.documentation h2`).

## La scrollbar

`<html>` garde une piste de scrollbar en permanence (`overflow-y: scroll`), fine et sombre (`scrollbar-width: thin`, `scrollbar-color`). Sans cette piste, la scrollbar classique de Windows ou Linux apparaîtrait au moment où la documentation rend la page défilable, c'est-à-dire au début de l'intro : le canvas perdrait sa largeur et l'animation sauterait à la fin. `scrollbar-gutter: stable` a été essayé et ne réservait pas la place avant que la page déborde.

## Tailles

Le texte et les espacements sont en `rem`, jamais en `px`, pour suivre la taille de police choisie par l'utilisateur dans son navigateur. Le texte est aussi fluide : chaque niveau grandit avec la largeur de la fenêtre, entre 320 et 1920 px.

Les niveaux sont définis une fois, en TypeScript, dans `web/src/shared/configs/TypeScaleConfig.ts` (tailles en px pour une racine de 16 px, `min` à 320 px de large, `max` à 1920 px) :

| Variable | min → max | Usage |
|---|---|---|
| `--text-xs` | 12 → 13 px | étiquettes (`.label`), pied de page, graduations des figures |
| `--text-sm` | 13 → 15 px | formules, unités, messages d'erreur, code |
| `--text-base` | 14 → 16 px | texte courant |
| `--text-md` | 16 → 20 px | valeurs des chips, boutons, textes d'aide |
| `--text-lg` | 20 → 26 px | titres de panneau |
| `--text-xl` | 26 → 34 px | prix prédit |
| `--text-2xl` | 32 → 48 px | chiffre du sticker du prix |
| `--text-display` | 30 → 48 px | titre de la documentation |

Comme pour la palette, `applyTypeScale` (`web/src/shared/lib/applyTypeScale.ts`) pose les variables `--text-*` sur `:root` et `main.tsx` l'appelle après `applyPalette`, avant le premier rendu. `globals.css` ne les déclare donc pas. Chaque variable vaut un `clamp(min rem, pente vw + base rem, max rem)` calculé par `fluidClamp` (`web/src/shared/lib/typeScale.ts`). Le code qui a besoin de la même taille en nombre, comme les étiquettes d'un graphe SVG, appelle `textSize(step, largeur, rem)` : c'est la même formule, donc le CSS et le TS ne peuvent pas diverger.

Les espacements sont l'échelle `--space-*` de `globals.css`, nommée d'après la valeur en px à 16 px : `--space-2` (0,125 rem), `-4`, `-6`, `-8`, `-10`, `-12`, `-16`, `-20`, `-24`, `-32` et `--space-48` (3 rem). Les marges, paddings, gaps et rayons les utilisent.

Restent en `px`, parce qu'ils doivent garder la même épaisseur quel que soit le texte :

- les bordures et les traits SVG (`stroke-width`) ;
- le contour de focus (3 px) ;
- les ombres et les flous (`box-shadow`, `blur`, `backdrop-filter`) ;
- le scotch (`.tape`) et la technique `.sr-only` (1 px).

On ne pose jamais `font-size` sur `<html>`. Les media queries résolvent leurs `em` avec la taille de police initiale du navigateur, et `readRem()` lit la taille de la racine : les deux ne sont égaux que si rien ne touche à `html`. `web/src/shared/configs/SceneConfig.test.ts` échoue si une feuille de style pose `font-size` ou `font` sur `html` ou `:root`.

Deux tests dans `web/src/shared/configs/TypeScaleConfig.test.ts` gardent la règle :

- aucune feuille de style ne donne une taille de texte en `px` ou en `vw` nu ;
- aucun composant de `web/src/features/dashboard` ou `web/src/features/docs` n'écrit une taille de police en dur (`fontSize={12}`, `fontSize="12"`).

## Valeurs partagées entre TS et CSS

Les largeurs que le TS connaît ne sont pas recopiées dans le CSS :

- `ASIDE_WIDTH_REM` (`web/src/shared/configs/SceneConfig.ts`, 21,25) arrive en variable `--aside-width` (en `rem`), posée par `DashboardLayout` avec `--dashboard-top` et `--dashboard-padding`, et `.dashboard-aside` la lit ;
- `HEAD_WIDTH_REM` (`web/src/shared/configs/SceneConfig.ts`, 39,5) arrive en variable `--head-width`, qui borne la largeur de l'en-tête (chips et boutons) en mode large. `titleLayout` réserve cette largeur plus 1,5 rem à droite du titre peint, donc l'en-tête ne couvre jamais le titre. Mesuré dans Chromium entre 1024 et 1920 px, l'en-tête fait au plus 39 rem (police à 16 px, 1920 px) ; avec une police de 20 px le titre est plus petit, 1280 px de large n'en laissant que 384 px ;
- `STICKER_WIDTH_REM` est la largeur en style du sticker du prix, dans `WallMarker.tsx`. Le sticker n'est plus réduit à 0,72 en mode compact : cette échelle faisait passer son texte sous 12 px ;
- `COMPACT_BELOW_REM` (`web/src/features/dashboard/shared/DashboardLayoutConfig.ts`) est la largeur du graphe, en `rem`, sous laquelle il passe en version compacte.

Le passage en mode large, `WIDE_EM = 64` (`web/src/shared/configs/SceneConfig.ts`), ne peut pas suivre ce chemin, parce qu'une media query ne lit pas de variable CSS. Les feuilles écrivent donc `@media (max-width: 63.99em)`, et `web/src/shared/configs/SceneConfig.test.ts` vérifie que chaque media query de largeur bascule exactement à `WIDE_EM`. En `em`, le seuil suit la taille de police du navigateur : avec une police de 20 px, le mode large commence à 1280 px.
