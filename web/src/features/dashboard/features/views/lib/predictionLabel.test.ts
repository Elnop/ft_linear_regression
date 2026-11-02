import { expect, test } from 'vitest';
import { predictionLabel } from '@/features/dashboard/features/views/lib/predictionLabel.ts';

const frame = { x: 100, y: 50, width: 800, height: 500 };

test('sits up and to the right of the point inside the chart', () => {
  expect(predictionLabel({ x: 400, y: 300 }, frame, 13, 120)).toStrictEqual({ x: 412, y: 288, anchor: 'start' });
});

test('flips to the left when the label would cross the right edge', () => {
  expect(predictionLabel({ x: 850, y: 300 }, frame, 13, 120)).toStrictEqual({ x: 838, y: 288, anchor: 'end' });
  expect(predictionLabel({ x: 700, y: 300 }, frame, 13, 200).anchor).toBe('end');
  expect(predictionLabel({ x: 700, y: 300 }, frame, 13, 150).anchor).toBe('start');
});

test('stays inside the frame when the point is above, below or past it', () => {
  expect(predictionLabel({ x: 400, y: 20 }, frame, 13, 120).y).toBe(50 + 13 + 4);
  expect(predictionLabel({ x: 400, y: 900 }, frame, 13, 120).y).toBe(550 - 4);
  expect(predictionLabel({ x: 5000, y: 300 }, frame, 13, 120).x).toBe(900 - 4);
});

test('keeps a long label whole inside a narrow chart', () => {
  const narrow = { x: 40, y: 50, width: 230, height: 300 };
  for (const x of [60, 150, 260]) {
    const label = predictionLabel({ x, y: 200 }, narrow, 15, 172);
    const left = label.anchor === 'start' ? label.x : label.x - 172;
    expect(left).toBeGreaterThanOrEqual(narrow.x);
    expect(left + 172).toBeLessThanOrEqual(narrow.x + narrow.width);
  }
});
