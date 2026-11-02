import { expect, test } from 'vitest';
import estimatePriceSource from '@core/estimatePrice.ts?raw';
import gradientStepSource from '@core/gradientStep.ts?raw';
import metricsSource from '@core/metrics.ts?raw';
import normalizeSource from '@core/normalize.ts?raw';
import parseDatasetSource from '@core/parseDataset.ts?raw';
import trainStepsSource from '@core/trainSteps.ts?raw';
import { pick } from '@/features/docs/lib/pick.ts';

const PICKED: [string, string[]][] = [
  [parseDatasetSource, ['parseDataset']],
  [estimatePriceSource, ['estimatePrice']],
  [metricsSource, ['sumOfSquaredErrors', 'cost', 'r2']],
  [gradientStepSource, ['gradientStep']],
  [normalizeSource, ['normalizeSamples', 'denormalizeThetas']],
  [trainStepsSource, ['trainSteps']],
];

test('every core function shown in the documentation is found whole', () => {
  for (const [source, names] of PICKED) {
    for (const name of names) {
      const code = pick(source, name);
      expect(code).toMatch(new RegExp(`function\\*? ${name}\\b`));
      expect(code.endsWith('\n}'), name).toBeTruthy();
    }
  }
});
