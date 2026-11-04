import { STICKER_PAPER } from '@/features/graffiti/features/stickers/configs/PaperConfig.ts';

export function PiscineArt() {
  return (
    <>
      <rect width="190" height="96" rx="14" fill={STICKER_PAPER} />
      <rect x="6" y="6" width="178" height="84" rx="9" fill="#00babc" />
      <path d="M15 76 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#0b5f60" strokeWidth="3" strokeLinecap="round" />
      <text x="95" y="46" textAnchor="middle" fontFamily="var(--anton)" fontSize="36" fill="#0d0c10" letterSpacing="1">
        PISCINE
      </text>
      <text x="95" y="66" textAnchor="middle" fontFamily="var(--marker)" fontSize="15" fill="#f4f1ea">
        survivor · 42
      </text>
    </>
  );
}
