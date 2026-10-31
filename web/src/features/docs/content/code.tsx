import csvSource from '@core/parseDataset.ts?raw';
import gradientSource from '@core/gradientStep.ts?raw';
import hypothesisSource from '@core/estimatePrice.ts?raw';
import metricsSource from '@core/metrics.ts?raw';
import normalizeSource from '@core/normalize.ts?raw';
import trainSource from '@core/train.ts?raw';
import { Code } from '@/features/docs/components/presenters/Code.tsx';
import { pick } from '@/features/docs/lib/source.ts';
import type { DocStep } from '@/features/docs/types/DocsTypes.ts';

export const CODE: DocStep[] = [
  {
    label: 'core/parseDataset.ts',
    section: 'Le modèle',
    title: 'Lire le dataset',
    aside: <Code code={pick(csvSource, 'parseDataset')} />,
    children: (
      <>
        <p>
          Reçoit le texte du CSV, pas un chemin : <code>core/</code> n'utilise aucune API Node. La CLI lit le fichier,
          le web l'importe au build.
        </p>
        <p>Toute ligne invalide lève une erreur avec son numéro. La CLI l'affiche sur la sortie d'erreur et quitte avec le code 1.</p>
      </>
    ),
  },
  {
    label: 'core/estimatePrice.ts',
    section: 'Le modèle',
    title: 'Estimer un prix',
    aside: <Code code={pick(hypothesisSource, 'estimatePrice')} />,
    children: (
      <>
        <p>
          La droite <code>θ0 + θ1 × km</code>, telle que le sujet l'écrit.
        </p>
        <p>
          C'est la seule fonction qu'appelle <code>npm run predict</code>. Sur le mur, elle place aussi le marqueur de
          prix.
        </p>
      </>
    ),
  },
  {
    label: 'core/metrics.ts',
    section: 'Le modèle',
    title: 'Coût et précision',
    aside: <Code code={`${pick(metricsSource, 'sumOfSquaredErrors')}\n\n${pick(metricsSource, 'cost')}\n\n${pick(metricsSource, 'r2')}`} />,
    children: (
      <>
        <p>
          Le coût <code>J</code> est l'erreur quadratique moyenne divisée par 2 : c'est ce que la descente minimise, et la
          courbe du panneau COÛT.
        </p>
        <p>
          Le R² mesure la part de la variance des prix expliquée par la droite : 0.733 sur ce dataset.
          RMSE et MAE donnent l'erreur typique en euros.
        </p>
      </>
    ),
  },
  {
    label: 'core/gradientStep.ts',
    section: "L'entraînement",
    title: 'Une étape de descente',
    aside: <Code code={pick(gradientSource, 'gradientStep')} />,
    children: (
      <>
        <p>
          Les formules imposées par le sujet. Une seule boucle accumule les deux sommes d'erreurs, puis{' '}
          <code>tmpθ0</code> et <code>tmpθ1</code> sont calculés.
        </p>
        <p>
          <strong>Mise à jour simultanée</strong> : les deux sommes utilisent les mêmes θ, ceux d'avant l'itération. La
          fonction renvoie un nouvel objet, l'ancien n'est jamais modifié.
        </p>
      </>
    ),
  },
  {
    label: 'core/normalize.ts',
    section: "L'entraînement",
    title: 'Normaliser le kilométrage',
    aside: <Code code={`${pick(normalizeSource, 'normalizeSamples')}\n\n${pick(normalizeSource, 'denormalizeThetas')}`} />,
    children: (
      <>
        <p>
          Min-max sur les km pour l'entraînement, puis conversion des θ appris vers le kilométrage brut.
        </p>
        <p>
          Les θ sauvegardés s'utilisent donc tels quels dans <code>estimatePrice</code>.
        </p>
      </>
    ),
  },
  {
    label: 'core/train.ts',
    section: "L'entraînement",
    title: 'La boucle de descente',
    aside: <Code code={pick(trainSource, 'trainSteps')} />,
    children: (
      <>
        <p>
          Un générateur : il produit l'état après chaque itération (θ sur km brut et coût). L'itération 0 est l'état
          initial, <code>θ0 = θ1 = 0</code>. Il s'arrête dès qu'un θ devient infini : c'est la divergence.
        </p>
        <p>
          La CLI le parcourt jusqu'au bout et écrit <code>model.json</code>. Cette page consomme le{' '}
          <strong>même générateur</strong> et peint un passage aux itérations 0, 1, 2, 4, 8… : la droite finale est
          exactement celle de la CLI.
        </p>
      </>
    ),
  },
];
