import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import { stepFlow } from '@/features/graffiti/shared/lib/stepFlow.ts';

function totals(layer: PaintLayer) {
  let mass = 0;
  let weightedY = 0;
  for (let i = 0; i < layer.film.length; i++) {
    mass += layer.film[i];
    weightedY += layer.film[i] * Math.floor(i / layer.filmWidth);
  }
  return { mass, centerY: weightedY / mass };
}

test('a heavy blob drips down without creating or losing paint', () => {
  const layer = new PaintLayer({ color: '#ff2bd6', bounds: { x: 0, y: 0, width: 80, height: 240 } }, { at: () => 0.5 });
  layer.depositSplat(40, 40, 14, 6000);
  const before = totals(layer);
  for (let step = 0; step < 240; step++) stepFlow(layer, 1 / 120);
  const after = totals(layer);
  assert.ok(Math.abs(after.mass - before.mass) / before.mass < 1e-4, `${before.mass} → ${after.mass}`);
  assert.ok(after.centerY > before.centerY, `${before.centerY} → ${after.centerY}`);
});
