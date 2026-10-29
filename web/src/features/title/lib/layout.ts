import { chartMapping } from '@/lib/chart.ts';
import { pagePad, WIDE } from '@/lib/layout.ts';
import type { Rect, Vec2 } from '@/lib/paint/types.ts';
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
  rect: Rect;
  em: number;
  lines: { text: string; x: number; baseline: number }[];
};

const TITLE_GAP_BELOW = 60;

export function titleLayout(width: number, height: number): TitleLayout {
  const pad = pagePad(width);
  const top = Math.max(14, Math.min(28, height * 0.025));
  const texts = width < 700 ? ['ft_linear_', 'regression'] : [TITLE];
  const maxW = width >= WIDE ? Math.min(width * 0.6, 920, width - 2 * pad - 420) : width - 2 * pad;
  const maxH = chartMapping(width, height).area.y - top - TITLE_GAP_BELOW;
  const unit = place(texts, 1, 0, 0);
  const em = Math.max(8, Math.min(52, maxW / unit.w, maxH / unit.h));
  const sized = place(texts, em, 0, 0);
  const layout = place(texts, em, pad - sized.x, top - sized.y);
  return { rect: { x: pad, y: top, w: sized.w, h: sized.h }, em, lines: layout.lines };
}

function place(texts: string[], em: number, dx: number, dy: number) {
  const lines = texts.map((text, k) => ({ text, x: dx, baseline: dy + k * (ASCENT + DESCENT + LINE_GAP) * em }));
  const layout = { rect: { x: 0, y: 0, w: 0, h: 0 }, em, lines };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of titleStrokes(layout, () => 0.5)) {
    for (const p of s.points) {
      x0 = Math.min(x0, p.x);
      y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x);
      y1 = Math.max(y1, p.y);
    }
  }
  const m = (STROKE / 2 + 0.08) * em;
  return { lines, x: x0 - m - dx, y: y0 - m - dy, w: x1 - x0 + 2 * m, h: y1 - y0 + 2 * m };
}

export type Stroke = { points: Vec2[]; thickness: number; dot: boolean; letterStart: boolean };

export function titleStrokes(layout: TitleLayout, rng: () => number): Stroke[] {
  const { em } = layout;
  const out: Stroke[] = [];
  for (const line of layout.lines) {
    let pen = 0;
    for (const ch of line.text) {
      const g = GLYPHS[ch];
      const scale = 0.94 + 0.12 * rng();
      const lift = (rng() - 0.5) * 0.1;
      const lean = SLANT + (rng() - 0.5) * 0.08;
      const place = (q: Vec2): Vec2 => {
        const lx = pen + q.x * scale - (q.y * scale + lift) * lean;
        const ly = q.y * scale + lift;
        return { x: line.x + (lx * COS - ly * SIN) * em, y: line.baseline + (lx * SIN + ly * COS) * em };
      };
      g.strokes.forEach((knots, k) => {
        out.push({ points: smoothStroke(knots).map(place), thickness: 1.05, dot: false, letterStart: k === 0 });
      });
      if (g.dot) out.push({ points: [place(g.dot)], thickness: 2, dot: true, letterStart: false });
      pen += g.advance + TRACKING;
    }
  }
  out[out.length - 1].thickness = 1.4;
  return out;
}

