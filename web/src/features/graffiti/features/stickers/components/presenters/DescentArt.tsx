import { STICKER_PAPER } from '@/features/graffiti/features/stickers/configs/PaperConfig.ts';
import { PALETTE } from '@/shared/configs/PaletteConfig.ts';

export function DescentArt() {
  return (
    <>
      <rect width="160" height="120" rx="12" fill={STICKER_PAPER} />
      <rect x="6" y="6" width="148" height="108" rx="7" fill="#111" />
      <path d="M22 22 Q80 150 138 22" fill="none" stroke={PALETTE.magenta} strokeWidth="4" strokeLinecap="round" />
      {[
        [29, 40],
        [40, 60],
        [53, 74],
        [66, 80],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5 - i * 0.6} fill={PALETTE.acid} />
      ))}
      <text x="80" y="104" textAnchor="middle" fontFamily="var(--marker)" fontSize="13" fill="#f4f1ea">
        gradient descent
      </text>
    </>
  );
}
