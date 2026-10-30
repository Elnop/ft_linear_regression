import type { KeyboardEvent, RefObject } from 'react';
import { TABS, type TabId } from '@/features/docs/lib/tabs.ts';
import '@/features/docs/styles/tabs.css';

type Props = {
  tab: TabId;
  tabRefs: RefObject<(HTMLButtonElement | null)[]>;
  onSelect: (tab: TabId) => void;
  onKeyDown: (event: KeyboardEvent, i: number) => void;
};

export function DocumentationTabs({ tab, tabRefs, onSelect, onKeyDown }: Props) {
  return (
    <div className="documentation-tabs" role="tablist" aria-label="Sections de la documentation">
      {TABS.map((tabItem, i) => (
        <button
          key={tabItem.id}
          ref={(element) => {
            tabRefs.current[i] = element;
          }}
          type="button"
          role="tab"
          id={`documentation-tab-${tabItem.id}`}
          className="documentation-tab"
          aria-selected={tab === tabItem.id}
          aria-controls={`documentation-panel-${tabItem.id}`}
          tabIndex={tab === tabItem.id ? 0 : -1}
          onClick={() => onSelect(tabItem.id)}
          onKeyDown={(event) => onKeyDown(event, i)}
        >
          {tabItem.label}
        </button>
      ))}
    </div>
  );
}
