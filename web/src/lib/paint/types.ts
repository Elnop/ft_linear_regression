import type { Rectangle } from '@/lib/geometry.ts';

export type Rgb = [number, number, number];

export type LayerOptions = {
  color: string;
  bounds?: Rectangle;
  opacity?: number;
  z?: number;
};

export type Nozzle = { x: number; y: number; color: string; active: number };

export type SprayPathOptions = {
  speed?: number;
  width?: number;
  load?: number;
  dwell?: number;
  hesitations?: number;
  end?: 'blob' | 'taper';
  seed?: number;
};

export type SprayDotOptions = {
  duration?: number;
  width?: number;
  load?: number;
  seed?: number;
};
