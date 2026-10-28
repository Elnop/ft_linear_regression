import type { PaintEngine, PaintLayer, Vec2 } from '../paint/index.ts';
import { mulberry32, randomSeed } from '../paint/random.ts';
import { STROKE, titleLayout, titleStrokes, type TitleLayout } from './layout.ts';

export { TITLE, TITLE_GAP_BELOW, titleLayout, type TitleLayout } from './layout.ts';

const MAGENTA = '#ff2bd6';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export type TitleOptions = {
  color?: string;
  seed?: number;
  // Speed multiplier; a function is read before every stroke, so a running
  // title can be hurried (e.g. when the intro is skipped).
  tempo?: number | (() => number);
  layout?: TitleLayout;
  onLayer?: (layer: PaintLayer) => void;
};

// Sprays the title stroke by stroke like a tagger: one can, letters in
// order, quick jumps between strokes, a few strokes overloaded so they drip.
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

  // The spray halo roughly doubles the nozzle width; STROKE is the visible one.
  const width = Math.max(3.5, 0.6 * STROKE * em);
  let last: Vec2 | null = null;
  for (const s of titleStrokes(layout, rng)) {
    const speed = Math.min(1300, Math.max(380, em * 22)) * tempo();
    const first = s.points[0];
    if (last) {
      const jump = Math.hypot(first.x - last.x, first.y - last.y);
      await wait((25 + (jump / (speed * 3)) * 1000 + (s.letterStart ? 40 : 0)) / tempo());
    }
    if (s.dot) {
      await engine.sprayDot(layer, first.x, first.y, { width: width * 1.25, duration: 120 / tempo(), load: s.thickness, seed: rng() * 2 ** 32 });
    } else {
      // Thickness ≈ load × 520 / speed: scale load with speed to keep coverage.
      const heavy = s.thickness > 1.1;
      await engine.sprayPath(layer, s.points, {
        speed,
        width,
        load: (s.thickness * speed) / 520,
        dwell: (heavy ? 70 : 12) / tempo(),
        hesitations: 0,
        end: heavy ? 'blob' : 'taper',
        seed: rng() * 2 ** 32,
      });
    }
    last = s.points[s.points.length - 1];
  }
}
