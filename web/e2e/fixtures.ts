import { AxeBuilder } from '@axe-core/playwright';
import { test as base, expect, type Page } from '@playwright/test';

// Every test fails if the page throws, even when the test itself never looks.
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await use(errors);
      expect(errors).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function openApp(page: Page): Promise<void> {
  await page.goto('./');
  await page.getByRole('button', { name: /TAGUER/ }).waitFor();
}

export async function settled(page: Page): Promise<void> {
  await page.waitForFunction(() => !document.querySelector('.button-train')?.hasAttribute('disabled'));
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== 'running'));
}

export async function axeViolations(page: Page): Promise<string[]> {
  await settled(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
}
