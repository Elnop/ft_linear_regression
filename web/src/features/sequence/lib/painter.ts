import type { Thetas } from '@core/types.ts';
import type { ChartMapping } from '@/lib/chart.ts';
import { chartFor } from '@/lib/layout.ts';
import type { PaintEngine } from '@/lib/paint/engine.ts';
import type { PaintLayer } from '@/lib/paint/layer.ts';
import { NOMINAL_SPEED } from '@/lib/paint/nozzle.ts';
import type { Rect, SprayPathOptions } from '@/lib/paint/types.ts';
import { lineSegment } from './geometry.ts';
import { COLORS, fadeGray, fadeOpacity, STYLE, TIMING } from './timing.ts';
import { DATA, type LineKind } from './training.ts';

const DRIP_ROOM = { dot: 120, line: 50, diverge: 70, finalLine: 260 } as const;

export class WallPainter {
  chart: ChartMapping;

  private engine: PaintEngine;
  private scale: () => number;
  private topPoints: PaintLayer[] = [];
  private fan: PaintLayer[] = [];

  constructor(engine: PaintEngine, scale: () => number) {
    this.engine = engine;
    this.scale = scale;
    this.chart = chartFor(engine.width, engine.height);
  }

  clear(): void {
    this.engine.clear();
    this.topPoints = [];
    this.fan = [];
  }

  fit(): void {
    this.chart = chartFor(this.engine.width, this.engine.height);
  }

  sprayPoint(index: number, duration: number, top = false): Promise<void> {
    const { layer, p, opts } = this.pointLayer(index, top);
    return this.engine.sprayDot(layer, p.x, p.y, { ...opts, duration: duration / this.scale() });
  }

  stampTopPoint(index: number): void {
    const { layer, p, opts } = this.pointLayer(index, true);
    this.engine.stampDot(layer, p.x, p.y, { ...opts, duration: TIMING.redot });
  }

  stampPoints(order: number[], fade = 0): Promise<void[]> {
    return Promise.all(
      order.map((i) => {
        const { layer, p, opts } = this.pointLayer(i, false, fade ? 0 : 1);
        this.engine.stampDot(layer, p.x, p.y, { ...opts, duration: TIMING.dot });
        return fade ? this.engine.fadeLayer(layer, 1, fade / this.scale()) : Promise.resolve();
      }),
    );
  }

  sprayLine(thetas: Thetas, kind: LineKind, duration: number, reverse = false): Promise<void> {
    const seconds = Math.max(0.05, duration / 1000) / this.scale();
    const stroke = this.lineStroke(thetas, kind, (length) => (length / seconds) * 1.2, reverse);
    if (!stroke) return Promise.resolve();
    return this.engine.sprayPath(stroke.layer, stroke.points, stroke.opts);
  }

  stampLine(thetas: Thetas, kind: LineKind, reverse = false): void {
    const stroke = this.lineStroke(thetas, kind, () => NOMINAL_SPEED, reverse);
    if (stroke) this.engine.stampPath(stroke.layer, stroke.points, stroke.opts);
  }

  private lineStroke(thetas: Thetas, kind: LineKind, speedFor: (length: number) => number, reverse: boolean) {
    const seg = lineSegment(thetas, this.chart, this.clipRect(kind));
    if (!seg) return null;

    const [a, b] = seg;
    const style = STYLE[kind];
    const color = kind === 'diverge' ? COLORS.diverge : COLORS.line;
    const pad = style.width * 2;
    const x0 = Math.max(0, Math.min(a.x, b.x) - pad);
    const y0 = Math.max(0, Math.min(a.y, b.y) - pad);
    const x1 = Math.min(this.engine.width, Math.max(a.x, b.x) + pad);
    const y1 = Math.min(this.engine.height, Math.max(a.y, b.y) + pad + DRIP_ROOM[kind]);
    const layer = this.engine.createLayer({ color, z: 1, bounds: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } });
    this.fan.push(layer);

    const speed = speedFor(Math.hypot(b.x - a.x, b.y - a.y));
    const opts: SprayPathOptions = {
      speed,
      width: style.width,
      load: (style.thickness * speed) / NOMINAL_SPEED,
      dwell: (style.dwell * NOMINAL_SPEED) / speed,
      hesitations: style.hesitations,
      end: kind === 'finalLine' ? 'blob' : 'taper',
    };
    return { layer, points: reverse ? [b, a] : [a, b], opts };
  }

  fadeFan(instant = false): void {
    this.fan.forEach((layer, i) => {
      const age = this.fan.length - 1 - i;
      if (instant) this.engine.setOpacity(layer, fadeOpacity(age), fadeGray(age));
      else void this.engine.fadeLayer(layer, fadeOpacity(age), TIMING.fade / this.scale(), fadeGray(age));
    });
  }

  wipeFan(): void {
    for (const layer of [...this.fan, ...this.topPoints]) {
      void this.engine.fadeLayer(layer, 0, TIMING.fanOut / this.scale()).then(() => this.engine.removeLayer(layer));
    }
    this.fan = [];
    this.topPoints = [];
  }

  private pointLayer(index: number, top: boolean, opacity = 1) {
    const s = DATA[index];
    const p = this.chart.point(s.km, s.price);
    const layer = this.engine.createLayer({
      color: COLORS.point,
      opacity,
      z: top ? 2 : 0,
      bounds: { x: p.x - 30, y: p.y - 30, w: 60, h: 60 + DRIP_ROOM.dot },
    });
    if (top) this.topPoints.push(layer);
    const [lo, hi] = STYLE.dot.load;
    return { layer, p, opts: { width: STYLE.dot.width, load: lo + Math.random() * (hi - lo) } };
  }

  private clipRect(kind: LineKind): Rect {
    if (kind !== 'diverge') return this.chart.area;
    return { x: -20, y: -20, w: this.engine.width + 40, h: this.engine.height + 40 };
  }
}
