import { STICKER_PAPER } from '@/features/graffiti/features/stickers/configs/PaperConfig.ts';

export function ReactArt() {
  return (
    <>
      <circle cx="62" cy="62" r="62" fill={STICKER_PAPER} />
      <circle cx="62" cy="62" r="55" fill="#20232a" />
      <g fill="none" stroke="#61dafb" strokeWidth="4.5">
        <ellipse cx="62" cy="62" rx="42" ry="16" />
        <ellipse cx="62" cy="62" rx="42" ry="16" transform="rotate(60 62 62)" />
        <ellipse cx="62" cy="62" rx="42" ry="16" transform="rotate(120 62 62)" />
      </g>
      <circle cx="62" cy="62" r="8" fill="#61dafb" />
    </>
  );
}
