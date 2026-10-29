import type { PaintEngine, PaintLayer, Vec2 } from '../paint/index.ts';
import { mulberry32, randomSeed } from '../paint/random.ts';
import { STROKE, titleLayout, titleStrokes, type TitleLayout } from './layout.ts';

export { TITLE, TITLE_GAP_BELOW, titleLayout, type TitleLayout } from './layout.ts';

const MAGENTA = '#ff2bd6';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
  let last: Vec2 | null = null;
  for (const s of titleStrokes(layout, rng)) {
    const speed = Math.min(900, Math.max(300, em * 16)) * tempo();
    const first = s.points[0];
    if (last) {
      const jump = Math.hypot(first.x - last.x, first.y - last.y);
      await wait((60 + (jump / (speed * 1.5)) * 1000 + (s.letterStart ? 90 : 0)) / tempo());
    }
    if (s.dot) {
      await engine.sprayDot(layer, first.x, first.y, { width: width * 1.25, duration: 120 / tempo(), load: s.thickness, seed: rng() * 2 ** 32 });
    } else {
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
