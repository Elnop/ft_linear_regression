import { expect, openApp, test } from './fixtures.ts';

test('the built page keeps the frosted glass behind the documentation', { tag: '@paintless' }, async ({ page }) => {
  await openApp(page);
  const filter = await page.locator('#documentation').evaluate((element) => getComputedStyle(element).backdropFilter);
  expect(filter).toMatch(/blur\(18px\)/);
});
