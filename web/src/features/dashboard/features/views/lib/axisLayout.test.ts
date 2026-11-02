import { expect, test } from 'vitest';
import { axisLayout } from '@/features/dashboard/features/views/lib/axisLayout.ts';
import { chartMapping } from '@/shared/lib/chartMapping.ts';

const chart = chartMapping(1000, 800);
const layout = axisLayout(chart, 15, 12);

test('one grid line and one label per tick', () => {
  expect(layout.kmGrid.map((line) => line.key)).toStrictEqual([0, 50_000, 100_000, 150_000, 200_000, 250_000]);
  expect(layout.priceLabels.map((label) => label.text)).toStrictEqual(['3k', '4k', '5k', '6k', '7k', '8k', '9k']);
});

test('grid lines span the chart area', () => {
  const { area } = chart;
  for (const line of layout.kmGrid) {
    expect(line.y1).toBe(area.y);
    expect(line.y2).toBe(layout.bottom);
    expect(line.x1).toBe(line.x2);
  }
  for (const line of layout.priceGrid) {
    expect(line.x1).toBe(area.x);
    expect(line.x2).toBe(layout.right);
  }
});

test('labels sit under their km line and left of their price line', () => {
  layout.kmLabels.forEach((label, i) => {
    expect(label.x).toBe(layout.kmGrid[i].x1);
    expect(label.y).toBe(layout.bottom + 12 + 15);
  });
  layout.priceLabels.forEach((label, i) => {
    expect(label.x).toBe(chart.area.x - 12);
    expect(label.y > layout.priceGrid[i].y1).toBeTruthy();
  });
});
