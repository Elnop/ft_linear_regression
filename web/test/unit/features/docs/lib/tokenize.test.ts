import { expect, test } from 'vitest';
import source from '@core/trainSteps.ts?raw';
import { tokenize } from '@/features/docs/lib/tokenize.ts';

test('tokenizing keeps every character', () => {
  expect(
    tokenize(source)
      .map((token) => token.text)
      .join(''),
  ).toBe(source);
});
