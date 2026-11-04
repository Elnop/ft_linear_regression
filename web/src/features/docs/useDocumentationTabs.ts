import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { nextTab } from '@/features/docs/lib/nextTab.ts';
import { tabFromHash } from '@/features/docs/lib/tabFromHash.ts';
import { TABS } from '@/features/docs/configs/TabsConfig.ts';
import type { TabId } from '@/features/docs/DocsTypes.ts';
import { DOCUMENTATION_ID } from '@/shared/configs/DocumentationConfig.ts';
import { scrollToElement } from '@/shared/lib/scrollToElement.ts';

export function useDocumentationTabs() {
  const [tab, setTab] = useState<TabId>(() => tabFromHash(location.hash, TABS) ?? 'theory');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const target = location.hash.slice(1);
    if (target === DOCUMENTATION_ID || target.startsWith(`${DOCUMENTATION_ID}-`)) scrollToElement(target);
  }, []);

  function selectTab(next: TabId) {
    setTab(next);
    if (location.hash.startsWith(`#${DOCUMENTATION_ID}-`)) history.replaceState(null, '', `#${DOCUMENTATION_ID}`);
  }

  function onTabKeyDown(event: KeyboardEvent, i: number) {
    const next = nextTab(event.key, i, TABS.length);
    const target = next === null ? undefined : TABS[next];
    if (next === null || !target) return;
    event.preventDefault();
    selectTab(target.id);
    tabRefs.current[next]?.focus();
  }

  return { tab, selectTab, tabRefs, onTabKeyDown };
}
