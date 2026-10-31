import { hexToRgb } from './color.ts';
import type { Rectangle } from '@/shared/lib/geometry.ts';
import type { LayerOptions, Rgb } from './SprayTypes.ts';
import type { Roughness } from './roughness.ts';
import { mulberry32, noise2D } from '@/shared/lib/random.ts';

export const FILM_SCALE = 0.25;
const CELL = 1 / FILM_SCALE;

const RESIDUAL = 0.85;
const PIN = 0.55;

export type CellRectangle = { x0: number; y0: number; x1: number; y1: number };

export class DirtyRectangle implements CellRectangle {
  x0 = Infinity;
  y0 = Infinity;
  x1 = -Infinity;
  y1 = -Infinity;

  get empty(): boolean {
    return this.x1 < this.x0;
  }

  grow(x0: number, y0: number, x1: number, y1: number): void {
    if (x0 < this.x0) this.x0 = x0;
    if (y0 < this.y0) this.y0 = y0;
    if (x1 > this.x1) this.x1 = x1;
    if (y1 > this.y1) this.y1 = y1;
  }

  reset(): void {
    this.x0 = this.y0 = Infinity;
    this.x1 = this.y1 = -Infinity;
  }
}

let nextId = 1;

export class PaintLayer {
  readonly id = nextId++;
  readonly bounds: Rectangle;
  readonly hex: string;
  readonly color: Rgb;
  readonly z: number;
  opacity: number;
  gray = 0;

  readonly filmWidth: number;
  readonly filmHeight: number;
  readonly film: Float32Array;
  readonly wetMass: Float32Array;
  readonly pooled: Float32Array;
  readonly residual: Float32Array;
  readonly pin: Float32Array;
  readonly roughness: Float32Array;
  readonly reached: Uint8Array;
  readonly filmDelta: Float32Array;
  readonly wetDelta: Float32Array;
  readonly pooledDelta: Float32Array;

  readonly mistWidth: number;
  readonly mistHeight: number;
  readonly mist: Uint8Array;

  readonly active = new DirtyRectangle();
  readonly filmDirty = new DirtyRectangle();
  readonly mistDirty = new DirtyRectangle();
  gloss = 1;

  constructor({ bounds, color, opacity = 1, z = 0 }: LayerOptions & { bounds: Rectangle }, roughness: Roughness) {
    const x = Math.floor(bounds.x / CELL) * CELL;
    const y = Math.floor(bounds.y / CELL) * CELL;
    this.filmWidth = Math.max(2, Math.ceil((bounds.x + bounds.width - x) / CELL));
    this.filmHeight = Math.max(2, Math.ceil((bounds.y + bounds.height - y) / CELL));
    this.bounds = { x, y, width: this.filmWidth * CELL, height: this.filmHeight * CELL };
    this.hex = color;
    this.color = hexToRgb(color);
    this.z = z;
    this.opacity = opacity;

    const cellCount = this.filmWidth * this.filmHeight;
    this.film = new Float32Array(cellCount);
    this.wetMass = new Float32Array(cellCount);
    this.pooled = new Float32Array(cellCount);
    this.residual = new Float32Array(cellCount);
    this.pin = new Float32Array(cellCount);
    this.roughness = new Float32Array(cellCount);
    this.reached = new Uint8Array(cellCount);
    this.filmDelta = new Float32Array(cellCount);
    this.wetDelta = new Float32Array(cellCount);
    this.pooledDelta = new Float32Array(cellCount);
    this.mistWidth = this.bounds.width;
    this.mistHeight = this.bounds.height;
    this.mist = new Uint8Array(this.mistWidth * this.mistHeight);

    const random = mulberry32(this.id * 7919);
    const patch = noise2D(this.id);
    const originX = x / CELL;
    const originY = y / CELL;
    for (let j = 0; j < this.filmHeight; j++) {
      for (let i = 0; i < this.filmWidth; i++) {
        const cellRoughness = roughness.at(originX + i, originY + j);
        const patchNoise = patch((originX + i) / 3, (originY + j) / 3);
        const k = j * this.filmWidth + i;
        this.roughness[k] = cellRoughness;
        this.residual[k] = RESIDUAL * (0.7 + 0.5 * cellRoughness + 0.3 * patchNoise + 0.1 * (random() - 0.5));
        this.pin[k] = PIN * (0.3 + 1.1 * cellRoughness * cellRoughness + 1.4 * patchNoise * patchNoise * patchNoise + 0.4 * random() * random());
      }
    }
  }

  depositFilm(pointX: number, pointY: number, mass: number): void {
    const filmX = (pointX - this.bounds.x) / CELL - 0.5;
    const filmY = (pointY - this.bounds.y) / CELL - 0.5;
    const cellX = Math.floor(filmX);
    const cellY = Math.floor(filmY);
    if (cellX < 0 || cellY < 0 || cellX >= this.filmWidth - 1 || cellY >= this.filmHeight - 1) return;
    const fractionX = filmX - cellX;
    const fractionY = filmY - cellY;
    const density = mass / (CELL * CELL);
    const k = cellY * this.filmWidth + cellX;
    this.add(k, density * (1 - fractionX) * (1 - fractionY));
    this.add(k + 1, density * fractionX * (1 - fractionY));
    this.add(k + this.filmWidth, density * (1 - fractionX) * fractionY);
    this.add(k + this.filmWidth + 1, density * fractionX * fractionY);
    this.active.grow(cellX, cellY, cellX + 1, cellY + 1);
    this.filmDirty.grow(cellX, cellY, cellX + 1, cellY + 1);
  }

  depositSplat(pointX: number, pointY: number, radius: number, mass: number): void {
    const cellRadius = radius / CELL;
    const centerX = (pointX - this.bounds.x) / CELL - 0.5;
    const centerY = (pointY - this.bounds.y) / CELL - 0.5;
    const x0 = Math.max(0, Math.floor(centerX - cellRadius));
    const x1 = Math.min(this.filmWidth - 1, Math.ceil(centerX + cellRadius));
    const y0 = Math.max(0, Math.floor(centerY - cellRadius));
    const y1 = Math.min(this.filmHeight - 1, Math.ceil(centerY + cellRadius));
    if (x0 > x1 || y0 > y1) return;
    let total = 0;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const distanceSquared = ((x - centerX) ** 2 + (y - centerY) ** 2) / (cellRadius * cellRadius);
        if (distanceSquared < 1) total += 1 - distanceSquared;
      }
    }
    if (total === 0) return;
    const density = mass / (CELL * CELL) / total;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const distanceSquared = ((x - centerX) ** 2 + (y - centerY) ** 2) / (cellRadius * cellRadius);
        if (distanceSquared >= 1) continue;
        this.add(y * this.filmWidth + x, density * (1 - distanceSquared));
      }
    }
    this.active.grow(x0, y0, x1, y1);
    this.filmDirty.grow(x0, y0, x1, y1);
  }

  depositMist(pointX: number, pointY: number, amount: number, radius: number): void {
    const centerX = pointX - this.bounds.x;
    const centerY = pointY - this.bounds.y;
    const reach = Math.max(radius, 0.5);
    const x0 = Math.max(0, Math.floor(centerX - reach - 0.5));
    const y0 = Math.max(0, Math.floor(centerY - reach - 0.5));
    const x1 = Math.min(this.mistWidth - 1, Math.floor(centerX + reach + 0.5));
    const y1 = Math.min(this.mistHeight - 1, Math.floor(centerY + reach + 0.5));
    if (x0 > x1 || y0 > y1) return;
    const strength = amount * Math.min(1, radius / 0.5) ** 2;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - centerX;
        const dy = y + 0.5 - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const coverage = Math.min(1, Math.max(0, reach + 0.5 - distance));
        if (coverage <= 0) continue;
        const k = y * this.mistWidth + x;
        this.mist[k] = Math.min(255, this.mist[k] + strength * coverage);
      }
    }
    this.mistDirty.grow(x0, y0, x1, y1);
  }

  private add(index: number, mass: number): void {
    this.film[index] += mass;
    this.wetMass[index] += mass;
  }

  shownColor(): Rgb {
    const [red, green, blue] = this.color;
    const mix = (channel: number) => channel + (0.5 - channel) * this.gray;
    return [mix(red), mix(green), mix(blue)];
  }

  get wet(): boolean {
    return !this.active.empty;
  }
}
