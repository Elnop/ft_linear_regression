import { expect, test } from '@e2e/fixtures.ts';

declare global {
  interface Window {
    longTasks: number[];
  }
}

test('skipping the intro never blocks the page for long', { tag: '@painting' }, async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    window.longTasks = [];
    new PerformanceObserver((list) => list.getEntries().forEach((entry) => window.longTasks.push(entry.duration))).observe({ type: 'longtask' });
  });
  await page.goto('./');
  const skip = page.getByRole('button', { name: /PASSER/ });
  await skip.waitFor({ timeout: 30_000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.longTasks.splice(0));
  await skip.click();
  await page.waitForFunction(() => !document.querySelector('.button-train')?.hasAttribute('disabled'), null, { timeout: 60_000 });
  const longest = Math.max(0, ...(await page.evaluate(() => window.longTasks)));
  expect(longest < 1000, `a task blocked the page for ${Math.round(longest)} ms`).toBeTruthy();
});
