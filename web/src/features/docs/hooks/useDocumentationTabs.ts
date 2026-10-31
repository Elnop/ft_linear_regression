import { useRef, useState, type KeyboardEvent } from 'react';
import { TABS } from '@/features/docs/lib/tabs.ts';
import type { TabId } from '@/features/docs/types/DocsTypes.ts';

export function useDocumentationTabs() {
  const [tab, setTab] = useState<TabId>('theory');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKeyDown = (event: KeyboardEvent, i: number) => {
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const next = (i + direction + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return { tab, setTab, tabRefs, onTabKeyDown };
}
