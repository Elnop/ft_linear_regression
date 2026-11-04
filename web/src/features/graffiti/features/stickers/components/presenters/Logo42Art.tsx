import { STICKER_PAPER } from '@/features/graffiti/features/stickers/configs/PaperConfig.ts';
import { LOGO_42 } from '@/features/graffiti/shared/configs/LogoConfig.ts';

export function Logo42Art() {
  return (
    <>
      <rect width="120" height="120" rx="12" fill={STICKER_PAPER} />
      <rect x="7" y="7" width="106" height="106" rx="6" fill="#111" />
      <g transform="translate(18 32) scale(0.61)" fill="#f4f1ea">
        {LOGO_42.map((points) => (
          <polygon key={points} points={points} />
        ))}
      </g>
    </>
  );
}
