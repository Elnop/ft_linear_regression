import { TEXT_STEPS } from '@/shared/type-scale/TypeScaleConfig.ts';
import { fluidClamp } from '@/shared/type-scale/lib/typeScale.ts';

export function applyTypeScale(root: HTMLElement): void {
  for (const step of TEXT_STEPS) root.style.setProperty(`--text-${step}`, fluidClamp(step));
}
