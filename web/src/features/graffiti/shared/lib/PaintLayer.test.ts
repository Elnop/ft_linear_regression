import { expect, test } from 'vitest';
import { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import { stepFlow } from '@/features/graffiti/shared/lib/stepFlow.ts';
import { DRY_GLOSS } from '@/features/graffiti/shared/configs/FlowConfig.ts';

test('a dried layer keeps its paint where it is and no longer flows', () => {
  const layer = new PaintLayer({ color: '#ff2bd6', bounds: { x: 0, y: 0, width: 80, height: 240 } }, { at: () => 0.5 });
  layer.depositSplat(40, 40, 14, 6000);
  expect(layer.wet).toBe(true);

  layer.dry();
  expect(layer.wet).toBe(false);
  expect(layer.gloss).toBe(DRY_GLOSS);
  expect(layer.wetMass.every((mass) => mass === 0)).toBe(true);

  const film = Float32Array.from(layer.film);
  stepFlow(layer, 1 / 120);
  expect(layer.film).toEqual(film);
  expect(film.some((thickness) => thickness > 0)).toBe(true);
});
