import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { WIDE } from '@/shared/configs/SceneConfig.ts';

const SOURCE = new URL('../src/', import.meta.url);
const stylesheets = readdirSync(SOURCE, { recursive: true, encoding: 'utf8' }).filter((name) => name.endsWith('.css'));

test('every width media query switches exactly at WIDE', () => {
  const queries = stylesheets.flatMap((name) =>
    [...readFileSync(new URL(name, SOURCE), 'utf8').matchAll(/\((max|min)-width:\s*(\d+)px\)/g)].map((match) => ({ name, bound: match[1], px: Number(match[2]) })),
  );
  assert.ok(queries.length > 0);
  for (const { name, bound, px } of queries) {
    assert.equal(px, bound === 'max' ? WIDE - 1 : WIDE, `${name}: (${bound}-width: ${px}px)`);
  }
});
