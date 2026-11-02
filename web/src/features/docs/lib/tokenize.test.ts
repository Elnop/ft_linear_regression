import { expect, test } from 'vitest';
import source from '@core/trainSteps.ts?raw';
import { pick } from '@/features/docs/lib/pick.ts';
import { tokenize } from '@/features/docs/lib/tokenize.ts';

test('tokenizing keeps every character', () => {
  const code = pick(source, 'trainSteps');
  expect(
    tokenize(code)
      .map((token) => token.text)
      .join(''),
  ).toBe(code);
});
