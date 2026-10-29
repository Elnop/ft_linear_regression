import type { PaintLayer } from './layer.ts';
import { gaussian, mulberry32, noise1D, randomSeed, type Rng } from '@/lib/random.ts';
import type { SprayDotOptions, SprayPathOptions, Vec2 } from './types.ts';

export type Job = { pos: Vec2; update(dt: number): boolean };

const NOMINAL_SPEED = 520;
const DROPLET = 0.05;
const SPRAY_SIGMA = 3.6;
const MIST_CLUMPS = 0.12;
const SPLATS_PER_SECOND = 2.2;
const MIST_PER_MASS = 255 / 1.6;

function droplet(layer: PaintLayer, rng: Rng, x: number, y: number): void {
  const big = rng() < 0.07;
  const radius = big ? 0.8 + rng() * 0.8 : 0.3 + rng() * 0.45;
  layer.depositMist(x, y, big ? 140 + rng() * 115 : 40 + rng() * 80, radius);
}

function spray(layer: PaintLayer, rng: Rng, x: number, y: number, sigma: number, mass: number, dt: number): void {
  const n = Math.floor(mass / DROPLET + rng());
  for (let k = 0; k < n; k++) {
    const dx = gaussian(rng) * sigma;
    const dy = gaussian(rng) * sigma;
    const m = DROPLET * Math.exp(0.6 * gaussian(rng) - 0.18);
    const r = Math.sqrt(dx * dx + dy * dy) / sigma;
    if (r > 1.1 && rng() < (r - 1.1) * 1.4) layer.depositMist(x + dx, y + dy, m * MIST_PER_MASS, 0.4 + 0.3 * rng());
    else layer.depositFilm(x + dx, y + dy, m);
  }
  const clumps = Math.floor(n * MIST_CLUMPS + rng());
  for (let k = 0; k < clumps; k++) {
    const spread = sigma * (rng() < 0.06 ? 3.4 : 1.8);
    const cx = x + gaussian(rng) * spread;
    const cy = y + gaussian(rng) * spread;
    const size = 1 + Math.floor(rng() * rng() * 6);
    for (let d = 0; d < size; d++) droplet(layer, rng, cx + gaussian(rng) * 1.6, cy + gaussian(rng) * 1.6);
  }
  if (rng() < SPLATS_PER_SECOND * dt) {
    const r = sigma * (0.25 + 0.3 * rng());
    layer.depositSplat(x + gaussian(rng) * sigma * 1.3, y + gaussian(rng) * sigma * 1.3, r, DROPLET * (8 + 30 * rng() ** 2));
  }
}

type Sampled = { at(s: number): Vec2; normal(s: number): Vec2; length: number };

function samplePath(points: Vec2[]): Sampled {
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  const length = cum[cum.length - 1];
  const seg = (s: number) => {
    let i = 1;
    while (i < cum.length - 1 && cum[i] < s) i++;
    return i;
  };
  return {
    length,
    at(s) {
      const i = seg(s);
      const span = cum[i] - cum[i - 1] || 1;
      const t = Math.min(1, Math.max(0, (s - cum[i - 1]) / span));
      const a = points[i - 1];
      const b = points[i];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    },
    normal(s) {
      const i = seg(s);
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const d = Math.hypot(dx, dy) || 1;
      return { x: -dy / d, y: dx / d };
    },
  };
}

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export function pathJob(layer: PaintLayer, points: Vec2[], o: SprayPathOptions): Job {
  const rng = mulberry32(o.seed ?? randomSeed());
  const path = samplePath(points);
  const L = path.length;
  const speed = o.speed ?? NOMINAL_SPEED;
  const width = o.width ?? 16;
  const load = o.load ?? 1.2;
  const dwell = (o.dwell ?? 70) / 1000;
  const taper = o.end ? o.end === 'taper' : rng() < 0.5;
  const sigma0 = width / SPRAY_SIGMA;
  const rate = load * NOMINAL_SPEED * Math.sqrt(2 * Math.PI) * sigma0;

  const pressure = [noise1D(rng), noise1D(rng)];
  const distance = [noise1D(rng), noise1D(rng)];
  const wobble = [noise1D(rng), noise1D(rng)];
  const pace = noise1D(rng);
  const ramp = Math.min(90, L * 0.12);
  const count = o.hesitations ?? Math.max(1, Math.round((L / 380) * (0.7 + 0.6 * rng())));
  const stops = Array.from({ length: count }, (_, k) => ({
    s: L * (0.1 + (0.8 * (k + 0.2 + 0.6 * rng())) / count),
    w: 12 + 30 * rng(),
    depth: 0.55 + 0.25 * rng(),
  }));

  const speedAt = (s: number) => {
    let v = speed * (0.42 + 0.58 * smooth(s / ramp) * smooth((L - s) / ramp));
    if (taper) v = Math.max(v, speed * 0.8 * smooth((s - (L - ramp)) / ramp));
    for (const h of stops) v *= 1 - h.depth * Math.exp(-(((s - h.s) / h.w) ** 2));
    return v * (1 + 0.12 * pace(s / 110));
  };
  const nozzle = (s: number) => {
    const p = path.at(s);
    const n = path.normal(s);
    const off = 1.6 * wobble[0](s / 380) + 0.4 * wobble[1](s / 90);
    return { x: p.x + n.x * off, y: p.y + n.y * off };
  };
  const pos = { ...points[0] };
  const emit = (s: number, dt: number) => {
    const p = nozzle(s);
    pos.x = p.x;
    pos.y = p.y;
    const sigma = sigma0 * (1 + 0.12 * distance[0](s / 220) + 0.05 * distance[1](s / 60));
    let flow = 1 + 0.12 * pressure[0](s / 150) + 0.06 * pressure[1](s / 40);
    if (taper) flow *= 0.15 + 0.85 * smooth((L - s) / 40);
    spray(layer, rng, p.x, p.y, sigma, rate * flow * dt, dt);
  };

  let s = 0;
  let wait = dwell;
  let tail = taper ? 0 : dwell;
  return {
    pos,
    update(dt) {
      if (wait > 0) {
        const t = Math.min(wait, dt);
        emit(0, t);
        wait -= t;
        dt -= t;
      }
      while (dt > 1e-6 && s < L) {
        const v = speedAt(s);
        const h = Math.min(dt, 1 / v);
        emit(s, h);
        s = Math.min(L, s + v * h);
        dt -= h;
      }
      if (s >= L && dt > 0 && tail > 0) {
        const t = Math.min(tail, dt);
        emit(L, t);
        tail -= t;
      }
      return s >= L && tail <= 0;
    },
  };
}

export function moveJob(points: Vec2[], speed: number): Job {
  const path = samplePath(points);
  const pos = { ...points[0] };
  let s = 0;
  return {
    pos,
    update(dt) {
      s = Math.min(path.length, s + speed * dt);
      const p = path.at(s);
      pos.x = p.x;
      pos.y = p.y;
      return s >= path.length;
    },
  };
}

export function dotJob(layer: PaintLayer, x: number, y: number, o: SprayDotOptions): Job {
  const rng = mulberry32(o.seed ?? randomSeed());
  const duration = (o.duration ?? 180) / 1000;
  const sigma = (o.width ?? 14) / 4.2;
  const load = o.load ?? 2.4;
  const rate = (load * 2 * Math.PI * sigma * sigma) / duration;
  const tx = noise1D(rng);
  const ty = noise1D(rng);
  const puff = noise1D(rng);
  let t = 0;
  return {
    pos: { x, y },
    update(dt) {
      const step = Math.min(dt, duration - t);
      for (let k = 0; k < 6; k++) {
        const u = (t + (step * k) / 6) * 25;
        const jx = 1.3 * tx(u) + gaussian(rng) * 0.12 * sigma;
        const jy = 1.3 * ty(u) + gaussian(rng) * 0.12 * sigma;
        const f = 1 + 0.5 * puff(u * 2);
        spray(layer, rng, x + jx, y + jy, sigma * (0.85 + 0.3 * rng()), (rate * step * f) / 6, step / 6);
      }
      t += step;
      return t >= duration;
    },
  };
}
