import type { Rectangle } from '@/shared/types/GeometryTypes.ts';

export type LayerOptions = {
  color: string;
  bounds?: Rectangle;
  opacity?: number;
  z?: number;
};

export type CellRectangle = { x0: number; y0: number; x1: number; y1: number };
