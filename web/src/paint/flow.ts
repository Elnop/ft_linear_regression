import { isEmpty, resetRect, type PaintLayer } from './layer.ts';

const GRAVITY = 36;
const SPREAD = 22;
const TRAIL_MIN = 0.03;
const TRAIL_GAIN = 0.32;
const DRY_TIME = 3.2;
const MIN_MOBILITY = 0.015;
const THICKENING = 0.8;

export function stepFlow(L: PaintLayer, dt: number): void {
  const a = L.active;
  if (isEmpty(a)) return;
  const W = L.fw;
  const H = L.fh;
  const { film: h, wetMass: M, pooled: F, residual: R, pin: P, rough, reached, dFilm: dh, dWet: dM, dPooled: dF } = L;
  const x0 = Math.max(0, a.x0 - 1);
  const x1 = Math.min(W - 1, a.x1 + 1);
  const y0 = Math.max(0, a.y0 - 1);
  const y1 = Math.min(H - 1, a.y1 + 1);

  for (let y = y0; y <= y1; y++) {
    dh.fill(0, y * W + x0, y * W + x1 + 1);
    dM.fill(0, y * W + x0, y * W + x1 + 1);
    dF.fill(0, y * W + x0, y * W + x1 + 1);
  }

  const move = (i: number, j: number, q: number, mob: number, pool: number) => {
    dh[i] -= q;
    dM[i] -= q * mob;
    dF[i] -= q * pool;
    dh[j] += q;
    dM[j] += q * mob;
    dF[j] += q;
  };

  const reach = (j: number, e: number) => {
    if (reached[j] || h[j] > R[j] * 0.5) return;
    reached[j] = 1;
    R[j] *= Math.min(0.85, Math.max(0.07, TRAIL_MIN + TRAIL_GAIN * e)) * (0.75 + 0.5 * rough[j]);
  };

  const level = (i: number, j: number, e: number, mob: number, pool: number) => {
    const ej = h[j] - R[j];
    let f = 0;
    if (h[j] > R[j] * 0.5) {
      if (e > ej) f = SPREAD * mob * (e - Math.max(ej, 0)) * dt * 0.5;
    } else if (e > P[j] * 2) {
      f = SPREAD * mob * (e - P[j] * 2) * dt * 0.25;
    }
    if (f > 0) move(i, j, Math.min(f, e * 0.2), mob, pool);
  };

  for (let y = y0; y <= Math.min(y1, H - 2); y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * W + x;
      const hi = h[i];
      if (hi <= R[i]) continue;
      const mob = M[i] / hi;
      if (mob < MIN_MOBILITY) continue;
      const e = hi - R[i] * (1 + THICKENING * (1 - mob));
      if (e <= 0) continue;
      const pool = F[i] / hi;

      if (x < W - 1) level(i, i + 1, e, mob, pool);
      if (x > 0) level(i, i - 1, e, mob, pool);

      const b = i + W;
      const wc = accept(h, R, P, rough, b, e);
      let wl = 0;
      let wr = 0;
      if (x > 0) wl = side(h, R, P, rough, b - 1, e);
      if (x < W - 1) wr = side(h, R, P, rough, b + 1, e);
      const sum = wl + wc + wr;
      if (sum === 0) continue;
      const q = e * Math.min(0.45, GRAVITY * mob * e * dt);
      if (wc > 0) reach(b, e), move(i, b, (q * wc) / sum, mob, pool);
      if (wl > 0) reach(b - 1, e), move(i, b - 1, (q * wl) / sum, mob, pool);
      if (wr > 0) reach(b + 1, e), move(i, b + 1, (q * wr) / sum, mob, pool);
    }
  }

  resetRect(a);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * W + x;
      let hi = h[i] + dh[i];
      if (hi < 1e-6) hi = 0;
      let m = M[i] + dM[i];
      if (hi === 0 || m < 0) m = 0;
      m *= 1 - dt / (DRY_TIME * (0.4 + 0.6 * Math.min(hi, 3)));
      h[i] = hi;
      M[i] = m;
      F[i] = Math.min(hi, Math.max(0, F[i] + dF[i]));
      if (m > MIN_MOBILITY * hi && hi > R[i]) {
        if (x < a.x0) a.x0 = x;
        if (x > a.x1) a.x1 = x;
        if (y < a.y0) a.y0 = y;
        if (y > a.y1) a.y1 = y;
      }
    }
  }
  L.markFilmDirty({ x0, y0, x1, y1 });
}

function accept(h: Float32Array, R: Float32Array, P: Float32Array, rough: Float32Array, j: number, e: number): number {
  const hj = h[j];
  const r = 1.15 - 0.6 * rough[j];
  if (hj > R[j] * 0.5) return (0.3 + hj) * r;
  if (e > P[j]) return 0.3 * r * Math.min(1, (e - P[j]) * 4);
  const c = (e - 0.6 * P[j]) / (0.4 * P[j]);
  return c > 0 ? 0.015 * r * c * c : 0;
}

function side(h: Float32Array, R: Float32Array, P: Float32Array, rough: Float32Array, j: number, e: number): number {
  return h[j] > R[j] * 0.5 ? 0.12 * accept(h, R, P, rough, j, e) : 0;
}
