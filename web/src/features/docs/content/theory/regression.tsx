import { Formula } from '@/features/docs/components/presenters/Formula.tsx';
import type { Step } from '@/features/docs/DocsTypes.ts';

export const REGRESSION: Step[] = [
  {
    label: 'Apprentissage supervisé',
    section: 'Régression linéaire',
    title: 'Les 4 étapes',
    aside: (
      <Formula>{`1. un dataset    (x, y)
2. un modèle     f(x), avec des paramètres θ
3. une fonction coût   J(θ)
4. un algorithme qui minimise J`}</Formula>
    ),
    children: (
      <>
        <p>
          Tout problème d'apprentissage supervisé se résout avec les quatre mêmes briques. La vidéo conseille de
          les écrire sur papier avant de coder, avec les dimensions du dataset.
        </p>
        <p>Ici : le prix d'une voiture à partir de son kilométrage. La suite les prend dans l'ordre.</p>
      </>
    ),
  },
  {
    label: 'Étape 1',
    section: 'Régression linéaire',
    title: 'Le dataset',
    aside: (
      <Formula>{`m = 24   exemples (lignes)
n = 1    feature  (le km)

x[1] = 240 000 km   y[1] = 3 650 €
x[2] = 139 800 km   y[2] = 3 800 €
…`}</Formula>
    ),
    children: (
      <>
        <p>
          <code>data.csv</code> contient 24 voitures. Chaque ligne est un exemple : une feature <code>x</code>{' '}
          (le kilométrage) et une target <code>y</code> (le prix).
        </p>
        <p>
          On note <code>m</code> le nombre d'exemples, <code>n</code> le nombre de features, et <code>x[i]</code>,{' '}
          <code>y[i]</code> le i-ème exemple.
        </p>
      </>
    ),
  },
  {
    label: 'Étape 2',
    section: 'Régression linéaire',
    title: 'Le modèle',
    aside: <Formula>{`f(x) = θ0 + θ1 · x`}</Formula>,
    children: (
      <>
        <p>
          On impose à la machine la forme du modèle : une droite. <code>θ0</code> est le prix à 0 km, <code>θ1</code> la
          variation du prix par km.
        </p>
        <p>
          La machine ne connaît pas ces paramètres : c'est à elle de les trouver. Elle part de <code>θ0 = θ1 = 0</code>,
          une droite plate à 0 €, très loin des points.
        </p>
      </>
    ),
  },
  {
    label: 'Étape 3',
    section: 'Régression linéaire',
    title: "Mesurer l'erreur",
    aside: (
      <Formula>{`erreur[i] = f(x[i]) − y[i]

prix réel   6 000 €
prédit      5 000 €   → erreur −1 000
prédit      7 000 €   → erreur +1 000
au carré               → 1 000 000 dans les deux cas`}</Formula>
    ),
    children: (
      <>
        <p>
          Pour chaque voiture, l'erreur est l'écart entre le prix prédit et le prix réel. Elle peut être négative : on
          la met <strong>au carré</strong> pour que seule sa taille compte.
        </p>
        <p>Le carré pénalise aussi davantage les grosses erreurs que les petites.</p>
      </>
    ),
  },
  {
    label: 'Étape 3',
    section: 'Régression linéaire',
    title: 'La fonction coût',
    aside: <Formula>{`J(θ0, θ1) = 1/(2m) · Σ ( f(x[i]) − y[i] )²`}</Formula>,
    children: (
      <>
        <p>
          On résume toutes ces erreurs en un seul nombre : la moyenne des erreurs au carré,
          l'<strong>erreur quadratique moyenne</strong> (MSE). Le <code>½</code> sert seulement à simplifier la dérivée.
        </p>
        <p>
          <code>J</code> ne dépend que de <code>θ0</code> et <code>θ1</code> : le dataset, lui, ne change pas. Trouver la
          meilleure droite revient à trouver les θ qui rendent <code>J</code> minimal.
        </p>
      </>
    ),
  },
  {
    label: 'Étape 4',
    section: 'Régression linéaire',
    title: 'Minimiser le coût',
    aside: (
      <Formula>{`moindres carrés    J'(θ) = 0, résolu d'un coup
descente de gradient   petits pas, répétés`}</Formula>
    ),
    children: (
      <>
        <p>
          <code>J</code> est une somme de carrés : sa courbe est un bol (une fonction convexe), avec un
          seul minimum.
        </p>
        <p>
          On peut le trouver directement avec les moindres carrés (là où la dérivée s'annule), mais ça
          demande d'inverser une matrice, beaucoup trop coûteux avec des millions d'exemples. En machine learning on
          utilise la descente de gradient, et le sujet l'impose.
        </p>
      </>
    ),
  },
];
