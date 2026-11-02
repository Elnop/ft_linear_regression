import { PALETTE } from '@/shared/configs/PaletteConfig.ts';

export function applyPalette(root: HTMLElement): void {
  for (const [name, color] of Object.entries(PALETTE)) root.style.setProperty(`--${name}`, color);
}
