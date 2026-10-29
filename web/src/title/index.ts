import type { PaintEngine, PaintLayer, Vec2 } from '@/paint/index.ts';
import { mulberry32, randomSeed } from '@/paint/random.ts';
import { STROKE, titleLayout, titleStrokes, type Stroke, type TitleLayout } from './layout.ts';

export { TITLE, TITLE_GAP_BELOW, titleLayout, type TitleLayout } from './layout.ts';

const MAGENTA = '#ff2bd6';

export type TitleOptions = {
  color?: string;
  seed?: number;
  tempo?: number | (() => number);
  layout?: TitleLayout;
  onLayer?: (layer: PaintLayer) => void;
};

export async function drawTitle(engine: PaintEngine, opts: TitleOptions = {}): Promise<void> {
  const layout = opts.layout ?? titleLayout(engine.width, engine.height);
  const rng = mulberry32(opts.seed ?? randomSeed());
  const tempo = () => Math.max(0.1, typeof opts.tempo === 'function' ? opts.tempo() : (opts.tempo ?? 1));
  const { rect, em } = layout;
  const layer = engine.createLayer({
    color: opts.color ?? MAGENTA,
    bounds: { x: rect.x - em, y: Math.max(0, rect.y - em), w: rect.w + 2 * em, h: rect.h + 5 * em },
  });
  opts.onLayer?.(layer);

  const width = Math.max(3.5, 0.6 * STROKE * em);
  const pace = Math.min(900, Math.max(300, em * 16));
  const sweep = Math.min(1100, Math.max(400, em * 14));
  const lead = 1.5 * em;

  for (const line of letterLines(titleStrokes(layout, rng))) {
    const at = (x: number): Vec2 => ({ x, y: line.y(x) });
    let pos = at(line.letters[0].x - lead);
    for (const letter of line.letters) {
      const next = at(letter.x);
      await engine.sweep(layer, [pos, next], sweep * tempo());
      pos = next;
      for (const s of letter.strokes) stamp(engine, layer, s, width, pace, rng);
    }
    await engine.sweep(layer, [pos, at(pos.x + lead)], sweep * tempo());
  }
}

const STAMP_SPEED = 1e5;

function stamp(engine: PaintEngine, layer: PaintLayer, s: Stroke, width: number, pace: number, rng: () => number): void {
  const first = s.points[0];
  if (s.dot) {
    engine.stampDot(layer, first.x, first.y, { width: width * 1.25, duration: 120, load: s.thickness, seed: rng() * 2 ** 32 });
    return;
  }
  const heavy = s.thickness > 1.1;
  engine.stampPath(layer, s.points, {
    speed: STAMP_SPEED,
    width,
    load: (s.thickness * STAMP_SPEED) / 520,
    dwell: ((heavy ? 70 : 12) * pace) / STAMP_SPEED,
    hesitations: 0,
    end: heavy ? 'blob' : 'taper',
    seed: rng() * 2 ** 32,
  });
}

type Letter = { x: number; y: number; strokes: Stroke[] };
type Line = { letters: Letter[]; y: (x: number) => number };

function letterLines(strokes: Stroke[]): Line[] {
  const letters: Letter[] = [];
  for (const s of strokes) {
    if (s.letterStart || !letters.length) letters.push({ x: 0, y: 0, strokes: [] });
    letters[letters.length - 1].strokes.push(s);
  }
  const lines: Letter[][] = [];
  for (const l of letters) {
    const xs = l.strokes.flatMap((s) => s.points.map((p) => p.x));
    const ys = l.strokes.flatMap((s) => s.points.map((p) => p.y));
    l.x = (Math.min(...xs) + Math.max(...xs)) / 2;
    l.y = (Math.min(...ys) + Math.max(...ys)) / 2;
    const line = lines[lines.length - 1];
    if (line && l.x > line[line.length - 1].x) line.push(l);
    else lines.push([l]);
  }
  return lines.map((letters) => ({ letters, y: fitLine(letters) }));
}

function fitLine(letters: Letter[]): (x: number) => number {
  const n = letters.length;
  const mx = letters.reduce((a, l) => a + l.x, 0) / n;
  const my = letters.reduce((a, l) => a + l.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const l of letters) {
    num += (l.x - mx) * (l.y - my);
    den += (l.x - mx) ** 2;
  }
  const slope = den ? num / den : 0;
  return (x) => my + slope * (x - mx);
}
