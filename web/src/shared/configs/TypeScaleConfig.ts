export const TEXT_STEPS = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', 'display'] as const;
export type TextStep = (typeof TEXT_STEPS)[number];

// Sizes in px for a root of 16px: `min` at FLUID_FROM, `max` at FLUID_TO.
export const TYPE_SCALE: Record<TextStep, { min: number; max: number }> = {
  xs: { min: 12, max: 13 },
  sm: { min: 13, max: 15 },
  base: { min: 14, max: 16 },
  md: { min: 16, max: 20 },
  lg: { min: 20, max: 26 },
  xl: { min: 26, max: 34 },
  '2xl': { min: 32, max: 48 },
  display: { min: 30, max: 48 },
};

export const FLUID_FROM = 320;
export const FLUID_TO = 1920;
