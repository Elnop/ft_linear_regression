import { DocumentationHeader } from '@/features/docs/components/presenters/DocumentationHeader.tsx';
import { DocumentationTabs } from '@/features/docs/components/presenters/DocumentationTabs.tsx';
import { ProjectCards } from '@/features/docs/components/presenters/ProjectCards.tsx';
import { SourcesCard } from '@/features/docs/components/presenters/SourcesCard.tsx';
import { StepsPanel } from '@/features/docs/components/presenters/StepsPanel.tsx';
import { CODE } from '@/features/docs/content/code.tsx';
import { THEORY } from '@/features/docs/content/theory.ts';
import { useDocumentationTabs } from '@/features/docs/hooks/useDocumentationTabs.ts';
import { groupSections } from '@/features/docs/lib/sections.ts';
import '@/features/docs/styles/page.css';

const PANELS = {
  theory: { steps: THEORY, sections: groupSections(THEORY), footer: <SourcesCard /> },
  code: { steps: CODE, sections: groupSections(CODE), footer: <ProjectCards /> },
};

export function DocumentationPage() {
  const { tab, setTab, tabRefs, onTabKeyDown } = useDocumentationTabs();

  return (
    <section id="documentation" className="documentation glass dashboard-hit" aria-labelledby="documentation-title">
      <span className="tape documentation-tape-left" />
      <span className="tape documentation-tape-right" />
      <DocumentationHeader />
      <DocumentationTabs tab={tab} tabRefs={tabRefs} onSelect={setTab} onKeyDown={onTabKeyDown} />
      <div role="tabpanel" id={`documentation-panel-${tab}`} aria-labelledby={`documentation-tab-${tab}`} className="documentation-panel">
        <StepsPanel {...PANELS[tab]} prefix={tab} />
      </div>
    </section>
  );
}
