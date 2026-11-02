import { PALETTE } from '@/shared/configs/PaletteConfig.ts';
import type { Surface } from '@/features/graffiti/shared/types/SurfaceTypes.ts';
import type { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import { dotJob, moveJob, pathJob } from '@/features/graffiti/features/animation-director/lib/nozzle.ts';
import type { Vec2 } from '@/shared/types/GeometryTypes.ts';
import { mulberry32, randomSeed, seedFrom } from '@/features/graffiti/shared/lib/random.ts';
import { readRem } from '@/shared/lib/readRem.ts';
import { sceneFor } from '@/shared/lib/sceneFor.ts';
import { titleLetters } from '@/shared/lib/titleLetters.ts';
import type { Run } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';
import type { Stroke, TitleLine } from '@/shared/types/TitleTypes.ts';
import { NOMINAL_SPEED } from '@/features/graffiti/features/animation-director/configs/NozzleConfig.ts';
import { STROKE } from '@/shared/configs/TitleConfig.ts';
import { TITLE_PAINT } from '@/features/graffiti/features/animation-director/configs/TitlePaintConfig.ts';

export async function paintTitle(engine: Surface, run: Run): Promise<PaintLayer> {
  const layout = sceneFor(engine.width, engine.height, readRem()).title;
  const random = mulberry32(randomSeed());
  const { rectangle, em } = layout;
  const layer = engine.createLayer({
    color: PALETTE.magenta,
    bounds: { x: rectangle.x - em, y: Math.max(0, rectangle.y - em), width: rectangle.width + 2 * em, height: rectangle.height + 5 * em },
    anchor: { region: 'title', from: rectangle },
  });

  const width = Math.max(TITLE_PAINT.width.minimum, TITLE_PAINT.width.strokeRatio * STROKE * em);
  const pace = Math.min(TITLE_PAINT.pace.maximum, Math.max(TITLE_PAINT.pace.minimum, em * TITLE_PAINT.pace.perEm));
  const speed = Math.min(TITLE_PAINT.sweep.maximum, Math.max(TITLE_PAINT.sweep.minimum, em * TITLE_PAINT.sweep.perEm));
  const lead = TITLE_PAINT.leadEm * em;
  const sweep = (from: Vec2, to: Vec2) => engine.spray(moveJob(layer, [from, to], speed), run.instant);

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

function stamp(engine: Surface, layer: PaintLayer, stroke: Stroke, width: number, pace: number, random: () => number): void {
  if (stroke.dot) {
    void engine.spray(dotJob(layer, stroke.points[0], { width: width * TITLE_PAINT.dot.widthRatio, duration: TITLE_PAINT.dot.duration, load: stroke.thickness, seed: seedFrom(random) }), true);
    return;
  }
  const heavy = stroke.thickness > TITLE_PAINT.heavyThickness;
  const options = {
    speed: STAMP_SPEED,
    width,
    load: (stroke.thickness * STAMP_SPEED) / NOMINAL_SPEED,
    dwell: ((heavy ? TITLE_PAINT.dwell.heavy : TITLE_PAINT.dwell.light) * pace) / STAMP_SPEED,
    hesitations: 0,
    end: heavy ? 'blob' : 'taper',
    seed: seedFrom(random),
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
