import { DocHeader } from '@/features/docs/components/presenters/DocHeader.tsx';
import { DocTabs } from '@/features/docs/components/presenters/DocTabs.tsx';
import { ProjectCards } from '@/features/docs/components/presenters/ProjectCards.tsx';
import { SourcesCard } from '@/features/docs/components/presenters/SourcesCard.tsx';
import { StepsPanel } from '@/features/docs/components/presenters/StepsPanel.tsx';
import { CODE } from '@/features/docs/content/code.tsx';
import { THEORY } from '@/features/docs/content/theory.ts';
import { useDocTabs } from '@/features/docs/hooks/useDocTabs.ts';
import { groupSections } from '@/features/docs/lib/sections.ts';
import '@/features/docs/styles/page.css';

const PANELS = {
  theory: { steps: THEORY, sections: groupSections(THEORY), footer: <SourcesCard /> },
  code: { steps: CODE, sections: groupSections(CODE), footer: <ProjectCards /> },
};

export function DocPage() {
  const { tab, setTab, tabRefs, onTabKey } = useDocTabs();

  return (
    <section id="doc" className="doc glass wu-hit" aria-labelledby="doc-title">
      <span className="tape" style={{ left: 48, transform: 'rotate(-4deg)' }} />
      <span className="tape" style={{ right: 64, transform: 'rotate(5deg)' }} />
      <DocHeader />
      <DocTabs tab={tab} tabRefs={tabRefs} onSelect={setTab} onKey={onTabKey} />
      <div role="tabpanel" id={`doc-panel-${tab}`} aria-labelledby={`doc-tab-${tab}`} className="doc-panel">
        <StepsPanel {...PANELS[tab]} prefix={tab} />
      </div>
    </section>
  );
}
