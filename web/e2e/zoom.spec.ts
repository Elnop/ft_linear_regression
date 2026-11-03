import { controlsOutOfReach, diverge, expect, openApp, overflowingText, settled, test } from '@e2e/fixtures.ts';
import type { Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

async function expectNoOverflow(page: Page, containers: string): Promise<void> {
  for (const selector of containers.split(',')) await expect(page.locator(selector.trim()).first()).toBeVisible();
  expect(await overflowingText(page, containers)).toEqual([]);
}

function declareCases(): void {
  for (const viewport of [
    { width: 640, height: 360 },
    { width: 960, height: 540 },
  ]) {
    for (const view of [
      {
        tag: '@paintless',
        containers: '.dashboard-panel, .dashboard-bar, .readout-chip',
        sticker: false,
      },
      {
        tag: '@painting',
        containers: '.dashboard-panel, .dashboard-bar, .readout-chip, .price-sticker',
        sticker: true,
      },
    ]) {
      test(`no horizontal scroll and every control reachable (${viewport.width}×${viewport.height}, ${view.tag})`, { tag: view.tag }, async ({ page }) => {
        await page.setViewportSize(viewport);
        await openApp(page);
        await settled(page);
        await page.getByRole('textbox', { name: /kilométrage/ }).fill('120000');
        if (view.sticker) await expect(page.locator('.price-sticker')).toBeVisible();
        await settled(page);

        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
        if (!view.sticker) expect(await controlsOutOfReach(page)).toEqual([]);
        await expectNoOverflow(page, view.containers);
      });
    }
  }

  for (const width of [320, 375, 414, 768]) {
    test(`the header chips and buttons fit at ${width}px, settled and diverged`, { tag: '@paintless' }, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openApp(page);
      await settled(page);

      const check = async () => {
        await expectNoOverflow(page, '.readout-chip');
        const boxes = await page.locator('.readout-chip, .dashboard-head button').evaluateAll((items) =>
          items.map((item) => {
            const { left, right } = item.getBoundingClientRect();
            return { left, right };
          }),
        );
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        for (const box of boxes) {
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(clientWidth);
        }
        const cut = await page.locator('.readout-chip dt, .readout-chip dd').evaluateAll((texts) => texts.filter((text) => text.scrollWidth > text.clientWidth).map((text) => text.textContent));
        expect(cut).toEqual([]);
      };
      await check();
      await diverge(page);
      await check();
    });
  }
}

test.describe('200% zoom', () => {
  test.use({ deviceScaleFactor: 2 });
  declareCases();
});

test.describe('with a 20px default font', () => {
  test.beforeEach(async ({ page }) => {
    await (await page.context().newCDPSession(page)).send('Page.setFontSizes', { fontSizes: { standard: 20, fixed: 20 } });
  });

  declareCases();

  for (const width of [320, 375]) {
    test(`a ${width}px phone has no horizontal scroll and the chart keeps its prediction inside`, { tag: '@paintless' }, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openApp(page);
      await settled(page);
      await page.getByRole('textbox', { name: /kilométrage/ }).fill('120000');
      await expect(page.locator('.plain-prediction text')).toBeVisible();

      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await expectNoOverflow(page, '.dashboard-bar, .readout-chip, .table-of-contents');
      const chart = (await page.locator('svg:has(.plain-prediction)').boundingBox())!;
      const label = (await page.locator('.plain-prediction text').boundingBox())!;
      expect(label.x).toBeGreaterThanOrEqual(chart.x);
      expect(label.x + label.width).toBeLessThanOrEqual(chart.x + chart.width);
    });
  }

  test('the interface is narrow at 1200×800: the aside sits under the chart', { tag: '@paintless' }, async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await openApp(page);
    await settled(page);

    expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe('20px');
    const aside = await page.locator('.dashboard-aside').boundingBox();
    const chart = await page.locator('svg:has(.plain-axis)').boundingBox();
    expect(aside).not.toBeNull();
    expect(chart).not.toBeNull();
    expect(aside!.y).toBeGreaterThanOrEqual(chart!.y + chart!.height - 1);
  });
});
