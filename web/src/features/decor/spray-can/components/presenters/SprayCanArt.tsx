import { VIEW_H, VIEW_W } from '@/features/decor/spray-can/lib/shape.ts';

const LOGO_42 = [
  '76 0 50.68 0 0 50.62 0 71.12 50.68 71.12 50.68 96.6 76 96.6 76 50.62 25.34 50.62',
  '86.27 25.28 111.6 0 86.27 0',
  '111.6 25.28 86.27 50.62 86.27 75.9 111.6 75.9 111.6 50.62 136.93 25.28 136.93 0 111.6 0',
  '136.93 50.62 111.6 75.9 136.93 75.9',
];
const BODY = 'M20 108 H120 V306 Q120 316 110 316 H30 Q20 316 20 306 Z';
const CAP = 'M52 54 V31 Q52 20 63 20 H80 Q90 20 90 31 V54 Z';
const SHOULDER = 'M20 106 C20 82 42 68 58 63 H82 C98 68 120 82 120 106 Z';
const MONO = 'JetBrains Mono, monospace';

export function SprayCanArt() {
  const paint = { fill: 'var(--paint)' };
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" role="img" aria-label="Bombe de peinture 42">
      <defs>
        <linearGradient id="can-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#34343c" />
          <stop offset="0.18" stopColor="#8a8a95" />
          <stop offset="0.3" stopColor="#f4f4f8" />
          <stop offset="0.44" stopColor="#9c9ca7" />
          <stop offset="0.74" stopColor="#4f4f58" />
          <stop offset="0.92" stopColor="#26262c" />
          <stop offset="1" stopColor="#6b6b76" />
        </linearGradient>
        <linearGradient id="can-cyl" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.6" />
          <stop offset="0.16" stopColor="#000" stopOpacity="0" />
          <stop offset="0.24" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.29" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="0.36" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.66" stopColor="#000" stopOpacity="0.05" />
          <stop offset="0.9" stopColor="#000" stopOpacity="0.62" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id="can-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="spray-can-act">
        <rect x="42" y="28.5" width="12" height="9" rx="2.2" fill="url(#can-metal)" />
        <ellipse cx="44.6" cy="33" rx="1.6" ry="2.3" fill="#050506" />
        <path d={CAP} style={paint} />
        <path d="M56 24 h10 v-1 Q60 22 56 24Z" fill="rgba(255,255,255,.5)" />
        <rect x="52" y="44" width="38" height="1.6" fill="rgba(0,0,0,.3)" />
        <rect x="52" y="48" width="38" height="1.6" fill="rgba(0,0,0,.3)" />
        <path d={CAP} fill="url(#can-cyl)" />
        <path d={CAP} fill="url(#can-top)" />
      </g>
      <rect x="46" y="52" width="48" height="13" rx="3.5" fill="url(#can-metal)" />
      <path d={SHOULDER} fill="url(#can-metal)" />
      <path d="M44 70 Q70 60 96 70" stroke="rgba(255,255,255,.35)" strokeWidth="1" fill="none" />
      <rect x="17" y="101" width="106" height="9" rx="3.5" fill="url(#can-metal)" />
      <path d={BODY} fill="#111115" />
      <rect x="20" y="120" width="100" height="7" style={paint} />
      <path d="M90 127 V176 a4.2 4.2 0 0 0 8.4 0 V127Z M103 127 V150 a2.6 2.6 0 0 0 5.2 0 V127Z M40 127 V139 a2 2 0 0 0 4 0 V127Z" style={paint} />
      <g transform="translate(35.7 152) scale(.5)" fill="#f5f5f7">
        {LOGO_42.map((points) => (
          <polygon key={points} points={points} />
        ))}
      </g>
      <text x="70" y="226" textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="6.3" letterSpacing=".35" fill="#f5f5f7">
        ft_linear_regression
      </text>
      <text x="70" y="238" textAnchor="middle" fontFamily={MONO} fontSize="4.4" letterSpacing="1.6" fill="rgba(245,245,247,.5)">
        θ0 + θ1 · KM
      </text>
      <rect x="20" y="284" width="100" height="2.5" style={paint} />
      <text x="70" y="298" textAnchor="middle" fontFamily={MONO} fontSize="4" letterSpacing="1.4" fill="rgba(245,245,247,.42)">
        SPRAY · 400 ML
      </text>
      <path d={BODY} fill="url(#can-cyl)" />
      <path d={SHOULDER} fill="url(#can-cyl)" opacity=".7" />
      <rect x="17" y="307" width="106" height="11" rx="4.5" fill="url(#can-metal)" />
    </svg>
  );
}
