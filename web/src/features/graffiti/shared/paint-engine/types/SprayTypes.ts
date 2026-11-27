import type { PaintLayer } from '@/features/graffiti/shared/paint-engine/lib/PaintLayer.ts';
import type { Vec2 } from '@/shared/scene/types/GeometryTypes.ts';

export type Nozzle = { x: number; y: number; color: string; followable: boolean };

export type Job = { layer: PaintLayer; position: Vec2; update: (deltaSeconds: number) => boolean };
