import { useRef, useState, type KeyboardEvent } from 'react';
import { TABS, type TabId } from '@/features/docs/lib/tabs.ts';

export function useDocTabs() {
  const [tab, setTab] = useState<TabId>('theory');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return { tab, setTab, tabRefs, onTabKey };
}
