import { afterEach, beforeAll, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { WallMarker } from '@/features/dashboard/features/prediction/components/presenters/WallMarker.tsx';
import { applyTypeScale } from '@/shared/lib/applyTypeScale.ts';

const root = document.documentElement;

const SPACES: Record<number, string> = { 6: '0.375rem', 8: '0.5rem', 10: '0.625rem', 12: '0.75rem', 16: '1rem' };

beforeAll(() => {
  applyTypeScale(root);
  for (const [step, value] of Object.entries(SPACES)) root.style.setProperty(`--space-${step}`, value);
});
afterEach(() => {
  root.style.fontSize = '';
});

async function renderMarker(props: { x: number; width: number; rem: number; price: number }) {
  const screen = await render(<WallMarker at={{ x: props.x, y: 500 }} price={props.price} axisY={700} width={props.width} height={900} rem={props.rem} />);
  const sticker = screen.container.querySelector<HTMLElement>('.price-sticker');
  if (!sticker) throw new Error('the sticker is not rendered');
  return sticker;
}

test('the sticker grows with the root size', async () => {
  root.style.fontSize = '20px';
  const sticker = await renderMarker({ x: 400, width: 1600, rem: 20, price: 8000 });
  expect(Math.abs(sticker.offsetWidth - 12.875 * 20)).toBeLessThanOrEqual(1);
});

test('a long price fits in the sticker at 1920px', async () => {
  const sticker = await renderMarker({ x: 400, width: 1920, rem: 16, price: 99999 });
  const price = sticker.querySelector<HTMLElement>('.price-sticker-price span');
  if (!price) throw new Error('the price is not rendered');
  expect(price.scrollWidth).toBeLessThanOrEqual(sticker.offsetWidth);
});

test('the sticker flips near the right edge', async () => {
  const width = 1200;
  const sticker = await renderMarker({ x: width - 40, width, rem: 16, price: 8000 });
  expect(parseFloat(sticker.style.left)).toBeLessThan(width - 40);
});
