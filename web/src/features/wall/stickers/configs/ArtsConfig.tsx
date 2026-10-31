import type { Art } from '@/features/wall/stickers/types/StickersTypes.ts';

const PAPER = '#ebe5d6';

const LOGO_42 = (
  <>
    <polygon points="76,0 50.7,0 0,50.6 0,71.1 50.7,71.1 50.7,96.6 76,96.6 76,50.6 25.4,50.6" />
    <polygon points="86.6,25.3 112,0 86.6,0" />
    <polygon points="112,25.3 86.6,50.6 86.6,75.9 112,75.9 112,50.6 137.3,25.3 137.3,0 112,0" />
    <polygon points="137.3,50.6 112,75.9 137.3,75.9" />
  </>
);

export const logo42: Art = {
  viewWidth: 120,
  viewHeight: 120,
  body: (
    <>
      <rect width="120" height="120" rx="12" fill={PAPER} />
      <rect x="7" y="7" width="106" height="106" rx="6" fill="#111" />
      <g transform="translate(18 32) scale(0.61)" fill="#f4f1ea">
        {LOGO_42}
      </g>
    </>
  ),
};

export const piscine: Art = {
  viewWidth: 190,
  viewHeight: 96,
  body: (
    <>
      <rect width="190" height="96" rx="14" fill={PAPER} />
      <rect x="6" y="6" width="178" height="84" rx="9" fill="#00babc" />
      <path d="M15 76 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#0b5f60" strokeWidth="3" strokeLinecap="round" />
      <text x="95" y="46" textAnchor="middle" fontFamily="var(--anton)" fontSize="36" fill="#0d0c10" letterSpacing="1">
        PISCINE
      </text>
      <text x="95" y="66" textAnchor="middle" fontFamily="var(--marker)" fontSize="15" fill="#f4f1ea">
        survivor · 42
      </text>
    </>
  ),
};

export const formula: Art = {
  viewWidth: 220,
  viewHeight: 84,
  body: (
    <>
      <path d="M0 6 Q0 0 6 0 H206 l6 7 l-5 6 l8 6 l-6 7 l7 6 l-5 7 l6 7 l-7 6 l5 7 l-6 6 l6 7 l-3 8 H6 Q0 84 0 78 Z" fill="#f6f2e8" />
      <rect x="0" y="0" width="12" height="84" fill="#ff2bd6" />
      <text x="24" y="26" fontFamily="var(--monospace)" fontSize="12.5" fill="#555">
        estimatePrice(km) =
      </text>
      <text x="24" y="62" fontFamily="var(--monospace)" fontWeight="800" fontSize="29" fill="#111">
        θ₀ + θ₁·km
      </text>
    </>
  ),
};

export const car: Art = {
  viewWidth: 130,
  viewHeight: 130,
  body: (
    <>
      <circle cx="65" cy="65" r="65" fill={PAPER} />
      <circle cx="65" cy="65" r="58" fill="#e6ff00" />
      <path d="M22 72 L31 56 Q36 48 46 48 L80 48 Q89 48 96 57 L107 60 Q113 62 113 69 L113 78 L22 78 Z" fill="#111" />
      <path d="M40 58 L45 52 L62 52 L62 58 Z M66 52 L80 52 Q85 52 89 58 L66 58 Z" fill="#e6ff00" />
      <circle cx="42" cy="78" r="9" fill="#111" stroke="#e6ff00" strokeWidth="3" />
      <circle cx="93" cy="78" r="9" fill="#111" stroke="#e6ff00" strokeWidth="3" />
      <text x="65" y="108" textAnchor="middle" fontFamily="var(--anton)" fontSize="19" fill="#111">
        KM → €
      </text>
      <text x="65" y="38" textAnchor="middle" fontFamily="var(--monospace)" fontWeight="800" fontSize="10" fill="#111">
        data.csv
      </text>
    </>
  ),
};

export const typescript: Art = {
  viewWidth: 110,
  viewHeight: 110,
  body: (
    <>
      <rect width="110" height="110" rx="10" fill={PAPER} />
      <rect x="7" y="7" width="96" height="96" rx="5" fill="#3178c6" />
      <text x="97" y="96" textAnchor="end" fontFamily="var(--anton)" fontSize="46" fill="#fff" letterSpacing="1">
        TS
      </text>
    </>
  ),
};

export const react: Art = {
  viewWidth: 124,
  viewHeight: 124,
  body: (
    <>
      <circle cx="62" cy="62" r="62" fill={PAPER} />
      <circle cx="62" cy="62" r="55" fill="#20232a" />
      <g fill="none" stroke="#61dafb" strokeWidth="4.5">
        <ellipse cx="62" cy="62" rx="42" ry="16" />
        <ellipse cx="62" cy="62" rx="42" ry="16" transform="rotate(60 62 62)" />
        <ellipse cx="62" cy="62" rx="42" ry="16" transform="rotate(120 62 62)" />
      </g>
      <circle cx="62" cy="62" r="8" fill="#61dafb" />
    </>
  ),
};

export const norminette: Art = {
  viewWidth: 180,
  viewHeight: 82,
  body: (
    <>
      <rect width="180" height="82" rx="8" fill="#f6f2e8" />
      <rect x="7" y="7" width="166" height="68" rx="4" fill="none" stroke="#1f9d55" strokeWidth="3" />
      <rect x="12" y="12" width="156" height="58" rx="2" fill="none" stroke="#1f9d55" strokeWidth="1.5" />
      <text x="90" y="44" textAnchor="middle" fontFamily="var(--anton)" fontSize="26" fill="#1f9d55" letterSpacing="2">
        NORMINETTE
      </text>
      <path d="M44 56 l4 4 l8 -9" fill="none" stroke="#1f9d55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="62" y="62" fontFamily="var(--monospace)" fontWeight="800" fontSize="12" fill="#1f9d55">
        OK · 0 ERROR
      </text>
    </>
  ),
};

export const descent: Art = {
  viewWidth: 160,
  viewHeight: 120,
  body: (
    <>
      <rect width="160" height="120" rx="12" fill={PAPER} />
      <rect x="6" y="6" width="148" height="108" rx="7" fill="#111" />
      <path d="M22 22 Q80 150 138 22" fill="none" stroke="#ff2bd6" strokeWidth="4" strokeLinecap="round" />
      {[
        [29, 40],
        [40, 60],
        [53, 74],
        [66, 80],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5 - i * 0.6} fill="#e6ff00" />
      ))}
      <text x="80" y="104" textAnchor="middle" fontFamily="var(--marker)" fontSize="13" fill="#f4f1ea">
        gradient descent
      </text>
    </>
  ),
};
