import { FLUID_FROM, FLUID_TO, TYPE_SCALE } from '@/shared/configs/TypeScaleConfig.ts';
import type { TextStep } from '@/shared/types/TypeScaleTypes.ts';

const REM_PX = 16;

function round(value: number): number {
  return Number(value.toFixed(4));
}

function coefficients(step: TextStep): { slope: number; intercept: number } {
  const { min, max } = TYPE_SCALE[step];
  const slope = (max - min) / (FLUID_TO - FLUID_FROM);
  return { slope, intercept: (min - slope * FLUID_FROM) / REM_PX };
}

export function fluidClamp(step: TextStep): string {
  const { min, max } = TYPE_SCALE[step];
  const { slope, intercept } = coefficients(step);
  return `clamp(${round(min / REM_PX)}rem, ${round(slope * 100)}vw + ${round(intercept)}rem, ${round(max / REM_PX)}rem)`;
}

export function textSize(step: TextStep, viewportWidth: number, rem: number): number {
  const { min, max } = TYPE_SCALE[step];
  const { slope, intercept } = coefficients(step);
  const preferred = slope * viewportWidth + intercept * rem;
  return Math.min(Math.max((min * rem) / REM_PX, preferred), (max * rem) / REM_PX);
}
