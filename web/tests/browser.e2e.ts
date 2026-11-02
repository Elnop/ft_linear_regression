import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { after, before, test } from 'node:test';
import { chromium, type Browser, type Page } from 'playwright-core';
import { preview, type PreviewServer } from 'vite';

const AXE_SOURCE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const VIEWPORT = { width: 1400, height: 900 };
const NO_WEBGL = ['--disable-webgl', '--disable-webgl2'];
const SOFTWARE_WEBGL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

declare global {
  interface Window {
    longTasks: number[];
    axe: { run(context: Document): Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> };
  }
}

let server: PreviewServer;
let url: string;
let paintless: Browser;
let painting: Browser;

before(async () => {
  server = await preview({ root: new URL('..', import.meta.url).pathname, logLevel: 'silent', preview: { port: 0, strictPort: false } });
  const [local] = server.resolvedUrls?.local ?? [];
  assert.ok(local, 'vite preview gave no local url');
  url = local;
  [paintless, painting] = await Promise.all([chromium.launch({ args: NO_WEBGL }), chromium.launch({ args: SOFTWARE_WEBGL })]);
});

after(async () => {
  await Promise.all([paintless?.close(), painting?.close()]);
  await new Promise<void>((resolve, reject) => server?.httpServer.close((error) => (error ? reject(error) : resolve())));
});

async function open(browser: Browser, options: { reducedMotion?: 'reduce' | 'no-preference' } = {}): Promise<{ page: Page; errors: string[] }> {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: options.reducedMotion ?? 'no-preference' });
  page.setDefaultTimeout(20_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url);
  await page.getByRole('button', { name: /TAGUER/ }).waitFor();
  return { page, errors };
}

async function settled(page: Page): Promise<void> {
  await page.waitForFunction(() => !document.querySelector('.button-train')?.hasAttribute('disabled'));
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== 'running'));
}

async function axeViolations(page: Page): Promise<string[]> {
  await settled(page);
  await page.addScriptTag({ content: AXE_SOURCE });
  return page.evaluate(async () => {
    const { violations } = await window.axe.run(document);
    return violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
  });
}

const focused = (page: Page) =>
  page.evaluate(() => {
    const element = document.activeElement;
    return { id: element?.id ?? '', role: element?.getAttribute('role') ?? '', text: element?.textContent?.trim() ?? '' };
  });

void test('axe finds no violation on the dashboard and both documentation tabs', async () => {
  const { page, errors } = await open(paintless);
  assert.deepEqual(await axeViolations(page), [], 'dashboard');
  for (const tab of ['Théorie', 'Code']) {
    await page.getByRole('tab', { name: tab }).click();
    assert.deepEqual(await axeViolations(page), [], tab);
  }
  assert.deepEqual(errors, []);
  await page.close();
});

void test('the keyboard reaches the documentation and moves between tabs', async () => {
  const { page } = await open(paintless);
  await page.getByRole('button', { name: /DOC/ }).focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement?.id === 'documentation');
  assert.equal(new URL(page.url()).hash, '#documentation');

  const link = page.locator('.table-of-contents a').nth(3);
  const step = (await link.getAttribute('href'))?.slice(1);
  assert.ok(step);
  await link.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction((id) => document.activeElement?.id === id, step);
  assert.equal(new URL(page.url()).hash, `#${step}`);

  const theory = page.getByRole('tab', { name: 'Théorie' });
  await theory.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal((await focused(page)).text, 'Code');
  await page.keyboard.press('Home');
  assert.equal((await focused(page)).text, 'Théorie');
  await page.keyboard.press('End');
  assert.equal((await focused(page)).text, 'Code');
  assert.equal(await page.getByRole('tab', { name: 'Code' }).getAttribute('aria-selected'), 'true');
  await page.close();
});

void test('without WebGL the chart view is shown from the start', async () => {
  const { page, errors } = await open(paintless);
  await page.waitForFunction(() => !document.querySelector('.button-train')?.hasAttribute('disabled'));
  assert.equal(await page.getByRole('button', { name: /GRAPHE/ }).getAttribute('aria-pressed'), 'true');
  assert.deepEqual(errors, []);
  await page.close();
});

void test('with reduced motion the final state is painted at once, with no skip button', async () => {
  const { page, errors } = await open(painting, { reducedMotion: 'reduce' });
  await page.waitForFunction(() => !document.querySelector('.button-train')?.hasAttribute('disabled'), null, { timeout: 10_000 });
  assert.equal(await page.getByRole('button', { name: /PASSER/ }).count(), 0);
  assert.equal(await page.getByRole('button', { name: /GRAPHE/ }).getAttribute('aria-pressed'), 'false');
  assert.deepEqual(errors, []);
  await page.close();
});

void test('skipping the intro never blocks the page for long', async () => {
  const page = await painting.newPage({ viewport: VIEWPORT, reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.longTasks = [];
    new PerformanceObserver((list) => list.getEntries().forEach((entry) => window.longTasks.push(entry.duration))).observe({ type: 'longtask' });
  });
  await page.goto(url);
  const skip = page.getByRole('button', { name: /PASSER/ });
  await skip.waitFor({ timeout: 30_000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.longTasks.splice(0));
  await skip.click();
  await page.waitForFunction(() => !document.querySelector('.button-train')?.hasAttribute('disabled'), null, { timeout: 60_000 });
  const longest = Math.max(0, ...(await page.evaluate(() => window.longTasks)));
  assert.ok(longest < 1000, `a task blocked the page for ${Math.round(longest)} ms`);
  assert.deepEqual(errors, []);
  await page.close();
});
