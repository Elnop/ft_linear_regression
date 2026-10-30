import { chartMapping } from '@/lib/chart.ts';
import { pagePadding, WIDE } from '@/lib/layout.ts';
import type { Rectangle, Vec2 } from '@/lib/paint/types.ts';
import { GLYPHS, smoothStroke } from './glyphs.ts';

const TITLE = 'ft_linear_regression';
const ASCENT = 1.72;
const DESCENT = 0.66;
const LINE_GAP = 0.12;
const SLANT = 0.26;
const TILT = (-2.2 * Math.PI) / 180;
const COS = Math.cos(TILT);
const SIN = Math.sin(TILT);
export const STROKE = 0.2;
const TRACKING = 0.14;

export type TitleLayout = {
  rectangle: Rectangle;
  em: number;
  lines: { text: string; x: number; baseline: number }[];
};

const TITLE_GAP_BELOW = 60;

export function titleLayout(width: number, height: number): TitleLayout {
  const padding = pagePadding(width);
  const top = Math.max(14, Math.min(28, height * 0.025));
  const texts = width < 700 ? ['ft_linear_', 'regression'] : [TITLE];
  const maxWidth = width >= WIDE ? Math.min(width * 0.6, 920, width - 2 * padding - 420) : width - 2 * padding;
  const maxHeight = chartMapping(width, height).area.y - top - TITLE_GAP_BELOW;
  const unit = place(texts, 1, 0, 0);
  const em = Math.max(8, Math.min(52, maxWidth / unit.width, maxHeight / unit.height));
  const sized = place(texts, em, 0, 0);
  const layout = place(texts, em, padding - sized.x, top - sized.y);
  return { rectangle: { x: padding, y: top, width: sized.width, height: sized.height }, em, lines: layout.lines };
}

function place(texts: string[], em: number, dx: number, dy: number) {
  const lines = texts.map((text, k) => ({ text, x: dx, baseline: dy + k * (ASCENT + DESCENT + LINE_GAP) * em }));
  const layout = { rectangle: { x: 0, y: 0, width: 0, height: 0 }, em, lines };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const stroke of titleStrokes(layout, () => 0.5)) {
    for (const point of stroke.points) {
      x0 = Math.min(x0, point.x);
      y0 = Math.min(y0, point.y);
      x1 = Math.max(x1, point.x);
      y1 = Math.max(y1, point.y);
    }
  }
  const margin = (STROKE / 2 + 0.08) * em;
  return { lines, x: x0 - margin - dx, y: y0 - margin - dy, width: x1 - x0 + 2 * margin, height: y1 - y0 + 2 * margin };
}

export type Stroke = { points: Vec2[]; thickness: number; dot: boolean; letterStart: boolean };

export function titleStrokes(layout: TitleLayout, random: () => number): Stroke[] {
  const { em } = layout;
  const out: Stroke[] = [];
  for (const line of layout.lines) {
    let pen = 0;
    for (const character of line.text) {
      const glyph = GLYPHS[character];
      const scale = 0.94 + 0.12 * random();
      const lift = (random() - 0.5) * 0.1;
      const lean = SLANT + (random() - 0.5) * 0.08;
      const place = (point: Vec2): Vec2 => {
        const localX = pen + point.x * scale - (point.y * scale + lift) * lean;
        const localY = point.y * scale + lift;
        return { x: line.x + (localX * COS - localY * SIN) * em, y: line.baseline + (localX * SIN + localY * COS) * em };
      };
      glyph.strokes.forEach((knots, k) => {
        out.push({ points: smoothStroke(knots).map(place), thickness: 1.05, dot: false, letterStart: k === 0 });
      });
      if (glyph.dot) out.push({ points: [place(glyph.dot)], thickness: 2, dot: true, letterStart: false });
      pen += glyph.advance + TRACKING;
    }
  }
  out[out.length - 1].thickness = 1.4;
  return out;
}

