import type { Page } from '@playwright/test';
import { axeViolations, expect, openApp, test } from '@e2e/fixtures.ts';

function focused(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    return { id: element?.id ?? '', role: element?.getAttribute('role') ?? '', text: element?.textContent?.trim() ?? '' };
  });
}

test('axe finds no violation on the dashboard and both documentation tabs', { tag: '@paintless' }, async ({ page }) => {
  await openApp(page);
  expect(await axeViolations(page), 'dashboard').toEqual([]);
  for (const tab of ['Théorie', 'Code']) {
    await page.getByRole('tab', { name: tab }).click();
    expect(await axeViolations(page), tab).toEqual([]);
  }
});

test('the keyboard reaches the documentation and moves between tabs', { tag: '@paintless' }, async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /DOC/ }).focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement?.id === 'documentation');
  expect(new URL(page.url()).hash).toBe('#documentation');

  const link = page.locator('.table-of-contents a').nth(3);
  const step = (await link.getAttribute('href'))?.slice(1);
  expect(step).toBeTruthy();
  await link.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction((id) => document.activeElement?.id === id, step);
  expect(new URL(page.url()).hash).toBe(`#${step}`);

  const theory = page.getByRole('tab', { name: 'Théorie' });
  await theory.focus();
  await page.keyboard.press('ArrowRight');
  expect((await focused(page)).text).toBe('Code');
  await page.keyboard.press('Home');
  expect((await focused(page)).text).toBe('Théorie');
  await page.keyboard.press('End');
  expect((await focused(page)).text).toBe('Code');
  expect(await page.getByRole('tab', { name: 'Code' }).getAttribute('aria-selected')).toBe('true');
});
