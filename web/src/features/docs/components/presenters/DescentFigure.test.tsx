import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { DescentFigure } from '@/features/docs/components/presenters/DescentFigure.tsx';

async function labelHeights(width: number): Promise<number[]> {
  const screen = await render(
    <div style={{ width: `${width}px` }}>
      <DescentFigure />
    </div>,
  );
  const labels = Array.from(screen.container.querySelectorAll('.figure-label'));
  expect(labels.length).toBeGreaterThan(0);
  return labels.map((label) => label.getBoundingClientRect().height);
}

test('the figure labels never render under 12px', async () => {
  for (const width of [280, 520]) {
    for (const height of await labelHeights(width)) expect(height).toBeGreaterThanOrEqual(12);
  }
});
