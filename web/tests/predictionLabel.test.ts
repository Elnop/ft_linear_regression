import assert from 'node:assert/strict';
import { test } from 'node:test';
import { predictionLabel } from '@/features/dashboard/features/views/lib/predictionLabel.ts';

const frame = { x: 100, y: 50, width: 800, height: 500 };

test('sits up and to the right of the point inside the chart', () => {
  assert.deepEqual(predictionLabel({ x: 400, y: 300 }, frame, 13), { x: 412, y: 288, anchor: 'start' });
});

test('flips to the left near the right edge', () => {
  assert.deepEqual(predictionLabel({ x: 850, y: 300 }, frame, 13), { x: 838, y: 288, anchor: 'end' });
});

test('stays inside the frame when the point is above, below or past it', () => {
  assert.equal(predictionLabel({ x: 400, y: 20 }, frame, 13).y, 50 + 13 + 4);
  assert.equal(predictionLabel({ x: 400, y: 900 }, frame, 13).y, 550 - 4);
  assert.equal(predictionLabel({ x: 5000, y: 300 }, frame, 13).x, 900 - 4);
});
