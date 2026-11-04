import { AxeBuilder } from '@axe-core/playwright';
import { test as base, expect, type Page } from '@playwright/test';

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

export async function overflowingText(page: Page, containers: string): Promise<string[]> {
  return page.evaluate((selector) => {
    const found: string[] = [];
    function visible(element: Element) {
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && getComputedStyle(element).visibility !== 'hidden';
    }
    function label(element: Element) {
      return `${element.tagName.toLowerCase()}${element.classList.length ? `.${[...element.classList].join('.')}` : ''}`;
    }
    for (const container of document.querySelectorAll(selector)) {
      if (!visible(container)) {
        continue;
      }
      const outer = container.getBoundingClientRect();
      for (const child of container.querySelectorAll('*')) {
        const text = [...child.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent?.trim() ?? '')
          .join(' ')
          .trim();
        if (!text || !visible(child)) {
          continue;
        }
        const box = child.getBoundingClientRect();
        if (box.left < outer.left - 1 || box.right > outer.right + 1 || box.top < outer.top - 1 || box.bottom > outer.bottom + 1) {
          found.push(`${selector} > ${label(child)}: ${text}`);
        }
      }
    }
    return found;
  }, containers);
}

export async function controlsOutOfReach(page: Page): Promise<string[]> {
  const controls = page.locator('button, input, [role=tab], a');
  const out: string[] = [];
  for (const control of await controls.all()) {
    if (!(await control.isVisible())) {
      continue;
    }
    await control.scrollIntoViewIfNeeded();
    const fits = await control.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const { clientWidth, clientHeight } = document.documentElement;
      return box.left >= -1 && box.top >= -1 && box.right <= clientWidth + 1 && box.bottom <= clientHeight + 1;
    });
    if (!fits) {
      out.push(
        await control.evaluate(
          (element) =>
            `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).trim().replace(/\s+/g, '.')}` : ''}: ${(element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 40)}`,
        ),
      );
    }
  }
  return out;
}

export async function diverge(page: Page): Promise<void> {
  await page.getByLabel('Learning rate').fill('3');
  await page.getByRole('button', { name: /TAGUER/ }).click();
  await settled(page);
}
