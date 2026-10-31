import { PALETTE } from '@/features/wall/shared/lib/color.ts';
import type { PaintEngine } from '@/features/wall/shared/lib/engine.ts';
import type { PaintLayer } from '@/features/wall/shared/lib/layer.ts';
import { dotJob, moveJob, NOMINAL_SPEED, pathJob } from '@/features/wall/shared/lib/nozzle.ts';
import type { Vec2 } from '@/shared/lib/geometry.ts';
import { mulberry32, randomSeed } from '@/shared/lib/random.ts';
import { STROKE, titleLayout, titleLetters, type Stroke, type TitleLine } from '@/shared/lib/title/layout.ts';

export type Clock = { readonly instant: boolean };

export async function paintTitle(engine: PaintEngine, clock: Clock): Promise<PaintLayer> {
  const layout = titleLayout(engine.width, engine.height);
  const random = mulberry32(randomSeed());
  const { rectangle, em } = layout;
  const layer = engine.createLayer({
    color: PALETTE.magenta,
    bounds: { x: rectangle.x - em, y: Math.max(0, rectangle.y - em), width: rectangle.width + 2 * em, height: rectangle.height + 5 * em },
  });

  const width = Math.max(3.5, 0.6 * STROKE * em);
  const pace = Math.min(900, Math.max(300, em * 16));
  const speed = Math.min(1100, Math.max(400, em * 14));
  const lead = 1.5 * em;
  const sweep = (from: Vec2, to: Vec2) => engine.spray(moveJob(layer, [from, to], speed), clock.instant);

  for (const line of letterLines(titleLetters(layout, random))) {
    const at = (x: number): Vec2 => ({ x, y: line.y(x) });
    let position = at(line.letters[0].x - lead);
    for (const letter of line.letters) {
      const next = at(letter.x);
      await sweep(position, next);
      position = next;
      for (const stroke of letter.strokes) stamp(engine, layer, stroke, width, pace, random);
    }
    await sweep(position, at(position.x + lead));
  }
  return layer;
}

const STAMP_SPEED = 1e5;

function stamp(engine: PaintEngine, layer: PaintLayer, stroke: Stroke, width: number, pace: number, random: () => number): void {
  if (stroke.dot) {
    void engine.spray(dotJob(layer, stroke.points[0], { width: width * 1.25, duration: 120, load: stroke.thickness, seed: random() * 2 ** 32 }), true);
    return;
  }
  const heavy = stroke.thickness > 1.1;
  const options = {
    speed: STAMP_SPEED,
    width,
    load: (stroke.thickness * STAMP_SPEED) / NOMINAL_SPEED,
    dwell: ((heavy ? 70 : 12) * pace) / STAMP_SPEED,
    hesitations: 0,
    end: heavy ? 'blob' : 'taper',
    seed: random() * 2 ** 32,
  } as const;
  void engine.spray(pathJob(layer, stroke.points, options), true);
}

type Letter = { x: number; y: number; strokes: Stroke[] };
type Line = { letters: Letter[]; y: (x: number) => number };

function letterLines(lines: TitleLine[]): Line[] {
  return lines.map((letterStrokes) => {
    const letters = letterStrokes.map((strokes): Letter => {
      const xs = strokes.flatMap((stroke) => stroke.points.map((point) => point.x));
      const ys = strokes.flatMap((stroke) => stroke.points.map((point) => point.y));
      return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2, strokes };
    });
    return { letters, y: fitLine(letters) };
  });
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
