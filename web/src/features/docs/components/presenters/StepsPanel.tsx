import type { ReactNode } from 'react';
import { DocToc } from '@/features/docs/components/presenters/DocToc.tsx';
import { StepList } from '@/features/docs/components/presenters/StepList.tsx';
import type { TocSection } from '@/features/docs/lib/sections.ts';
import type { Step } from '@/features/docs/types.ts';

type Props = {
  steps: Step[];
  sections: TocSection[];
  prefix: string;
  footer: ReactNode;
};

export function StepsPanel({ steps, sections, prefix, footer }: Props) {
  return (
    <>
      <DocToc sections={sections} prefix={prefix} />
      <StepList steps={steps} prefix={prefix} />
      {footer}
    </>
  );
}
