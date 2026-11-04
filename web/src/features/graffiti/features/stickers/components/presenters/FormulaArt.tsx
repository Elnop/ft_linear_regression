import { PALETTE } from '@/shared/configs/PaletteConfig.ts';

export function FormulaArt() {
  return (
    <>
      <path d="M0 6 Q0 0 6 0 H206 l6 7 l-5 6 l8 6 l-6 7 l7 6 l-5 7 l6 7 l-7 6 l5 7 l-6 6 l6 7 l-3 8 H6 Q0 84 0 78 Z" fill="#f6f2e8" />
      <rect x="0" y="0" width="12" height="84" fill={PALETTE.magenta} />
      <text x="24" y="26" fontFamily="var(--monospace)" fontSize="12.5" fill="#555">
        estimatePrice(km) =
      </text>
      <text x="24" y="62" fontFamily="var(--monospace)" fontWeight="800" fontSize="29" fill="#111">
        θ₀ + θ₁·km
      </text>
    </>
  );
}
