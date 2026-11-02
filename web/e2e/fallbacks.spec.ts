import { expect, openApp, test } from '@e2e/fixtures.ts';

const trainEnabled = () => !document.querySelector('.button-train')?.hasAttribute('disabled');

test('without WebGL the chart view is shown from the start', { tag: '@paintless' }, async ({ page }) => {
  await openApp(page);
  await page.waitForFunction(trainEnabled);
  expect(await page.getByRole('button', { name: /GRAPHE/ }).getAttribute('aria-pressed')).toBe('true');
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('with reduced motion the final state is painted at once, with no skip button', { tag: '@painting' }, async ({ page }) => {
    await openApp(page);
    await page.waitForFunction(trainEnabled, null, { timeout: 10_000 });
    expect(await page.getByRole('button', { name: /PASSER/ }).count()).toBe(0);
    expect(await page.getByRole('button', { name: /GRAPHE/ }).getAttribute('aria-pressed')).toBe('false');
  });
});
