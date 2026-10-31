import { Formula } from '@/features/docs/components/presenters/Formula.tsx';
import type { DocStep } from '@/features/docs/types/DocsTypes.ts';

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
          Les km vont de 22 899 à 240 000. Le gradient de <code>θ1</code>, multiplié par <code>x</code>, est alors des
          milliards de fois plus grand que celui de <code>θ0</code> : aucun α ne convient aux deux.
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
moindres carrés   8499.599649933  −0.021448963592
descente          8499.599649933  −0.021448963592

R² = 0.733`}</Formula>
    ),
    children: (
      <>
        <p>
          La solution exacte des moindres carrés n'est pas utilisée par le programme, mais elle sert de témoin : après
          10 000 itérations à <code>α = 0.5</code>, la descente tombe dessus.
        </p>
        <p>
          Le R² indique que la droite explique 73 % de la variance des prix. Le reste dépend de ce que le modèle ignore :
          âge, marque, état.
        </p>
      </>
    ),
  },
];
