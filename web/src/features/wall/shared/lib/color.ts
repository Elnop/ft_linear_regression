import type { Rgb } from './SprayTypes.ts';

export const PALETTE = { cyan: '#00f0ff', magenta: '#ff2bd6', yellow: '#e6ff00' } as const;

export function hexToRgb(hex: string): Rgb {
  const value = parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}
