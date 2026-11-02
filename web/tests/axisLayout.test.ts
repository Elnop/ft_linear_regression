import assert from 'node:assert/strict';
import { test } from 'node:test';
import { axisLayout } from '@/features/dashboard/features/views/lib/axisLayout.ts';
import { chartMapping } from '@/shared/lib/chartMapping.ts';

const chart = chartMapping(1000, 800);
const layout = axisLayout(chart, 15, 12);

test('one grid line and one label per tick', () => {
  assert.deepEqual(layout.kmGrid.map((line) => line.key), [0, 50_000, 100_000, 150_000, 200_000, 250_000]);
  assert.deepEqual(layout.priceLabels.map((label) => label.text), ['3k', '4k', '5k', '6k', '7k', '8k', '9k']);
});

test('grid lines span the chart area', () => {
  const { area } = chart;
  for (const line of layout.kmGrid) {
    assert.equal(line.y1, area.y);
    assert.equal(line.y2, layout.bottom);
    assert.equal(line.x1, line.x2);
  }
  for (const line of layout.priceGrid) {
    assert.equal(line.x1, area.x);
    assert.equal(line.x2, layout.right);
  }
});

test('labels sit under their km line and left of their price line', () => {
  layout.kmLabels.forEach((label, i) => {
    assert.equal(label.x, layout.kmGrid[i].x1);
    assert.equal(label.y, layout.bottom + 12 + 15);
  });
  layout.priceLabels.forEach((label, i) => {
    assert.equal(label.x, chart.area.x - 12);
    assert.ok(label.y > layout.priceGrid[i].y1);
  });
});
