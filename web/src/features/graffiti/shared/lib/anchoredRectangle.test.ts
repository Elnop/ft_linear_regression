import { expect, test } from 'vitest';
import { anchoredRectangle } from '@/features/graffiti/shared/lib/anchoredRectangle.ts';

const chart = { x: 100, y: 50, width: 800, height: 400 };
const narrower = { x: 20, y: 60, width: 400, height: 800 };

test('a stretched layer keeps its place inside the region', () => {
  const line = { x: 300, y: 150, width: 200, height: 100 };
  expect(anchoredRectangle(line, { region: 'chart', from: chart }, narrower)).toStrictEqual({ x: 120, y: 260, width: 100, height: 200 });
});

test('a pinned layer moves with its pin and keeps its size', () => {
  const dot = { x: 470, y: 220, width: 60, height: 180 };
  const pin = { x: 500, y: 250 };
  expect(anchoredRectangle(dot, { region: 'chart', from: chart, pin }, narrower)).toStrictEqual({ x: 190, y: 430, width: 60, height: 180 });
});

test('an unchanged region leaves the layer where it was painted', () => {
  const line = { x: 300, y: 150, width: 200, height: 100 };
  expect(anchoredRectangle(line, { region: 'chart', from: chart }, chart)).toStrictEqual(line);
});
