import type { Rectangle, Vec2 } from '@/shared/types/GeometryTypes.ts';

export type Region = 'chart' | 'title';

export type Regions = Record<Region, Rectangle>;

export type Anchor = { region: Region; from: Rectangle; pin?: Vec2 };

export type LayerOptions = {
  color: string;
  bounds?: Rectangle;
  opacity?: number;
  z?: number;
  anchor?: Anchor;
};

export type CellRectangle = { x0: number; y0: number; x1: number; y1: number };
