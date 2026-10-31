import { PALETTE } from '@/features/wall/shared/lib/color.ts';

export const STYLE = {
  dot: { width: 15, load: [1.8, 2.7] },
  line: { width: 10, thickness: 0.95, hesitations: 0, dwell: 30 },
  finalLine: { width: 15, thickness: 1.8, hesitations: 2, dwell: 70 },
  diverge: { width: 11, thickness: 1.1, hesitations: 0, dwell: 40 },
  fadeBase: 0.8,
  fadeFloor: 0.22,
} as const;

export const COLORS = { point: PALETTE.cyan, line: PALETTE.magenta, diverge: PALETTE.yellow } as const;

export function fadeGray(age: number): number {
  return age <= 0 ? 0 : 1;
}

export function fadeOpacity(age: number): number {
  return age <= 0 ? 1 : STYLE.fadeFloor + (1 - STYLE.fadeFloor) * STYLE.fadeBase ** age;
}
