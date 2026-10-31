import type { PaintLayer } from '@/features/wall/shared/lib/PaintLayer.ts';
import type { Vec2 } from '@/shared/types/GeometryTypes.ts';

export type Nozzle = { x: number; y: number; color: string; active: number };

export type Job = { layer: PaintLayer; position: Vec2; update(deltaSeconds: number): boolean };
