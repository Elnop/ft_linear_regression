import type { PaintLayer } from './PaintLayer.ts';

const GRAVITY = 36;
const SPREAD = 22;
const TRAIL_MIN = 0.03;
const TRAIL_GAIN = 0.32;
const DRY_TIME = 3.2;
const MIN_MOBILITY = 0.015;
const THICKENING = 0.8;

export function stepFlow(layer: PaintLayer, deltaSeconds: number): void {
  const active = layer.active;
  if (active.empty) return;
  const width = layer.filmWidth;
  const height = layer.filmHeight;
  const { film, wetMass, pooled, residual, pin, roughness, reached, filmDelta, wetDelta, pooledDelta } = layer;
  const x0 = Math.max(0, active.x0 - 1);
  const x1 = Math.min(width - 1, active.x1 + 1);
  const y0 = Math.max(0, active.y0 - 1);
  const y1 = Math.min(height - 1, active.y1 + 1);

  for (let y = y0; y <= y1; y++) {
    filmDelta.fill(0, y * width + x0, y * width + x1 + 1);
    wetDelta.fill(0, y * width + x0, y * width + x1 + 1);
    pooledDelta.fill(0, y * width + x0, y * width + x1 + 1);
  }

  const move = (from: number, to: number, amount: number, mobility: number, poolShare: number) => {
    filmDelta[from] -= amount;
    wetDelta[from] -= amount * mobility;
    pooledDelta[from] -= amount * poolShare;
    filmDelta[to] += amount;
    wetDelta[to] += amount * mobility;
    pooledDelta[to] += amount;
  };

  const reach = (index: number, excess: number) => {
    if (reached[index] || film[index] > residual[index] * 0.5) return;
    reached[index] = 1;
    residual[index] *= Math.min(0.85, Math.max(0.07, TRAIL_MIN + TRAIL_GAIN * excess)) * (0.75 + 0.5 * roughness[index]);
  };

  const level = (from: number, to: number, excess: number, mobility: number, poolShare: number) => {
    const targetExcess = film[to] - residual[to];
    let amount = 0;
    if (film[to] > residual[to] * 0.5) {
      if (excess > targetExcess) amount = SPREAD * mobility * (excess - Math.max(targetExcess, 0)) * deltaSeconds * 0.5;
    } else if (excess > pin[to] * 2) {
      amount = SPREAD * mobility * (excess - pin[to] * 2) * deltaSeconds * 0.25;
    }
    if (amount > 0) move(from, to, Math.min(amount, excess * 0.2), mobility, poolShare);
  };

  const accept = (index: number, excess: number) => {
    const thickness = film[index];
    const grip = 1.15 - 0.6 * roughness[index];
    if (thickness > residual[index] * 0.5) return (0.3 + thickness) * grip;
    if (excess > pin[index]) return 0.3 * grip * Math.min(1, (excess - pin[index]) * 4);
    const closeness = (excess - 0.6 * pin[index]) / (0.4 * pin[index]);
    return closeness > 0 ? 0.015 * grip * closeness * closeness : 0;
  };

  const side = (index: number, excess: number) => (film[index] > residual[index] * 0.5 ? 0.12 * accept(index, excess) : 0);

  for (let y = y0; y <= Math.min(y1, height - 2); y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * width + x;
      const thickness = film[i];
      if (thickness <= residual[i]) continue;
      const mobility = wetMass[i] / thickness;
      if (mobility < MIN_MOBILITY) continue;
      const excess = thickness - residual[i] * (1 + THICKENING * (1 - mobility));
      if (excess <= 0) continue;
      const poolShare = pooled[i] / thickness;

      if (x < width - 1) level(i, i + 1, excess, mobility, poolShare);
      if (x > 0) level(i, i - 1, excess, mobility, poolShare);

      const below = i + width;
      const weightBelow = accept(below, excess);
      let weightLeft = 0;
      let weightRight = 0;
      if (x > 0) weightLeft = side(below - 1, excess);
      if (x < width - 1) weightRight = side(below + 1, excess);
      const sum = weightLeft + weightBelow + weightRight;
      if (sum === 0) continue;
      const amount = excess * Math.min(0.45, GRAVITY * mobility * excess * deltaSeconds);
      if (weightBelow > 0) reach(below, excess), move(i, below, (amount * weightBelow) / sum, mobility, poolShare);
      if (weightLeft > 0) reach(below - 1, excess), move(i, below - 1, (amount * weightLeft) / sum, mobility, poolShare);
      if (weightRight > 0) reach(below + 1, excess), move(i, below + 1, (amount * weightRight) / sum, mobility, poolShare);
    }
  }

  active.reset();
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * width + x;
      let thickness = film[i] + filmDelta[i];
      if (thickness < 1e-6) thickness = 0;
      let mass = wetMass[i] + wetDelta[i];
      if (thickness === 0 || mass < 0) mass = 0;
      mass *= 1 - deltaSeconds / (DRY_TIME * (0.4 + 0.6 * Math.min(thickness, 3)));
      film[i] = thickness;
      wetMass[i] = mass;
      pooled[i] = Math.min(thickness, Math.max(0, pooled[i] + pooledDelta[i]));
      if (mass > MIN_MOBILITY * thickness && thickness > residual[i]) active.grow(x, y, x, y);
    }
  }
  layer.filmDirty.grow(x0, y0, x1, y1);
}
