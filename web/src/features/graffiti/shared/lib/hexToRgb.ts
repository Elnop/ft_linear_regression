import type { Rgb } from '@/features/graffiti/shared/types/ColorTypes.ts';

export function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}
