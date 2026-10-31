import type { PaintLayer } from '@/features/wall/shared/lib/layer.ts';
import type { Vec2 } from '@/shared/types/GeometryTypes.ts';

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

export type Job = { layer: PaintLayer; position: Vec2; update(deltaSeconds: number): boolean };
