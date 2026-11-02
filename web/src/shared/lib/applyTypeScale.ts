import { TEXT_STEPS } from '@/shared/configs/TypeScaleConfig.ts';
import { fluidClamp } from '@/shared/lib/typeScale.ts';

export function applyTypeScale(root: HTMLElement): void {
  for (const step of TEXT_STEPS) root.style.setProperty(`--text-${step}`, fluidClamp(step));
}
