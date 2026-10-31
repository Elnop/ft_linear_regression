import { INTRODUCTION } from '@/features/docs/content/theory/IntroductionContent.tsx';
import { MATHS } from '@/features/docs/content/theory/MathsContent.tsx';
import { REGRESSION } from '@/features/docs/content/theory/RegressionContent.tsx';
import { DESCENT } from '@/features/docs/content/theory/DescentContent.tsx';
import { PROJECT } from '@/features/docs/content/theory/ProjectContent.tsx';
import type { DocStep } from '@/features/docs/types/DocsTypes.ts';

export const THEORY: DocStep[] = [...INTRODUCTION, ...MATHS, ...REGRESSION, ...DESCENT, ...PROJECT];
