import { expect, test } from 'vitest';
import { sceneFor } from '@/shared/lib/sceneFor.ts';
import { HEAD_WIDTH_REM } from '@/shared/configs/SceneConfig.ts';

test('the wide layout starts at 64rem', () => {
  expect(sceneFor(1100, 800, 16).wide).toBe(true);
  expect(sceneFor(1100, 800, 20).wide).toBe(false);
});

test('the padding is bounded in rem', () => {
  expect(sceneFor(1600, 900, 16).padding).toBe(44);
  expect(sceneFor(2000, 900, 20).padding).toBe(55);
  expect(sceneFor(400, 800, 20).padding).toBe(20);
});

test('the chart leaves room for a larger aside', () => {
  expect(sceneFor(1600, 900, 20).chart.area.width).toBeLessThan(sceneFor(1600, 900, 16).chart.area.width);
});

test('scene.rem echoes its input', () => {
  expect(sceneFor(1600, 900, 18).rem).toBe(18);
});

const MEASURED_HEAD_PX: [width: number, rem: number, head: number][] = [
  [1280, 16, 607],
  [1280, 20, 723],
  [1920, 16, 625],
  [1920, 20, 765],
];

test.each(MEASURED_HEAD_PX)('at %ipx with a %ipx root, the painted title ends left of the header', (width, rem, head) => {
  const { title, padding } = sceneFor(width, 900, rem);
  const right = title.rectangle.x + title.rectangle.width;
  expect(right).toBeLessThan(width - padding - head);
  expect(right).toBeLessThan(width - padding - HEAD_WIDTH_REM * rem);
  expect(head).toBeLessThanOrEqual(HEAD_WIDTH_REM * rem);
});
