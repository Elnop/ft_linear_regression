import { controlsOutOfReach, diverge, expect, openApp, overflowingText, settled, test } from '@e2e/fixtures.ts';

test.use({ reducedMotion: 'reduce' });

test.describe('200% zoom', () => {
  test.use({ deviceScaleFactor: 2 });

  for (const viewport of [
    { width: 640, height: 360 },
    { width: 960, height: 540 },
  ]) {
    test(`no horizontal scroll and every control reachable at 200% zoom (${viewport.width}×${viewport.height})`, { tag: '@paintless' }, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openApp(page);
      await page.getByRole('textbox', { name: /kilométrage/ }).fill('120000');
      await settled(page);

      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      expect(await controlsOutOfReach(page)).toEqual([]);
      expect(await overflowingText(page, '.dashboard-panel, .readout-chip, .price-sticker')).toEqual([]);
    });
  }
});

for (const width of [320, 375, 414, 768]) {
  test(`the header chips fit at ${width}px, settled and diverged`, { tag: '@paintless' }, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await openApp(page);
    await settled(page);

    const check = async () => {
      expect(await overflowingText(page, '.readout-chip')).toEqual([]);
      const rights = await page.locator('.readout-chip').evaluateAll((chips) => chips.map((chip) => chip.getBoundingClientRect().right));
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      for (const right of rights) expect(right).toBeLessThanOrEqual(clientWidth);
    };
    await check();
    await diverge(page);
    await check();
  });
}
