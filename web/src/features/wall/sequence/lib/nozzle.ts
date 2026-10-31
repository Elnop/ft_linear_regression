import { smoothstep } from '@/features/wall/shared/lib/smoothstep.ts';
import type { PaintLayer } from '@/features/wall/shared/lib/PaintLayer.ts';
import { gaussian, mulberry32, noise1D, randomSeed } from '@/features/wall/shared/lib/random.ts';
import type { Vec2 } from '@/shared/types/GeometryTypes.ts';
import type { Job } from '@/features/wall/shared/types/SprayTypes.ts';
import type { SprayDotOptions, SprayPathOptions } from '@/features/wall/sequence/types/NozzleTypes.ts';
import type { RandomGenerator } from '@/features/wall/shared/types/RandomTypes.ts';
import { NOMINAL_SPEED } from '@/features/wall/sequence/configs/NozzleConfig.ts';

const DROPLET = 0.05;
const SPRAY_SIGMA = 3.6;
const MIST_CLUMPS = 0.12;
const SPLATS_PER_SECOND = 2.2;
const MIST_PER_MASS = 255 / 1.6;

function droplet(layer: PaintLayer, random: RandomGenerator, x: number, y: number): void {
  const big = random() < 0.07;
  const radius = big ? 0.8 + random() * 0.8 : 0.3 + random() * 0.45;
  layer.depositMist(x, y, big ? 140 + random() * 115 : 40 + random() * 80, radius);
}

function spray(layer: PaintLayer, random: RandomGenerator, x: number, y: number, sigma: number, mass: number, deltaSeconds: number): void {
  const dropletCount = Math.floor(mass / DROPLET + random());
  for (let k = 0; k < dropletCount; k++) {
    const dx = gaussian(random) * sigma;
    const dy = gaussian(random) * sigma;
    const dropletMass = DROPLET * Math.exp(0.6 * gaussian(random) - 0.18);
    const offCenter = Math.sqrt(dx * dx + dy * dy) / sigma;
    if (offCenter > 1.1 && random() < (offCenter - 1.1) * 1.4) layer.depositMist(x + dx, y + dy, dropletMass * MIST_PER_MASS, 0.4 + 0.3 * random());
    else layer.depositFilm(x + dx, y + dy, dropletMass);
  }
  const clumps = Math.floor(dropletCount * MIST_CLUMPS + random());
  for (let k = 0; k < clumps; k++) {
    const spread = sigma * (random() < 0.06 ? 3.4 : 1.8);
    const clumpX = x + gaussian(random) * spread;
    const clumpY = y + gaussian(random) * spread;
    const size = 1 + Math.floor(random() * random() * 6);
    for (let j = 0; j < size; j++) droplet(layer, random, clumpX + gaussian(random) * 1.6, clumpY + gaussian(random) * 1.6);
  }
  if (random() < SPLATS_PER_SECOND * deltaSeconds) {
    const splatRadius = sigma * (0.25 + 0.3 * random());
    layer.depositSplat(x + gaussian(random) * sigma * 1.3, y + gaussian(random) * sigma * 1.3, splatRadius, DROPLET * (8 + 30 * random() ** 2));
  }
}

type SampledPath = { at(distance: number): Vec2; normal(distance: number): Vec2; length: number };

function samplePath(points: Vec2[]): SampledPath {
  const cumulativeLengths = [0];
  for (let i = 1; i < points.length; i++) {
    cumulativeLengths.push(cumulativeLengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  const length = cumulativeLengths[cumulativeLengths.length - 1];
  const segmentIndex = (distance: number) => {
    let i = 1;
    while (i < cumulativeLengths.length - 1 && cumulativeLengths[i] < distance) i++;
    return i;
  };
  return {
    length,
    at(distance) {
      const i = segmentIndex(distance);
      const span = cumulativeLengths[i] - cumulativeLengths[i - 1] || 1;
      const progress = Math.min(1, Math.max(0, (distance - cumulativeLengths[i - 1]) / span));
      const start = points[i - 1];
      const end = points[i];
      return { x: start.x + (end.x - start.x) * progress, y: start.y + (end.y - start.y) * progress };
    },
    normal(distance) {
      const i = segmentIndex(distance);
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const segmentLength = Math.hypot(dx, dy) || 1;
      return { x: -dy / segmentLength, y: dx / segmentLength };
    },
  };
}

export function pathJob(layer: PaintLayer, points: Vec2[], options: SprayPathOptions): Job {
  const random = mulberry32(options.seed ?? randomSeed());
  const path = samplePath(points);
  const length = path.length;
  const speed = options.speed ?? NOMINAL_SPEED;
  const width = options.width ?? 16;
  const load = options.load ?? 1.2;
  const dwell = (options.dwell ?? 70) / 1000;
  const taper = options.end ? options.end === 'taper' : random() < 0.5;
  const sigma0 = width / SPRAY_SIGMA;
  const rate = load * NOMINAL_SPEED * Math.sqrt(2 * Math.PI) * sigma0;

  const pressure = [noise1D(random), noise1D(random)];
  const distance = [noise1D(random), noise1D(random)];
  const wobble = [noise1D(random), noise1D(random)];
  const pace = noise1D(random);
  const ramp = Math.min(90, length * 0.12);
  const count = options.hesitations ?? Math.max(1, Math.round((length / 380) * (0.7 + 0.6 * random())));
  const stops = Array.from({ length: count }, (_, k) => ({
    at: length * (0.1 + (0.8 * (k + 0.2 + 0.6 * random())) / count),
    spread: 12 + 30 * random(),
    depth: 0.55 + 0.25 * random(),
  }));

  const speedAt = (travelled: number) => {
    let velocity = speed * (0.42 + 0.58 * smoothstep(travelled / ramp) * smoothstep((length - travelled) / ramp));
    if (taper) velocity = Math.max(velocity, speed * 0.8 * smoothstep((travelled - (length - ramp)) / ramp));
    for (const stop of stops) velocity *= 1 - stop.depth * Math.exp(-(((travelled - stop.at) / stop.spread) ** 2));
    return velocity * (1 + 0.12 * pace(travelled / 110));
  };
  const nozzle = (travelled: number) => {
    const point = path.at(travelled);
    const normal = path.normal(travelled);
    const offset = 1.6 * wobble[0](travelled / 380) + 0.4 * wobble[1](travelled / 90);
    return { x: point.x + normal.x * offset, y: point.y + normal.y * offset };
  };
  const position = { ...points[0] };
  const emit = (travelled: number, deltaSeconds: number) => {
    const point = nozzle(travelled);
    position.x = point.x;
    position.y = point.y;
    const sigma = sigma0 * (1 + 0.12 * distance[0](travelled / 220) + 0.05 * distance[1](travelled / 60));
    let flow = 1 + 0.12 * pressure[0](travelled / 150) + 0.06 * pressure[1](travelled / 40);
    if (taper) flow *= 0.15 + 0.85 * smoothstep((length - travelled) / 40);
    spray(layer, random, point.x, point.y, sigma, rate * flow * deltaSeconds, deltaSeconds);
  };

  let travelled = 0;
  let wait = dwell;
  let tail = taper ? 0 : dwell;
  return {
    layer,
    position,
    update(deltaSeconds) {
      if (wait > 0) {
        const chunk = Math.min(wait, deltaSeconds);
        emit(0, chunk);
        wait -= chunk;
        deltaSeconds -= chunk;
      }
      while (deltaSeconds > 1e-6 && travelled < length) {
        const velocity = speedAt(travelled);
        const step = Math.min(deltaSeconds, 1 / velocity);
        emit(travelled, step);
        travelled = Math.min(length, travelled + velocity * step);
        deltaSeconds -= step;
      }
      if (travelled >= length && deltaSeconds > 0 && tail > 0) {
        const chunk = Math.min(tail, deltaSeconds);
        emit(length, chunk);
        tail -= chunk;
      }
      return travelled >= length && tail <= 0;
    },
  };
}

export function moveJob(layer: PaintLayer, points: Vec2[], speed: number): Job {
  const path = samplePath(points);
  const position = { ...points[0] };
  let travelled = 0;
  return {
    layer,
    position,
    update(deltaSeconds) {
      travelled = Math.min(path.length, travelled + speed * deltaSeconds);
      const point = path.at(travelled);
      position.x = point.x;
      position.y = point.y;
      return travelled >= path.length;
    },
  };
}

export function dotJob(layer: PaintLayer, center: Vec2, options: SprayDotOptions): Job {
  const random = mulberry32(options.seed ?? randomSeed());
  const duration = (options.duration ?? 180) / 1000;
  const sigma = (options.width ?? 14) / 4.2;
  const load = options.load ?? 2.4;
  const rate = (load * 2 * Math.PI * sigma * sigma) / duration;
  const jitterX = noise1D(random);
  const jitterY = noise1D(random);
  const puff = noise1D(random);
  let elapsed = 0;
  return {
    layer,
    position: { ...center },
    update(deltaSeconds) {
      const step = Math.min(deltaSeconds, duration - elapsed);
      for (let k = 0; k < 6; k++) {
        const phase = (elapsed + (step * k) / 6) * 25;
        const offsetX = 1.3 * jitterX(phase) + gaussian(random) * 0.12 * sigma;
        const offsetY = 1.3 * jitterY(phase) + gaussian(random) * 0.12 * sigma;
        const boost = 1 + 0.5 * puff(phase * 2);
        spray(layer, random, center.x + offsetX, center.y + offsetY, sigma * (0.85 + 0.3 * random()), (rate * step * boost) / 6, step / 6);
      }
      elapsed += step;
      return elapsed >= duration;
    },
  };
}
