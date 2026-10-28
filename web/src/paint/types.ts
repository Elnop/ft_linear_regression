export type Vec2 = { x: number; y: number };

// Rectangle in CSS pixels of the wall canvas.
export type Rect = { x: number; y: number; w: number; h: number };

export type Rgb = [number, number, number];

export type LayerOptions = {
  color: string;
  // Area the layer can hold paint in (drips included). Defaults to the whole wall.
  bounds?: Rect;
  opacity?: number;
  z?: number; // stacking order, higher on top (default 0, ties keep creation order)
};

export type SprayPathOptions = {
  speed?: number; // nozzle speed in px/s; slower means more paint
  width?: number; // visible stroke width in px
  load?: number; // peak paint thickness at the nominal speed (≈1 opaque, >1.5 starts to run)
  dwell?: number; // ms spent spraying in place before and after moving
  hesitations?: number; // random slowdowns of the hand (default: about one per 380 px)
  end?: 'blob' | 'taper'; // how the stroke ends (default: random)
  seed?: number;
};

export type SprayDotOptions = {
  duration?: number; // ms
  width?: number; // visible dot diameter in px
  load?: number; // peak thickness reached at the end
  seed?: number;
};

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
