import type { Rectangle, Vec2 } from '@/shared/types/GeometryTypes.ts';

export type TitleLayout = {
  rectangle: Rectangle;
  em: number;
  lines: { text: string; x: number; baseline: number }[];
};

export type Stroke = { points: Vec2[]; thickness: number; dot: boolean };

export type TitleLine = Stroke[][];

export type Glyph = {
  advance: number;
  strokes: Vec2[][];
  dot?: Vec2;
};
