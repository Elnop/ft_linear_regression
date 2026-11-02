import { useRef, useState, type KeyboardEvent } from 'react';
import { nextTab } from '@/features/docs/lib/nextTab.ts';
import { TABS } from '@/features/docs/configs/TabsConfig.ts';
import type { TabId } from '@/features/docs/DocsTypes.ts';

export function useDocumentationTabs() {
  const [tab, setTab] = useState<TabId>('theory');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKeyDown = (event: KeyboardEvent, i: number) => {
    const next = nextTab(event.key, i, TABS.length);
    if (next === null) return;
    event.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return { tab, setTab, tabRefs, onTabKeyDown };
}
