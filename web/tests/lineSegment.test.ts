import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chartMapping } from '@/shared/lib/chartMapping.ts';
import { lineSegment } from '@/shared/lib/lineSegment.ts';

const chart = chartMapping(1000, 800);
const inside = (x: number, y: number) =>
  x >= chart.area.x - 1e-9 && x <= chart.area.x + chart.area.width + 1e-9 && y >= chart.area.y - 1e-9 && y <= chart.area.y + chart.area.height + 1e-9;

test('maps the domain corners to the chart area corners', () => {
  assert.deepEqual(chart.point(0, 9000), { x: chart.area.x, y: chart.area.y });
  assert.deepEqual(chart.point(250000, 3000), { x: chart.area.x + chart.area.width, y: chart.area.y + chart.area.height });
});

test('clips the regression line to the chart area', () => {
  const segment = lineSegment({ theta0: 8499.6, theta1: -0.0214 }, chart, chart.area);
  assert.ok(segment);
  for (const point of segment) assert.ok(inside(point.x, point.y));
});

test('draws nothing for a line outside the chart or non finite thetas', () => {
  assert.equal(lineSegment({ theta0: 50000, theta1: 0 }, chart, chart.area), null);
  assert.equal(lineSegment({ theta0: Infinity, theta1: 0 }, chart, chart.area), null);
});
