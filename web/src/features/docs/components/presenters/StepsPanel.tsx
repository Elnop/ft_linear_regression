import type { ReactNode } from 'react';
import { TableOfContents } from '@/features/docs/components/presenters/TableOfContents.tsx';
import { StepList } from '@/features/docs/components/presenters/StepList.tsx';

import type { DocStep, TableOfContentsSection } from '@/features/docs/types/DocsTypes.ts';

type Props = {
  steps: DocStep[];
  sections: TableOfContentsSection[];
  prefix: string;
  footer: ReactNode;
};

export function StepsPanel({ steps, sections, prefix, footer }: Props) {
  return (
    <>
      <TableOfContents sections={sections} prefix={prefix} />
      <StepList steps={steps} prefix={prefix} />
      {footer}
    </>
  );
}
