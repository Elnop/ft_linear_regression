// .tsx so the browser (component) vitest project runs it: the store needs a real document and ResizeObserver.
import { expect, test } from 'vitest';
import { sceneStore } from '@/shared/sceneStore.ts';

const frames = async (count: number) => {
  for (let k = 0; k < count; k++) await new Promise((resolve) => requestAnimationFrame(resolve));
};

test('the scene follows a root font size change', async () => {
  const root = document.documentElement;
  const before = { fontSize: root.style.fontSize, height: root.style.height };
  try {
    root.style.height = '100vh';
    await frames(4);
    expect(sceneStore.getState().rem).toBe(16);
    root.style.fontSize = '20px';
    await expect.poll(() => sceneStore.getState().rem, { timeout: 1000 }).toBe(20);
  } finally {
    root.style.fontSize = before.fontSize;
    root.style.height = before.height;
  }
});
