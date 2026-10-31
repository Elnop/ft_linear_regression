import { chartMapping } from '@/shared/lib/chartMapping.ts';
import { pagePadding, WIDE } from '@/shared/lib/layout.ts';
import type { Rectangle, Vec2 } from '@/shared/lib/geometry.ts';
import { GLYPHS, smoothStroke } from './glyphs.ts';

const TITLE = 'ft_linear_regression';
const SPLIT_TITLE_BELOW = 700;
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
const LINE_HEIGHT = ASCENT + DESCENT + LINE_GAP;

export function titleLayout(width: number, height: number): TitleLayout {
  const padding = pagePadding(width);
  const top = Math.max(14, Math.min(28, height * 0.025));
  const texts = width < SPLIT_TITLE_BELOW ? ['ft_linear_', 'regression'] : [TITLE];
  const maxWidth = width >= WIDE ? Math.min(width * 0.6, 920, width - 2 * padding - 420) : width - 2 * padding;
  const maxHeight = chartMapping(width, height).area.y - top - TITLE_GAP_BELOW;
  const unit = measure(texts);
  const em = Math.max(8, Math.min(52, maxWidth / unit.width, maxHeight / unit.height));
  return {
    rectangle: { x: padding, y: top, width: unit.width * em, height: unit.height * em },
    em,
    lines: texts.map((text, k) => ({ text, x: padding - unit.x * em, baseline: top + (k * LINE_HEIGHT - unit.y) * em })),
  };
}

function measure(texts: string[]): Rectangle {
  const lines = texts.map((text, k) => ({ text, x: 0, baseline: k * LINE_HEIGHT }));
  const points = titleLetters({ em: 1, lines }, () => 0.5).flat(2).flatMap((stroke) => stroke.points);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const margin = STROKE / 2 + 0.08;
  const x = Math.min(...xs) - margin;
  const y = Math.min(...ys) - margin;
  return { x, y, width: Math.max(...xs) + margin - x, height: Math.max(...ys) + margin - y };
}

export type Stroke = { points: Vec2[]; thickness: number; dot: boolean };

export type TitleLine = Stroke[][];

export function titleLetters(layout: Pick<TitleLayout, 'em' | 'lines'>, random: () => number): TitleLine[] {
  const { em } = layout;
  const lines = layout.lines.map((line) => {
    let pen = 0;
    return line.text.split('').map((character) => {
      const glyph = GLYPHS[character];
      const scale = 0.94 + 0.12 * random();
      const lift = (random() - 0.5) * 0.1;
      const lean = SLANT + (random() - 0.5) * 0.08;
      const place = (point: Vec2): Vec2 => {
        const localX = pen + point.x * scale - (point.y * scale + lift) * lean;
        const localY = point.y * scale + lift;
        return { x: line.x + (localX * COS - localY * SIN) * em, y: line.baseline + (localX * SIN + localY * COS) * em };
      };
      const strokes = glyph.strokes.map((knots): Stroke => ({ points: smoothStroke(knots).map(place), thickness: 1.05, dot: false }));
      if (glyph.dot) strokes.push({ points: [place(glyph.dot)], thickness: 2, dot: true });
      pen += glyph.advance + TRACKING;
      return strokes;
    });
  });
  lines.flat(2).at(-1)!.thickness = 1.4;
  return lines;
}
