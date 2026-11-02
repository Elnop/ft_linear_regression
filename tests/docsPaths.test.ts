import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const ROOT = new URL('../', import.meta.url);
const BASES = ['', 'web/', 'web/src/', 'web/src/features/'];
const ROOT_FOLDERS = /^(\.github|app|cli|core|docs|features|shared|states|tests|web)\//;
const DOCUMENTS = [
  'README.md',
  ...readdirSync(new URL('docs/', ROOT), { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.md'))
    .map((name) => `docs/${name}`),
];

function citedPaths(markdown: string): string[] {
  const prose = markdown.replace(/^```[\s\S]*?^```/gm, '');
  const quoted = [...prose.matchAll(/`([^`\s]+)`/g)].flatMap((match) => match[1] ?? []);
  return quoted.filter((text) => text.includes('/') && !/[<>*?@:=(){}]/.test(text) && (/\.[a-z]+$/.test(text) || ROOT_FOLDERS.test(text)));
}

function linkedPaths(markdown: string, document: string): URL[] {
  const folder = new URL(document.replace(/[^/]+$/, ''), ROOT);
  return [...markdown.matchAll(/\]\(([^)#\s]+)\)/g)]
    .flatMap((match) => match[1] ?? [])
    .filter((target) => !/^[a-z]+:/.test(target))
    .map((target) => new URL(target, folder));
}

const exists = (path: string) => BASES.some((base) => existsSync(new URL(base + path, ROOT)));

for (const document of DOCUMENTS) {
  test(`every path cited in ${document} exists`, () => {
    const markdown = readFileSync(new URL(document, ROOT), 'utf8');
    const missing = [
      ...citedPaths(markdown).filter((path) => !exists(path)),
      ...linkedPaths(markdown, document).filter((url) => !existsSync(url)).map((url) => url.pathname),
    ];
    assert.deepEqual(missing, []);
  });
}
