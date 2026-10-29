import type { KeyboardEvent, RefObject } from 'react';
import { TABS, type TabId } from '@/features/docs/lib/tabs.ts';
import '@/features/docs/styles/tabs.css';

type Props = {
  tab: TabId;
  tabRefs: RefObject<(HTMLButtonElement | null)[]>;
  onSelect: (tab: TabId) => void;
  onKey: (e: KeyboardEvent, i: number) => void;
};

export function DocTabs({ tab, tabRefs, onSelect, onKey }: Props) {
  return (
    <div className="doc-tabs" role="tablist" aria-label="Sections de la documentation">
      {TABS.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => {
            tabRefs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`doc-tab-${t.id}`}
          className="doc-tab"
          aria-selected={tab === t.id}
          aria-controls={`doc-panel-${t.id}`}
          tabIndex={tab === t.id ? 0 : -1}
          onClick={() => onSelect(t.id)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
