import type { ReactNode } from 'react';
import type { ChartMapping } from '@/lib/chart.ts';
import { mulberry32 } from '@/lib/random.ts';
import '@/features/decor/stickers/stickers.css';

export type StickersProps = {
  chart: ChartMapping;
  width: number;
  titleRight?: number;
};

type Art = { vw: number; vh: number; body: ReactNode };
type Corner = 'tl' | 'tr' | 'br' | 'bl';
type Damage = { seed: number; scrape: number; peel?: [Corner, number]; tear?: number };
type Item = { art: Art; dx: number; dy: number; w: number; rot: number; dmg: Damage };
type Cluster = { u: number; v: number; items: Item[] };

const PAPER = '#ebe5d6';

const LOGO_42 = (
  <>
    <polygon points="76,0 50.7,0 0,50.6 0,71.1 50.7,71.1 50.7,96.6 76,96.6 76,50.6 25.4,50.6" />
    <polygon points="86.6,25.3 112,0 86.6,0" />
    <polygon points="112,25.3 86.6,50.6 86.6,75.9 112,75.9 112,50.6 137.3,25.3 137.3,0 112,0" />
    <polygon points="137.3,50.6 112,75.9 137.3,75.9" />
  </>
);

const logo42: Art = {
  vw: 120,
  vh: 120,
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

const piscine: Art = {
  vw: 190,
  vh: 96,
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

const formula: Art = {
  vw: 220,
  vh: 84,
  body: (
    <>
      <path d="M0 6 Q0 0 6 0 H206 l6 7 l-5 6 l8 6 l-6 7 l7 6 l-5 7 l6 7 l-7 6 l5 7 l-6 6 l6 7 l-3 8 H6 Q0 84 0 78 Z" fill="#f6f2e8" />
      <rect x="0" y="0" width="12" height="84" fill="#ff2bd6" />
      <text x="24" y="26" fontFamily="var(--mono)" fontSize="12.5" fill="#555">
        estimatePrice(km) =
      </text>
      <text x="24" y="62" fontFamily="var(--mono)" fontWeight="800" fontSize="29" fill="#111">
        θ₀ + θ₁·km
      </text>
    </>
  ),
};

const car: Art = {
  vw: 130,
  vh: 130,
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
      <text x="65" y="38" textAnchor="middle" fontFamily="var(--mono)" fontWeight="800" fontSize="10" fill="#111">
        data.csv
      </text>
    </>
  ),
};

const ts: Art = {
  vw: 110,
  vh: 110,
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

const react: Art = {
  vw: 124,
  vh: 124,
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

const norm: Art = {
  vw: 180,
  vh: 82,
  body: (
    <>
      <rect width="180" height="82" rx="8" fill="#f6f2e8" />
      <rect x="7" y="7" width="166" height="68" rx="4" fill="none" stroke="#1f9d55" strokeWidth="3" />
      <rect x="12" y="12" width="156" height="58" rx="2" fill="none" stroke="#1f9d55" strokeWidth="1.5" />
      <text x="90" y="44" textAnchor="middle" fontFamily="var(--anton)" fontSize="26" fill="#1f9d55" letterSpacing="2">
        NORMINETTE
      </text>
      <path d="M44 56 l4 4 l8 -9" fill="none" stroke="#1f9d55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="62" y="62" fontFamily="var(--mono)" fontWeight="800" fontSize="12" fill="#1f9d55">
        OK · 0 ERROR
      </text>
    </>
  ),
};

const descent: Art = {
  vw: 160,
  vh: 120,
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

const CLUSTERS: Cluster[] = [
  {
    u: 0.03,
    v: 0.62,
    items: [
      { art: logo42, dx: 98, dy: 0, w: 56, rot: 10, dmg: { seed: 3, scrape: 0.63, peel: ['tr', 0.3] } },
      { art: car, dx: 0, dy: 14, w: 80, rot: -8, dmg: { seed: 11, scrape: 0.6 } },
      { art: piscine, dx: 72, dy: 60, w: 96, rot: 4, dmg: { seed: 5, scrape: 0.63, tear: 0.68 } },
      { art: formula, dx: 6, dy: 108, w: 120, rot: -3, dmg: { seed: 9, scrape: 0.62, peel: ['br', 0.3] } },
    ],
  },
  {
    u: 0.74,
    v: 0.04,
    items: [
      { art: ts, dx: 82, dy: 0, w: 52, rot: 8, dmg: { seed: 2, scrape: 0.65 } },
      { art: react, dx: 0, dy: 26, w: 72, rot: -6, dmg: { seed: 8, scrape: 0.63, peel: ['bl', 0.45] } },
      { art: descent, dx: 140, dy: 40, w: 82, rot: -3, dmg: { seed: 14, scrape: 0.61, tear: 0.72 } },
      { art: norm, dx: 58, dy: 78, w: 92, rot: 3, dmg: { seed: 6, scrape: 0.6 } },
    ],
  },
];

const TITLE_DAMAGE: Damage = { seed: 21, scrape: 0.64, peel: ['br', 0.32] };

const pts = (p: number[][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function peelGeometry(W: number, H: number, [corner, f]: [Corner, number]) {
  const p = f * Math.min(W, H);
  const cuts: Record<Corner, { at: number; pair: number[][]; tri: number[][]; m: string }> = {
    tl: { at: 0, pair: [[0, p], [p, 0]], tri: [[0, 0], [p, 0], [0, p]], m: `0 -1 -1 0 ${p} ${p}` },
    tr: { at: 1, pair: [[W - p, 0], [W, p]], tri: [[W - p, 0], [W, 0], [W, p]], m: `0 1 1 0 ${W - p} ${p - W}` },
    br: { at: 2, pair: [[W, H - p], [W - p, H]], tri: [[W, H - p], [W, H], [W - p, H]], m: `0 -1 -1 0 ${W + H - p} ${W + H - p}` },
    bl: { at: 3, pair: [[p, H], [0, H - p]], tri: [[p, H], [0, H], [0, H - p]], m: `0 1 1 0 ${p - H} ${H - p}` },
  };
  const c = cuts[corner];
  const keep = [[0, 0], [W, 0], [W, H], [0, H]].flatMap((q, i) => (i === c.at ? c.pair : [q]));
  return { keep: pts(keep), cut: pts(c.tri), matrix: `matrix(${c.m})` };
}

function tornEdge(W: number, H: number, x: number, seed: number, inset = 0) {
  const rng = mulberry32(seed);
  const n = 14;
  const slant = (rng() - 0.5) * 0.25 * W;
  const edge: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    edge.push([x + slant * (t - 0.5) + (rng() - 0.5) * 0.06 * W + inset, t * H]);
  }
  return pts([[-1, -1], ...edge.map(([ex, ey], i) => [ex, i === 0 ? -1 : i === n ? H + 1 : ey]), [-1, H + 1]]);
}

function Sticker({ id, art, dmg, w, x, y, rot }: { id: string; art: Art; dmg: Damage; w: number; x: number; y: number; rot: number }) {
  const { vw: W, vh: H } = art;
  const peel = dmg.peel && peelGeometry(W, H, dmg.peel);
  const tearX = dmg.tear !== undefined ? dmg.tear * W : undefined;
  const t = dmg.scrape;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={w} height={(w * H) / W} style={{ left: x, top: y, transform: `rotate(${rot}deg)` }}>
      <defs>
        <filter id={`${id}-wear`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed={dmg.seed} result="big" />
          <feColorMatrix in="big" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  16 0 0 0 ${-16 * t}`} result="blob" />
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed={dmg.seed + 7} result="fine" />
          <feColorMatrix in="fine" type="matrix" values="0 0 0 0.16 0.8  0 0 0 0.16 0.78  0 0 0 0.16 0.74  0 0 0 0 1" result="grain" />
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" result="tinted" />
          <feComposite in="tinted" in2="SourceGraphic" operator="in" result="print" />
          <feComposite in="print" in2="blob" operator="out" result="kept" />
          <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="3" seed={dmg.seed + 13} result="soft" />
          <feColorMatrix in="soft" type="matrix" values="0.35 0 0 0 0.6  0.35 0 0 0 0.58  0.35 0 0 0 0.54  -6 0 0 0 4.6" result="residue" />
          <feComposite in="residue" in2="blob" operator="in" result="r1" />
          <feComposite in="r1" in2="SourceGraphic" operator="in" result="r2" />
          <feMerge result="merged">
            <feMergeNode in="r2" />
            <feMergeNode in="kept" />
          </feMerge>
          <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -14 0 0 0 11" result="holes" />
          <feComposite in="merged" in2="holes" operator="in" />
        </filter>
        <filter id={`${id}-residue`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="3" seed={dmg.seed + 3} />
          <feColorMatrix type="matrix" values="0.35 0 0 0 0.6  0.35 0 0 0 0.58  0.35 0 0 0 0.54  -6 0 0 0 4.4" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}-back`} x="-20%" y="-20%" width="140%" height="140%">
          <feFlood floodColor="#ece7dc" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feDropShadow dx="0" dy="0" stdDeviation="1.6" floodOpacity="0.6" />
        </filter>
        {peel && (
          <>
            <clipPath id={`${id}-keep`}>
              <polygon points={peel.keep} />
            </clipPath>
            <clipPath id={`${id}-cut`}>
              <polygon points={peel.cut} />
            </clipPath>
          </>
        )}
        {tearX !== undefined && (
          <>
            <clipPath id={`${id}-keep`}>
              <polygon points={tornEdge(W, H, tearX, dmg.seed)} />
            </clipPath>
            <clipPath id={`${id}-strip`}>
              <polygon points={tornEdge(W, H, tearX, dmg.seed + 1, 0.12 * W)} />
            </clipPath>
          </>
        )}
      </defs>
      {tearX !== undefined && (
        <g clipPath={`url(#${id}-strip)`}>
          <g filter={`url(#${id}-residue)`}>{art.body}</g>
        </g>
      )}
      <g clipPath={peel || tearX !== undefined ? `url(#${id}-keep)` : undefined}>
        <g filter={`url(#${id}-wear)`}>{art.body}</g>
      </g>
      {peel && (
        <g transform={peel.matrix}>
          <g clipPath={`url(#${id}-cut)`}>
            <g filter={`url(#${id}-back)`}>{art.body}</g>
          </g>
        </g>
      )}
    </svg>
  );
}

export function Stickers({ chart, width, titleRight }: StickersProps) {
  const { area } = chart;
  const k = Math.min(1, Math.max(0.6, width / 1440));
  const items: (Item & { x: number; y: number })[] = [];
  for (const c of CLUSTERS) {
    const right = Math.max(...c.items.map((it) => (it.dx + it.w) * k));
    const ax = Math.min(area.x + c.u * area.w, width - right - 6);
    const ay = area.y + c.v * area.h;
    for (const it of c.items) items.push({ ...it, x: ax + it.dx * k, y: ay + it.dy * k });
  }
  if (titleRight !== undefined && width >= 1024 && titleRight + 110 < width - 420) {
    items.push({ art: logo42, dx: 0, dy: 0, w: 50, rot: 15, dmg: TITLE_DAMAGE, x: titleRight + 40, y: Math.max(20, area.y * 0.3) });
  }
  return (
    <div className="wu-stickers" aria-hidden="true">
      {items.map((s, i) => (
        <Sticker key={i} id={`sticker-${i}`} art={s.art} dmg={s.dmg} w={s.w * k} x={s.x} y={s.y} rot={s.rot} />
      ))}
    </div>
  );
}
