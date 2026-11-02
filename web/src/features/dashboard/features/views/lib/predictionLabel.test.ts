import { expect, test } from 'vitest';
import { predictionLabel } from '@/features/dashboard/features/views/lib/predictionLabel.ts';

const frame = { x: 100, y: 50, width: 800, height: 500 };

test('sits up and to the right of the point inside the chart', () => {
  expect(predictionLabel({ x: 400, y: 300 }, frame, 13)).toStrictEqual({ x: 412, y: 288, anchor: 'start' });
});

test('flips to the left near the right edge', () => {
  expect(predictionLabel({ x: 850, y: 300 }, frame, 13)).toStrictEqual({ x: 838, y: 288, anchor: 'end' });
});

test('stays inside the frame when the point is above, below or past it', () => {
  expect(predictionLabel({ x: 400, y: 20 }, frame, 13).y).toBe(50 + 13 + 4);
  expect(predictionLabel({ x: 400, y: 900 }, frame, 13).y).toBe(550 - 4);
  expect(predictionLabel({ x: 5000, y: 300 }, frame, 13).x).toBe(900 - 4);
});
