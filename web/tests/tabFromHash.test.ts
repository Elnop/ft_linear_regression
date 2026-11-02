import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tabFromHash } from '@/features/docs/lib/tabFromHash.ts';
import { TABS } from '@/features/docs/configs/TabsConfig.ts';

test('a step anchor opens its tab', () => {
  assert.equal(tabFromHash('#documentation-code-3', TABS), 'code');
  assert.equal(tabFromHash('#documentation-theory-12', TABS), 'theory');
});

test('other anchors open no tab in particular', () => {
  assert.equal(tabFromHash('', TABS), null);
  assert.equal(tabFromHash('#documentation', TABS), null);
  assert.equal(tabFromHash('#documentation-unknown-1', TABS), null);
  assert.equal(tabFromHash('#elsewhere', TABS), null);
});
