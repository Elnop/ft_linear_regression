import { DocumentationHeader } from '@/features/docs/components/presenters/DocumentationHeader.tsx';
import { DocumentationTabs } from '@/features/docs/components/presenters/DocumentationTabs.tsx';
import { ProjectCards } from '@/features/docs/components/presenters/ProjectCards.tsx';
import { SourcesCard } from '@/features/docs/components/presenters/SourcesCard.tsx';
import { StepsPanel } from '@/features/docs/components/presenters/StepsPanel.tsx';
import { CODE } from '@/features/docs/content/CodeContent.tsx';
import { THEORY } from '@/features/docs/content/TheoryContent.ts';
import { useDocumentationTabs } from '@/features/docs/useDocumentationTabs.ts';
import { groupSections } from '@/features/docs/lib/sections.ts';
import { DOCUMENTATION_ID } from '@/shared/configs/DocumentationConfig.ts';
import '@/features/docs/styles/page.css';

const PANELS = {
  theory: { steps: THEORY, sections: groupSections(THEORY), footer: <SourcesCard /> },
  code: { steps: CODE, sections: groupSections(CODE), footer: <ProjectCards /> },
};

export function DocumentationPage() {
  const { tab, selectTab, tabRefs, onTabKeyDown } = useDocumentationTabs();

  return (
    <section id={DOCUMENTATION_ID} className="documentation glass" aria-labelledby="documentation-title" tabIndex={-1}>
      <span className="tape documentation-tape-left" />
      <span className="tape documentation-tape-right" />
      <DocumentationHeader />
      <DocumentationTabs tab={tab} tabRefs={tabRefs} onSelect={selectTab} onKeyDown={onTabKeyDown} />
      <div role="tabpanel" id={`documentation-panel-${tab}`} aria-labelledby={`documentation-tab-${tab}`} className="documentation-panel">
        <StepsPanel {...PANELS[tab]} prefix={tab} />
      </div>
    </section>
  );
}
