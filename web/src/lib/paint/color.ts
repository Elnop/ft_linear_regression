import type { Rgb } from './types.ts';

export function hexToRgb(hex: string): Rgb {
  const value = parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export function rgbToHex(color: Rgb): string {
  return `#${color.map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('')}`;
}
