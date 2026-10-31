import { isFinalPass } from './training.ts';
import type { LineKind, Training } from '@/features/wall/sequence/types/SequenceTypes.ts';

export function lineKindAt(plan: Training, pass: number): LineKind {
  if (plan.diverged) return 'diverge';
  return isFinalPass(plan, pass) ? 'finalLine' : 'line';
}
