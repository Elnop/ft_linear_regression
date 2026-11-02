import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { pick } from '@/features/docs/lib/pick.ts';
import { tokenize } from '@/features/docs/lib/tokenize.ts';

const PICKED: Record<string, string[]> = {
  'parseDataset.ts': ['parseDataset'],
  'estimatePrice.ts': ['estimatePrice'],
  'metrics.ts': ['sumOfSquaredErrors', 'cost', 'r2'],
  'gradientStep.ts': ['gradientStep'],
  'normalize.ts': ['normalizeSamples', 'denormalizeThetas'],
  'trainSteps.ts': ['trainSteps'],
};

test('every core function shown in the documentation is found whole', () => {
  for (const [file, names] of Object.entries(PICKED)) {
    const source = readFileSync(new URL(`../../core/${file}`, import.meta.url), 'utf8');
    for (const name of names) {
      const code = pick(source, name);
      assert.match(code, new RegExp(`function\\*? ${name}\\b`));
      assert.ok(code.endsWith('\n}'), name);
    }
  }
});

test('tokenizing keeps every character', () => {
  const source = readFileSync(new URL('../../core/trainSteps.ts', import.meta.url), 'utf8');
  const code = pick(source, 'trainSteps');
  assert.equal(
    tokenize(code)
      .map((token) => token.text)
      .join(''),
    code,
  );
});
