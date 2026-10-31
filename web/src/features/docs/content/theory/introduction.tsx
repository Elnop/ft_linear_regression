import { Formula } from '@/features/docs/components/presenters/Formula.tsx';
import type { Step } from '@/features/docs/DocsTypes.ts';

export const INTRODUCTION: Step[] = [
  {
    label: 'Introduction',
    section: 'Introduction',
    title: 'Le machine learning',
    aside: (
      <Formula>{`programmation classique   règles écrites à la main  →  réponse
machine learning          exemples  →  modèle appris  →  réponse`}</Formula>
    ),
    children: (
      <>
        <p>
          Le machine learning, c'est donner à une machine la capacité d'<strong>apprendre</strong> sans la programmer
          de façon explicite.
        </p>
        <p>
          Impossible d'écrire à la main une règle de prix pour chaque voiture possible. À la place, on montre des
          exemples à la machine et elle en déduit la règle.
        </p>
      </>
    ),
  },
  {
    label: 'Introduction',
    section: 'Introduction',
    title: 'Apprentissage supervisé',
    aside: (
      <Formula>{`régression       y continu   prix d'une voiture  ← ce projet
classification   y discret   spam (1) ou non (0)`}</Formula>
    ),
    children: (
      <>
        <p>
          Comme un élève avec un professeur, la machine étudie des exemples dont on connaît la réponse : des paires{' '}
          <code>(x, y)</code> rassemblées dans un tableau, le <strong>dataset</strong>. Elle en tire un modèle,
          la relation qui relie <code>x</code> à <code>y</code>.
        </p>
        <p>
          Prédire un prix, qui peut prendre une infinité de valeurs, est un problème de régression.
          Prédire une catégorie serait un problème de classification.
        </p>
      </>
    ),
  },
];
