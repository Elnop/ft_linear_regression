import { expect, test } from 'vitest';
import raw from '@dataset?raw';
import { parseDataset } from '@core/parseDataset.ts';
import { docFigures } from '@/features/docs/lib/docFigures.ts';
import { scientific } from '@/features/docs/lib/scientific.ts';

test('scientific notation the french way', () => {
  expect(scientific(docFigures(parseDataset(raw)).meanSquaredKm)).toBe('1,3 × 10¹⁰');
  expect(scientific(0.00042)).toBe('4,2 × 10⁻⁴');
});
