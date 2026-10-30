export type Vec2 = { x: number; y: number };

export type Rectangle = { x: number; y: number; width: number; height: number };

export type Rgb = [number, number, number];

export type LayerOptions = {
  color: string;
  bounds?: Rectangle;
  opacity?: number;
  z?: number;
};

export type Nozzle = { x: number; y: number; color: Rgb; active: number };

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
  const value = parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export function rgbToHex(color: Rgb): string {
  return `#${color.map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('')}`;
}
