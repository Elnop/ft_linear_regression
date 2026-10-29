import type { PaintEngine } from '@/lib/paint/engine.ts';
import type { PaintLayer } from '@/lib/paint/layer.ts';
import { NOMINAL_SPEED } from '@/lib/paint/nozzle.ts';
import type { Vec2 } from '@/lib/paint/types.ts';
import { mulberry32, randomSeed } from '@/lib/random.ts';
import { STROKE, titleLayout, titleStrokes, type Stroke } from './layout.ts';

const MAGENTA = '#ff2bd6';

// `timeScale` is read before every sweep so a skip speeds up the letters still to come.
export async function drawTitle(engine: PaintEngine, timeScale: () => number): Promise<void> {
  const title = prepareTitle(engine);
  const tempo = () => Math.max(0.1, timeScale());
  for (const line of title.lines) {
    const at = (x: number): Vec2 => ({ x, y: line.y(x) });
    let pos = at(line.letters[0].x - title.lead);
    for (const letter of line.letters) {
      const next = at(letter.x);
      await engine.sweep(title.layer, [pos, next], title.sweep * tempo());
      pos = next;
      title.stampLetter(letter);
    }
    await engine.sweep(title.layer, [pos, at(pos.x + title.lead)], title.sweep * tempo());
  }
}

// The same tag at once, without the can travelling between letters.
export function stampTitle(engine: PaintEngine): void {
  const title = prepareTitle(engine);
  for (const line of title.lines) for (const letter of line.letters) title.stampLetter(letter);
}

function prepareTitle(engine: PaintEngine) {
  const layout = titleLayout(engine.width, engine.height);
  const rng = mulberry32(randomSeed());
  const { rect, em } = layout;
  const layer = engine.createLayer({
    color: MAGENTA,
    bounds: { x: rect.x - em, y: Math.max(0, rect.y - em), w: rect.w + 2 * em, h: rect.h + 5 * em },
  });

  const width = Math.max(3.5, 0.6 * STROKE * em);
  const pace = Math.min(900, Math.max(300, em * 16));
  return {
    layer,
    lines: letterLines(titleStrokes(layout, rng)),
    sweep: Math.min(1100, Math.max(400, em * 14)),
    lead: 1.5 * em,
    stampLetter: (letter: Letter) => {
      for (const s of letter.strokes) stamp(engine, layer, s, width, pace, rng);
    },
  };
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
    load: (s.thickness * STAMP_SPEED) / NOMINAL_SPEED,
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
