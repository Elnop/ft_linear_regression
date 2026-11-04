import { expect, openApp, test } from '@e2e/fixtures.ts';

declare global {
  interface Window {
    webglDraws: number;
  }
}

function trainEnabled() {
  return !document.querySelector('.button-train')?.hasAttribute('disabled');
}

test('without WebGL the chart view is shown from the start', { tag: '@paintless' }, async ({ page }) => {
  await openApp(page);
  await page.waitForFunction(trainEnabled);
  expect(await page.getByRole('button', { name: /GRAPHE/u }).getAttribute('aria-pressed')).toBe('true');
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('with reduced motion the final state is painted at once, with no skip button', { tag: '@painting' }, async ({ page }) => {
    await openApp(page);
    await page.waitForFunction(trainEnabled, null, { timeout: 10_000 });
    expect(await page.getByRole('button', { name: /PASSER/u }).count()).toBe(0);
    expect(await page.getByRole('button', { name: /GRAPHE/u }).getAttribute('aria-pressed')).toBe('false');
  });

  test('with reduced motion the painted wall is dry and stops drawing once shown', { tag: '@painting' }, async ({ page }) => {
    await page.addInitScript(() => {
      window.webglDraws = 0;
      const original: unknown = Object.getOwnPropertyDescriptor(WebGL2RenderingContext.prototype, 'drawArrays')?.value;
      if (typeof original !== 'function') throw new Error('WebGL2RenderingContext.drawArrays is missing');
      WebGL2RenderingContext.prototype.drawArrays = function (...args) {
        window.webglDraws += 1;
        Reflect.apply(original, this, args);
      };
    });
    function drawCount() {
      return page.evaluate(() => window.webglDraws);
    }
    await openApp(page);
    await page.waitForFunction(trainEnabled, null, { timeout: 10_000 });
    await page.waitForTimeout(500);
    const shown = await drawCount();
    expect(shown).toBeGreaterThan(0);
    await page.waitForTimeout(2000);
    expect(await drawCount()).toBe(shown);
  });
});
