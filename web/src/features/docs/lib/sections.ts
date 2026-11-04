import type { DocStep, TableOfContentsSection } from '@/features/docs/DocsTypes.ts';
import { DOCUMENTATION_ID } from '@/shared/configs/DocumentationConfig.ts';

export function stepId(prefix: string, index: number) {
  return `${DOCUMENTATION_ID}-${prefix}-${index + 1}`;
}

export function stepNumber(index: number) {
  return String(index + 1).padStart(2, '0');
}

export function groupSections(steps: DocStep[]): TableOfContentsSection[] {
  const sections: TableOfContentsSection[] = [];
  steps.forEach((step, index) => {
    const last = sections.at(-1);
    if (last?.title === step.section) last.items.push({ step, index });
    else sections.push({ title: step.section, items: [{ step, index }] });
  });
  return sections;
}
