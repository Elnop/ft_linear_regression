import { isFinalPass } from './training.ts';
import type { LineKind, Training } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';

export function lineKindAt(plan: Training, pass: number): LineKind {
  if (plan.diverged) return 'diverge';
  return isFinalPass(plan, pass) ? 'finalLine' : 'line';
}
