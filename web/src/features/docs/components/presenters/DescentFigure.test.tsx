import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { DescentFigure } from '@/features/docs/components/presenters/DescentFigure.tsx';

const VIEWBOX_WIDTH = 400;

async function renderedLabelSizes(width: number): Promise<number[]> {
  const screen = await render(
    <div style={{ width: `${width}px` }}>
      <DescentFigure />
    </div>,
  );
  const svg = screen.container.querySelector('svg');
  const labels = Array.from(screen.container.querySelectorAll('.figure-label'));
  expect(svg).not.toBeNull();
  expect(labels.length).toBeGreaterThan(0);
  const scale = (svg?.getBoundingClientRect().width ?? 0) / VIEWBOX_WIDTH;
  return labels.map((label) => parseFloat(getComputedStyle(label).fontSize) * scale);
}

test('the figure labels never render under 12px', async () => {
  for (const width of [280, 520]) {
    for (const size of await renderedLabelSizes(width)) expect(size).toBeGreaterThanOrEqual(12 - 0.01);
  }
});

test('the figure labels follow the root font size', async () => {
  const root = document.documentElement;
  const previous = root.style.fontSize;
  root.style.fontSize = '20px';
  try {
    for (const size of await renderedLabelSizes(520)) expect(size).toBeGreaterThanOrEqual(15 - 0.01);
  } finally {
    root.style.fontSize = previous;
  }
});
