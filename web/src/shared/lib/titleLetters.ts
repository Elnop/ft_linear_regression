import type { Vec2 } from '@/shared/types/GeometryTypes.ts';
import { smoothStroke } from '@/shared/lib/smoothStroke.ts';
import type { TitleLayout, Stroke, TitleLine } from '@/shared/types/TitleTypes.ts';
import { GLYPHS } from '@/shared/configs/GlyphsConfig.ts';

const SLANT = 0.26;
const TILT = (-2.2 * Math.PI) / 180;
const COS = Math.cos(TILT);
const SIN = Math.sin(TILT);
const TRACKING = 0.14;

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
