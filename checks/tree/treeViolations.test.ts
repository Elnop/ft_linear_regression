import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { treeViolations } from './treeViolations.ts';

function tree(files: string[], folders: string[] = []): string {
  const root = join(mkdtempSync(join(tmpdir(), 'tree-')), 'src');
  for (const folder of folders) mkdirSync(join(root, folder), { recursive: true });
  for (const file of files) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), '');
  }
  return root;
}

test('a conforming tree has no violation', () => {
  const root = tree(['app/App.tsx', 'app/globals.css', 'lib/a.ts', 'lib/b.ts', 'lib/a.test.ts', 'feature/styles/a.css', 'feature/styles/b.css', 'feature/Feature.tsx']);
  assert.deepEqual(treeViolations(root), []);
});

test('an empty folder is reported', () => {
  assert.deepEqual(treeViolations(tree(['a.ts'], ['empty'])), ['src/empty is empty: delete it']);
});

test('a category folder with a single child is reported, its tests aside', () => {
  assert.deepEqual(treeViolations(tree(['lib/a.ts', 'lib/a.test.ts'])), ['src/lib holds a single child: move it up one level and delete the folder']);
});

test('two loose stylesheets, or one beside a styles/ folder, are reported', () => {
  assert.deepEqual(treeViolations(tree(['a.css', 'b.css'])), ['src holds 2 stylesheets: move them into a styles/ folder']);
  assert.deepEqual(treeViolations(tree(['a.css', 'styles/b.css', 'styles/c.css'])), ['src has a styles/ folder: move a.css into it']);
});
