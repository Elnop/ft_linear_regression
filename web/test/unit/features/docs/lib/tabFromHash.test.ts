import { expect, test } from 'vitest';
import { tabFromHash } from '@/features/docs/lib/tabFromHash.ts';
import { TABS } from '@/features/docs/configs/TabsConfig.ts';

test('a step anchor opens its tab', () => {
  expect(tabFromHash('#documentation-code-3', TABS)).toBe('code');
  expect(tabFromHash('#documentation-theory-12', TABS)).toBe('theory');
});

test('other anchors open no tab in particular', () => {
  expect(tabFromHash('', TABS)).toBeNull();
  expect(tabFromHash('#documentation', TABS)).toBeNull();
  expect(tabFromHash('#documentation-unknown-1', TABS)).toBeNull();
  expect(tabFromHash('#elsewhere', TABS)).toBeNull();
});
