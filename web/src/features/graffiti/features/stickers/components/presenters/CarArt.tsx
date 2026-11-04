import { STICKER_PAPER } from '@/features/graffiti/features/stickers/configs/PaperConfig.ts';
import { PALETTE } from '@/shared/configs/PaletteConfig.ts';

export function CarArt() {
  return (
    <>
      <circle cx="65" cy="65" r="65" fill={STICKER_PAPER} />
      <circle cx="65" cy="65" r="58" fill={PALETTE.acid} />
      <path d="M22 72 L31 56 Q36 48 46 48 L80 48 Q89 48 96 57 L107 60 Q113 62 113 69 L113 78 L22 78 Z" fill="#111" />
      <path d="M40 58 L45 52 L62 52 L62 58 Z M66 52 L80 52 Q85 52 89 58 L66 58 Z" fill={PALETTE.acid} />
      <circle cx="42" cy="78" r="9" fill="#111" stroke={PALETTE.acid} strokeWidth="3" />
      <circle cx="93" cy="78" r="9" fill="#111" stroke={PALETTE.acid} strokeWidth="3" />
      <text x="65" y="108" textAnchor="middle" fontFamily="var(--anton)" fontSize="19" fill="#111">
        KM → €
      </text>
      <text x="65" y="38" textAnchor="middle" fontFamily="var(--monospace)" fontWeight="800" fontSize="10" fill="#111">
        data.csv
      </text>
    </>
  );
}
