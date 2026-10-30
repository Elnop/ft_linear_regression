import { DescentFigure } from '@/features/docs/components/presenters/DescentFigure.tsx';
import { Formula } from '@/features/docs/components/presenters/Formula.tsx';
import type { Step } from '@/features/docs/types.ts';

export const DESCENT: Step[] = [
  {
    label: 'Descente de gradient',
    section: 'Descente de gradient',
    title: 'Perdu dans la montagne',
    aside: <DescentFigure />,
    children: (
      <>
        <p>
          Vous êtes perdu en montagne, sans carte, et le refuge est au point le plus bas de la vallée. Le plus simple :
          regarder où la pente descend le plus fort, marcher un peu dans cette direction, puis
          recommencer.
        </p>
        <p>
          La vallée, c'est <code>J</code>. On part de θ au hasard (ici 0), on calcule la pente (la dérivée), on fait un
          petit pas vers le bas, et on répète jusqu'au fond.
        </p>
      </>
    ),
  },
  {
    label: 'Descente de gradient',
    section: 'Descente de gradient',
    title: 'La formule',
    aside: (
      <Formula>{`θ ← θ − α · ∂J/∂θ

pente < 0  →  θ − (négatif)  →  θ augmente
pente > 0  →  θ − (positif)  →  θ diminue`}</Formula>
    ),
    children: (
      <>
        <p>
          À chaque itération, on retire à chaque paramètre la pente multipliée par <code>α</code>, le{' '}
          <strong>learning rate</strong> (toujours positif).
        </p>
        <p>
          Quel que soit le côté de la vallée où l'on démarre, le signe de la dérivée pousse θ vers le minimum.
          L'algorithme ne fait que répéter cette ligne.
        </p>
      </>
    ),
  },
  {
    label: 'Descente de gradient',
    section: 'Descente de gradient',
    title: 'Le learning rate',
    aside: (
      <Formula>{`α trop grand  →  saute par-dessus le minimum, diverge
α trop petit  →  converge, mais très lentement

sur ce dataset (km normalisés) :
α = 0.5  →  converge
α = 3    →  diverge à l'itération 788`}</Formula>
    ),
    children: (
      <>
        <p>
          <code>α</code> règle la taille du pas. Trop grand, on rebondit d'un flanc de la vallée à l'autre, de plus en
          plus haut. Trop petit, il faut un nombre d'itérations énorme.
        </p>
        <p>On ne peut pas le calculer à l'avance, on essaie plusieurs valeurs. Le curseur du mur sert à ça.</p>
      </>
    ),
  },
  {
    label: 'Descente de gradient',
    section: 'Descente de gradient',
    title: 'Calculer le gradient',
    aside: (
      <Formula>{`∂J/∂θ0 = 1/m · Σ ( f(x[i]) − y[i] )
∂J/∂θ1 = 1/m · Σ ( f(x[i]) − y[i] ) · x[i]

tmpθ0 = α · ∂J/∂θ0     θ0 = θ0 − tmpθ0
tmpθ1 = α · ∂J/∂θ1     θ1 = θ1 − tmpθ1`}</Formula>
    ),
    children: (
      <>
        <p>
          Il reste à calculer les dérivées. <code>J</code> est une fonction composée : le carré descend et s'annule avec
          le <code>½</code>, puis on multiplie par la dérivée de l'intérieur, <code>1</code> pour <code>θ0</code> et{' '}
          <code>x[i]</code> pour <code>θ1</code>.
        </p>
        <p>
          On retrouve exactement les formules du sujet. Les deux sont calculées avec les mêmes θ, ceux d'avant
          l'itération : c'est la <strong>mise à jour simultanée</strong>.
        </p>
      </>
    ),
  },
];
