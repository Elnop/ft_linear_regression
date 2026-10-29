import type { Step } from '@/features/docs/types.ts';

export type TocSection = { title: string; items: { step: Step; i: number }[] };

export const stepId = (prefix: string, i: number) => `doc-${prefix}-${i + 1}`;

export const stepNumber = (i: number) => String(i + 1).padStart(2, '0');

export function groupSections(steps: Step[]): TocSection[] {
  const sections: TocSection[] = [];
  steps.forEach((step, i) => {
    const last = sections.at(-1);
    if (last?.title === step.section) last.items.push({ step, i });
    else sections.push({ title: step.section, items: [{ step, i }] });
  });
  return sections;
}
