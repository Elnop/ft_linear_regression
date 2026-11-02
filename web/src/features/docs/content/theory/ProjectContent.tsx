import { Formula } from '@/features/docs/components/presenters/Formula.tsx';
import type { DocStep } from '@/features/docs/DocsTypes.ts';
import { FIGURES } from '@/features/docs/configs/DocFiguresConfig.ts';
import { scientific } from '@/features/docs/lib/scientific.ts';

const { descent, leastSquares } = FIGURES;

export const PROJECT: DocStep[] = [
  {
    label: 'Le projet',
    section: 'Le projet',
    title: 'Normaliser le kilométrage',
    aside: (
      <Formula>{`x_norm = (x − min) / (max − min)      ∈ [0, 1]

après l'entraînement :
θ0 = θ0n − θ1n · min / (max − min)
θ1 = θ1n / (max − min)`}</Formula>
    ),
    children: (
      <>
        <p>
          Les km vont de {FIGURES.kmMin.toLocaleString('fr-FR')} à {FIGURES.kmMax.toLocaleString('fr-FR')}. Le coût est alors des milliards de fois plus courbé selon <code>θ1</code>
          que selon <code>θ0</code> (la moyenne de <code>x²</code> vaut {scientific(FIGURES.meanSquaredKm)}) : aucun α ne convient aux deux.
        </p>
        <p>
          On ramène donc les km dans <code>[0, 1]</code> pour l'entraînement, puis on convertit les θ appris vers les km
          bruts. La prédiction applique ensuite la formule du sujet telle quelle.
        </p>
      </>
    ),
  },
  {
    label: 'Le projet',
    section: 'Le projet',
    title: 'Vérifier le résultat',
    aside: (
      <Formula>{`                  θ0             θ1
moindres carrés   ${leastSquares.theta0.toFixed(9)}  ${leastSquares.theta1.toFixed(12).replace('-', '−')}
descente          ${descent.theta0.toFixed(9)}  ${descent.theta1.toFixed(12).replace('-', '−')}

R² = ${FIGURES.r2.toFixed(3)}`}</Formula>
    ),
    children: (
      <>
        <p>
          La solution exacte des moindres carrés n'est pas utilisée par le programme, mais elle sert de témoin : après
          {FIGURES.iterations.toLocaleString('fr-FR')} itérations à <code>α = {FIGURES.learningRate}</code>, la descente tombe dessus.
        </p>
        <p>
          Le R² indique que la droite explique 73 % de la variance des prix. Le reste dépend de ce que le modèle ignore :
          âge, marque, état.
        </p>
      </>
    ),
  },
];
