import { INTRODUCTION } from '@/features/docs/content/theory/introduction.tsx';
import { MATHS } from '@/features/docs/content/theory/maths.tsx';
import { REGRESSION } from '@/features/docs/content/theory/regression.tsx';
import { DESCENT } from '@/features/docs/content/theory/descent.tsx';
import { PROJECT } from '@/features/docs/content/theory/project.tsx';
import type { Step } from '@/features/docs/types.ts';

export const THEORY: Step[] = [...INTRODUCTION, ...MATHS, ...REGRESSION, ...DESCENT, ...PROJECT];
