import { expect, test } from 'vitest';

const stylesheets: Record<string, string> = import.meta.glob('/src/**/*.css', { query: '?raw', import: 'default', eager: true });
const components: Record<string, string> = import.meta.glob(['/src/features/{dashboard,docs}/**/*.tsx', '!/src/**/*.test.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

test('no stylesheet sizes text in px or bare vw', () => {
  const declarations = Object.entries(stylesheets).flatMap(([name, css]) =>
    [...css.matchAll(/(?:^|[;{\s])(font-size|font)\s*:\s*([^;}]+)/g)].map((match) => ({ name, property: match[1], value: match[2].trim() })),
  );
  expect(declarations.length).toBeGreaterThan(0);
  for (const { name, property, value } of declarations) {
    const declaration = `${name}: ${property}: ${value}`;
    expect(value, declaration).not.toMatch(/\d+(\.\d+)?px/);
    expect(value, declaration).not.toMatch(/\d\s*vw/);
  }
});

test('no interface component hard-codes a font size', () => {
  expect(Object.keys(components).length).toBeGreaterThan(0);
  for (const [name, source] of Object.entries(components)) {
    expect(source, name).not.toMatch(/fontSize=\{\s*\d/);
    expect(source, name).not.toMatch(/fontSize="\d/);
    expect(source, name).not.toMatch(/fontSize[^\n]*\?\s*\d+(\.\d+)?\s*:\s*\d/);
  }
});
