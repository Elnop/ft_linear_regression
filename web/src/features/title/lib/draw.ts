import type { PaintEngine } from '@/lib/paint/engine.ts';
import type { PaintLayer } from '@/lib/paint/layer.ts';
import { NOMINAL_SPEED } from '@/lib/paint/nozzle.ts';
import type { Vec2 } from '@/lib/paint/types.ts';
import { mulberry32, randomSeed } from '@/lib/random.ts';
import { STROKE, titleLayout, titleStrokes, type Stroke } from './layout.ts';

const MAGENTA = '#ff2bd6';

export async function drawTitle(engine: PaintEngine, timeScale: () => number): Promise<void> {
  const title = prepareTitle(engine);
  const tempo = () => Math.max(0.1, timeScale());
  for (const line of title.lines) {
    const at = (x: number): Vec2 => ({ x, y: line.y(x) });
    let position = at(line.letters[0].x - title.lead);
    for (const letter of line.letters) {
      const next = at(letter.x);
      await engine.sweep(title.layer, [position, next], title.sweep * tempo());
      position = next;
      title.stampLetter(letter);
    }
    await engine.sweep(title.layer, [position, at(position.x + title.lead)], title.sweep * tempo());
  }
}

export function stampTitle(engine: PaintEngine): void {
  const title = prepareTitle(engine);
  for (const line of title.lines) for (const letter of line.letters) title.stampLetter(letter);
}

function prepareTitle(engine: PaintEngine) {
  const layout = titleLayout(engine.width, engine.height);
  const random = mulberry32(randomSeed());
  const { rectangle, em } = layout;
  const layer = engine.createLayer({
    color: MAGENTA,
    bounds: { x: rectangle.x - em, y: Math.max(0, rectangle.y - em), width: rectangle.width + 2 * em, height: rectangle.height + 5 * em },
  });

  const width = Math.max(3.5, 0.6 * STROKE * em);
  const pace = Math.min(900, Math.max(300, em * 16));
  return {
    layer,
    lines: letterLines(titleStrokes(layout, random)),
    sweep: Math.min(1100, Math.max(400, em * 14)),
    lead: 1.5 * em,
    stampLetter: (letter: Letter) => {
      for (const stroke of letter.strokes) stamp(engine, layer, stroke, width, pace, random);
    },
  };
}

const STAMP_SPEED = 1e5;

function stamp(engine: PaintEngine, layer: PaintLayer, stroke: Stroke, width: number, pace: number, random: () => number): void {
  const first = stroke.points[0];
  if (stroke.dot) {
    engine.stampDot(layer, first.x, first.y, { width: width * 1.25, duration: 120, load: stroke.thickness, seed: random() * 2 ** 32 });
    return;
  }
  const heavy = stroke.thickness > 1.1;
  engine.stampPath(layer, stroke.points, {
    speed: STAMP_SPEED,
    width,
    load: (stroke.thickness * STAMP_SPEED) / NOMINAL_SPEED,
    dwell: ((heavy ? 70 : 12) * pace) / STAMP_SPEED,
    hesitations: 0,
    end: heavy ? 'blob' : 'taper',
    seed: random() * 2 ** 32,
  });
}

type Letter = { x: number; y: number; strokes: Stroke[] };
type Line = { letters: Letter[]; y: (x: number) => number };

function letterLines(strokes: Stroke[]): Line[] {
  const letters: Letter[] = [];
  for (const stroke of strokes) {
    if (stroke.letterStart || !letters.length) letters.push({ x: 0, y: 0, strokes: [] });
    letters[letters.length - 1].strokes.push(stroke);
  }
  const lines: Letter[][] = [];
  for (const letter of letters) {
    const xs = letter.strokes.flatMap((stroke) => stroke.points.map((point) => point.x));
    const ys = letter.strokes.flatMap((stroke) => stroke.points.map((point) => point.y));
    letter.x = (Math.min(...xs) + Math.max(...xs)) / 2;
    letter.y = (Math.min(...ys) + Math.max(...ys)) / 2;
    const line = lines[lines.length - 1];
    if (line && letter.x > line[line.length - 1].x) line.push(letter);
    else lines.push([letter]);
  }
  return lines.map((letters) => ({ letters, y: fitLine(letters) }));
}

function fitLine(letters: Letter[]): (x: number) => number {
  const letterCount = letters.length;
  const meanX = letters.reduce((sum, letter) => sum + letter.x, 0) / letterCount;
  const meanY = letters.reduce((sum, letter) => sum + letter.y, 0) / letterCount;
  let covariance = 0;
  let variance = 0;
  for (const letter of letters) {
    covariance += (letter.x - meanX) * (letter.y - meanY);
    variance += (letter.x - meanX) ** 2;
  }
  const slope = variance ? covariance / variance : 0;
  return (x) => meanY + slope * (x - meanX);
}
