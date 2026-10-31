import type { DocStep, TableOfContentsSection } from '@/features/docs/types/DocsTypes.ts';

export const stepId = (prefix: string, index: number) => `documentation-${prefix}-${index + 1}`;

export const stepNumber = (index: number) => String(index + 1).padStart(2, '0');

export function groupSections(steps: DocStep[]): TableOfContentsSection[] {
  const sections: TableOfContentsSection[] = [];
  steps.forEach((step, index) => {
    const last = sections.at(-1);
    if (last?.title === step.section) last.items.push({ step, index });
    else sections.push({ title: step.section, items: [{ step, index }] });
  });
  return sections;
}
