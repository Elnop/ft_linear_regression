import type { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import type { Vec2 } from '@/shared/types/GeometryTypes.ts';

export type Nozzle = { x: number; y: number; color: string; followable: boolean };

export type Job = { layer: PaintLayer; position: Vec2; update(deltaSeconds: number): boolean };
