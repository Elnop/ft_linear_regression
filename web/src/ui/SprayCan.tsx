import { useEffect, useEffectEvent, useRef } from 'react';
import type { PaintEngine } from '@/lib/paint/engine.ts';
import type { Rgb } from '@/lib/paint/types.ts';

const VIEW_W = 140;
const VIEW_H = 340;
const HOLE = { x: 44.5, y: 33 };
const BASE_TILT = -14;
const PARK_AFTER = 2.5;
const SHAKE = 0.6;
const GRAVITY = 2600;
const SUBSTEP = 1 / 240;

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

export type SprayCanProps = {
  engine: PaintEngine | null;
  hidden?: boolean;
};

export function SprayCan({ engine, hidden = false }: SprayCanProps) {
  const box = useRef<HTMLDivElement>(null);
  const mist = useRef<HTMLCanvasElement>(null);
  const isHidden = useEffectEvent(() => hidden);

  useEffect(() => {
    if (!engine || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = box.current!;
    const canvas = mist.current!;
    const ctx = canvas.getContext('2d')!;

    const pos = { x: window.innerWidth + 200, y: window.innerHeight * 0.3 };
    const vel = { x: 0, y: 0 };
    const aim = { x: pos.x, y: pos.y, vx: 0, vy: 0 };
    let angle = BASE_TILT;
    let shake = 0;
    let idle = PARK_AFTER;
    let fall: { vx: number; vy: number; spin: number } | null = null;
    let color = '';
    let misty = false;
    let last = performance.now();
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = window.innerWidth;
      const canW = Math.max(64, Math.min(110, w * 0.075));
      const scale = canW / VIEW_W;

      const n = engine.nozzle();
      const spraying = !!n && n.active <= 2 && !isHidden();
      if (spraying) {
        idle = 0;
        const hex = toHex(n.color);
        if (hex !== color) {
          color = hex;
          shake = SHAKE;
          el.style.setProperty('--paint', hex);
        }
        const tx = n.x + canW * 0.36;
        const ty = n.y - canW * 0.1;
        const jump = Math.hypot(tx - aim.x, ty - aim.y);
        if (fall || jump > canW * 0.6 || dt === 0) {
          aim.vx = 0;
          aim.vy = 0;
        } else {
          const k = Math.min(1, dt * 12);
          aim.vx += ((tx - aim.x) / dt - aim.vx) * k;
          aim.vy += ((ty - aim.y) / dt - aim.vy) * k;
        }
        aim.x = tx;
        aim.y = ty;
      } else {
        idle += dt;
      }

      if (spraying && fall) {
        fall = null;
        vel.x = 0;
        vel.y = 0;
        angle = BASE_TILT + ((((angle - BASE_TILT + 180) % 360) + 360) % 360) - 180;
      } else if (!spraying && !fall && idle >= PARK_AFTER) {
        fall = { vx: vel.x * 0.3 + (Math.random() - 0.5) * 80, vy: -180, spin: (Math.random() < 0.5 ? -1 : 1) * (140 + Math.random() * 120) };
      }

      shake = Math.max(0, shake - dt);
      const rattle = shake > 0 ? Math.sin(shake * 30) * (shake / SHAKE) : 0;
      if (fall) {
        if (pos.y < window.innerHeight + canW * 3) {
          fall.vy += GRAVITY * dt;
          pos.x += fall.vx * dt;
          pos.y += fall.vy * dt;
          angle += fall.spin * dt;
        }
      } else {
        const w0 = spraying ? 26 : 14;
        const feed = spraying ? 1 : 0;
        for (let left = dt; left > 1e-6; left -= SUBSTEP) {
          const h = Math.min(SUBSTEP, left);
          vel.x += (w0 * w0 * (aim.x - pos.x) + 2 * w0 * (aim.vx * feed - vel.x)) * h;
          vel.y += (w0 * w0 * (aim.y - pos.y) + 2 * w0 * (aim.vy * feed - vel.y)) * h;
          pos.x += vel.x * h;
          pos.y += vel.y * h;
        }
        const tilt = BASE_TILT + Math.max(-8, Math.min(8, vel.x * 0.008)) + rattle * 6;
        angle += (tilt - angle) * Math.min(1, dt * 6);
      }

      const hx = HOLE.x * scale;
      const hy = HOLE.y * scale;
      el.style.width = `${canW}px`;
      el.style.transformOrigin = `${hx}px ${hy}px`;
      el.style.transform = `translate(${pos.x - hx}px, ${pos.y - hy + rattle * 2}px) rotate(${angle}deg)`;
      el.classList.toggle('pressed', spraying);
      el.classList.toggle('gone', isHidden() || (!!n && n.active > 2));

      if (misty) ctx.clearRect(0, 0, w, window.innerHeight);
      misty = spraying;
      if (spraying) drawMist(ctx, pos, n, color, canW);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [engine]);

  return (
    <>
      <canvas ref={mist} className="spray-mist" aria-hidden="true" />
      <div ref={box} className="spray-can gone" aria-hidden="true">
        <SprayCanArt />
      </div>
    </>
  );
}

function drawMist(ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, color: string, canW: number) {
  const g = ctx.createRadialGradient(to.x, to.y, 0, to.x, to.y, canW * 0.28);
  g.addColorStop(0, `${color}38`);
  g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g;
  ctx.fillRect(to.x - canW, to.y - canW, canW * 2, canW * 2);
  ctx.fillStyle = color;
  for (let i = 0; i < 26; i++) {
    const k = Math.random();
    const spread = k * canW * 0.07;
    ctx.globalAlpha = 0.25 + 0.4 * (1 - k);
    ctx.fillRect(from.x + (to.x - from.x) * k + gauss() * spread, from.y + (to.y - from.y) * k + gauss() * spread, 1.2, 1.2);
  }
  ctx.globalAlpha = 1;
}

function gauss(): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function toHex(c: Rgb): string {
  return `#${c.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`;
}

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
