export type Vec2 = { x: number; y: number };

export type Rect = { x: number; y: number; w: number; h: number };

export type Rgb = [number, number, number];

export type LayerOptions = {
  color: string;
  bounds?: Rect;
  opacity?: number;
  z?: number;
};

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

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
