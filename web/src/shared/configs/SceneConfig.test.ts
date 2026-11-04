import { expect, test } from 'vitest';
import { WIDE_EM } from '@/shared/configs/SceneConfig.ts';

const stylesheets: Record<string, string> = import.meta.glob('/src/**/*.css', { query: '?raw', import: 'default', eager: true });

test('every width media query switches exactly at WIDE_EM', () => {
  const queries = Object.entries(stylesheets).flatMap(([name, css]) =>
    [...css.matchAll(/\((max|min)-width:\s*([\d.]+)(px|em)\)/gu)].map((match) => ({ name, bound: match[1], value: Number(match[2]), unit: match[3] })),
  );
  expect(queries.length).toBeGreaterThan(0);
  for (const { name, bound, value, unit } of queries) {
    const query = `${name}: (${bound}-width: ${value}${unit})`;
    expect(unit, query).toBe('em');
    expect(value, query).toBe(bound === 'max' ? 63.99 : WIDE_EM);
  }
});

test('no stylesheet sets font-size on html, so media query em and readRem() stay equal', () => {
  const rootRules = Object.entries(stylesheets).flatMap(([name, css]) => [...css.matchAll(/(?:^|[}\s,])(?:html|:root)\s*(?:,[^{]*)?\{([^}]*)\}/gu)].map((match) => ({ name, body: match[1] ?? '' })));
  expect(rootRules.length).toBeGreaterThan(0);
  for (const { name, body } of rootRules) expect(body, name).not.toMatch(/(^|;|\s)font(-size)?\s*:/u);
});
