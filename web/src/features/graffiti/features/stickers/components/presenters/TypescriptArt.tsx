import { STICKER_PAPER } from '@/features/graffiti/features/stickers/configs/PaperConfig.ts';

export function TypescriptArt() {
  return (
    <>
      <rect width="110" height="110" rx="10" fill={STICKER_PAPER} />
      <rect x="7" y="7" width="96" height="96" rx="5" fill="#3178c6" />
      <text x="97" y="96" textAnchor="end" fontFamily="var(--anton)" fontSize="46" fill="#fff" letterSpacing="1">
        TS
      </text>
    </>
  );
}
