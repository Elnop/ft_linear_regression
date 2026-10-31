import type { ReactNode } from 'react';
import { TableOfContents } from '@/features/docs/components/presenters/TableOfContents.tsx';
import { StepList } from '@/features/docs/components/presenters/StepList.tsx';
import type { TableOfContentsSection } from '@/features/docs/lib/sections.ts';
import type { Step } from '@/features/docs/DocsTypes.ts';

type Props = {
  steps: Step[];
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
