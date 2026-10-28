import type { Rect, Rgb } from './types.ts';
import type { Roughness } from './roughness.ts';
import { mulberry32, noise2D } from './random.ts';

export const FILM_SCALE = 0.25;
const CELL = 1 / FILM_SCALE;

const RESIDUAL = 0.85;
const PIN = 0.55;

export type CellRect = { x0: number; y0: number; x1: number; y1: number };

function emptyRect(): CellRect {
  return { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
}

export function isEmpty(r: CellRect): boolean {
  return r.x1 < r.x0;
}

function grow(r: CellRect, x0: number, y0: number, x1: number, y1: number): void {
  if (x0 < r.x0) r.x0 = x0;
  if (y0 < r.y0) r.y0 = y0;
  if (x1 > r.x1) r.x1 = x1;
  if (y1 > r.y1) r.y1 = y1;
}

export function resetRect(r: CellRect): void {
  r.x0 = r.y0 = Infinity;
  r.x1 = r.y1 = -Infinity;
}

let nextId = 1;

export class PaintLayer {
  readonly id = nextId++;
  readonly bounds: Rect;
  readonly color: Rgb;
  opacity: number;
  gray = 0;

  shownColor(): Rgb {
    const g = 0.5;
    const k = this.gray;
    return [this.color[0] + (g - this.color[0]) * k, this.color[1] + (g - this.color[1]) * k, this.color[2] + (g - this.color[2]) * k];
  }

  readonly fw: number;
  readonly fh: number;
  readonly film: Float32Array;
  readonly wetMass: Float32Array;
  readonly pooled: Float32Array;
  readonly residual: Float32Array;
  readonly pin: Float32Array;
  readonly rough: Float32Array;
  readonly reached: Uint8Array;
  readonly dFilm: Float32Array;
  readonly dWet: Float32Array;
  readonly dPooled: Float32Array;

  readonly mw: number;
  readonly mh: number;
  readonly mist: Uint8Array;

  readonly active = emptyRect();
  readonly filmDirty = emptyRect();
  readonly mistDirty = emptyRect();
  gloss = 1;

  constructor(bounds: Rect, color: Rgb, opacity: number, roughness: Roughness) {
    const x = Math.floor(bounds.x / CELL) * CELL;
    const y = Math.floor(bounds.y / CELL) * CELL;
    this.fw = Math.max(2, Math.ceil((bounds.x + bounds.w - x) / CELL));
    this.fh = Math.max(2, Math.ceil((bounds.y + bounds.h - y) / CELL));
    this.bounds = { x, y, w: this.fw * CELL, h: this.fh * CELL };
    this.color = color;
    this.opacity = opacity;

    const n = this.fw * this.fh;
    this.film = new Float32Array(n);
    this.wetMass = new Float32Array(n);
    this.pooled = new Float32Array(n);
    this.residual = new Float32Array(n);
    this.pin = new Float32Array(n);
    this.rough = new Float32Array(n);
    this.reached = new Uint8Array(n);
    this.dFilm = new Float32Array(n);
    this.dWet = new Float32Array(n);
    this.dPooled = new Float32Array(n);
    this.mw = this.bounds.w;
    this.mh = this.bounds.h;
    this.mist = new Uint8Array(this.mw * this.mh);

    const rng = mulberry32(this.id * 7919);
    const patch = noise2D(this.id);
    const ox = x / CELL;
    const oy = y / CELL;
    for (let j = 0; j < this.fh; j++) {
      for (let i = 0; i < this.fw; i++) {
        const r = roughness.at(ox + i, oy + j);
        const n = patch((ox + i) / 3, (oy + j) / 3);
        const k = j * this.fw + i;
        this.rough[k] = r;
        this.residual[k] = RESIDUAL * (0.7 + 0.5 * r + 0.3 * n + 0.1 * (rng() - 0.5));
        this.pin[k] = PIN * (0.3 + 1.1 * r * r + 1.4 * n * n * n + 0.4 * rng() * rng());
      }
    }
  }

  depositFilm(px: number, py: number, mass: number): void {
    const fx = (px - this.bounds.x) / CELL - 0.5;
    const fy = (py - this.bounds.y) / CELL - 0.5;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    if (ix < 0 || iy < 0 || ix >= this.fw - 1 || iy >= this.fh - 1) return;
    const tx = fx - ix;
    const ty = fy - iy;
    const t = mass / (CELL * CELL);
    const k = iy * this.fw + ix;
    const a = t * (1 - tx) * (1 - ty);
    const b = t * tx * (1 - ty);
    const c = t * (1 - tx) * ty;
    const d = t * tx * ty;
    this.film[k] += a;
    this.wetMass[k] += a;
    this.film[k + 1] += b;
    this.wetMass[k + 1] += b;
    this.film[k + this.fw] += c;
    this.wetMass[k + this.fw] += c;
    this.film[k + this.fw + 1] += d;
    this.wetMass[k + this.fw + 1] += d;
    grow(this.active, ix, iy, ix + 1, iy + 1);
    grow(this.filmDirty, ix, iy, ix + 1, iy + 1);
  }

  depositSplat(px: number, py: number, radius: number, mass: number): void {
    const r = radius / CELL;
    const cx = (px - this.bounds.x) / CELL - 0.5;
    const cy = (py - this.bounds.y) / CELL - 0.5;
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(this.fw - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(this.fh - 1, Math.ceil(cy + r));
    if (x0 > x1 || y0 > y1) return;
    let total = 0;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d2 = ((x - cx) ** 2 + (y - cy) ** 2) / (r * r);
        if (d2 < 1) total += 1 - d2;
      }
    }
    if (total === 0) return;
    const t = mass / (CELL * CELL) / total;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d2 = ((x - cx) ** 2 + (y - cy) ** 2) / (r * r);
        if (d2 >= 1) continue;
        const k = y * this.fw + x;
        this.film[k] += t * (1 - d2);
        this.wetMass[k] += t * (1 - d2);
      }
    }
    grow(this.active, x0, y0, x1, y1);
    grow(this.filmDirty, x0, y0, x1, y1);
  }

  depositMist(px: number, py: number, amount: number, radius: number): void {
    const cx = px - this.bounds.x;
    const cy = py - this.bounds.y;
    const r = Math.max(radius, 0.5);
    const x0 = Math.max(0, Math.floor(cx - r - 0.5));
    const y0 = Math.max(0, Math.floor(cy - r - 0.5));
    const x1 = Math.min(this.mw - 1, Math.floor(cx + r + 0.5));
    const y1 = Math.min(this.mh - 1, Math.floor(cy + r + 0.5));
    if (x0 > x1 || y0 > y1) return;
    const a = amount * Math.min(1, radius / 0.5) ** 2;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        const c = Math.min(1, Math.max(0, r + 0.5 - d));
        if (c <= 0) continue;
        const k = y * this.mw + x;
        this.mist[k] = Math.min(255, this.mist[k] + a * c);
      }
    }
    grow(this.mistDirty, x0, y0, x1, y1);
  }

  markFilmDirty(r: CellRect): void {
    grow(this.filmDirty, r.x0, r.y0, r.x1, r.y1);
  }

  get wet(): boolean {
    return !isEmpty(this.active);
  }
}
