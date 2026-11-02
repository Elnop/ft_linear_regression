import { expect, test } from 'vitest';
import { WIDE } from '@/shared/configs/SceneConfig.ts';

const stylesheets: Record<string, string> = import.meta.glob('/src/**/*.css', { query: '?raw', import: 'default', eager: true });

test('every width media query switches exactly at WIDE', () => {
  const queries = Object.entries(stylesheets).flatMap(([name, css]) => [...css.matchAll(/\((max|min)-width:\s*(\d+)px\)/g)].map((match) => ({ name, bound: match[1], px: Number(match[2]) })));
  expect(queries.length).toBeGreaterThan(0);
  for (const { name, bound, px } of queries) {
    expect(px, `${name}: (${bound}-width: ${px}px)`).toBe(bound === 'max' ? WIDE - 1 : WIDE);
  }
});
