import type { Sample, Thetas } from '@core/types.ts';
import type { ChartMapping } from '@/lib/chart.ts';
import { chartFor } from '@/lib/layout.ts';
import type { PaintEngine } from '@/lib/paint/engine.ts';
import type { PaintLayer } from '@/lib/paint/layer.ts';
import { dotJob, NOMINAL_SPEED, pathJob } from '@/lib/paint/nozzle.ts';
import type { Rectangle } from '@/lib/paint/types.ts';
import { lineSegment } from './geometry.ts';
import { COLORS, fadeGray, fadeOpacity, STYLE } from './style.ts';
import type { Timeline } from './timeline.ts';
import { TIMING } from './timing.ts';
import { isFinalPass, type Training } from './training.ts';

export type LineKind = 'line' | 'finalLine' | 'diverge';

export function lineKindAt(plan: Training, pass: number): LineKind {
  if (plan.diverged) return 'diverge';
  return isFinalPass(plan, pass) ? 'finalLine' : 'line';
}

const DRIP_ROOM = { dot: 120, line: 50, diverge: 70, finalLine: 260 } as const;

export class WallPainter {
  chart: ChartMapping;

  private engine: PaintEngine;
  private samples: Sample[];
  private timeline: Timeline;
  private topPoints: PaintLayer[] = [];
  private fan: PaintLayer[] = [];

  constructor(engine: PaintEngine, samples: Sample[], timeline: Timeline) {
    this.engine = engine;
    this.samples = samples;
    this.timeline = timeline;
    this.chart = chartFor(engine.width, engine.height);
  }

  clear(keep: PaintLayer[] = []): void {
    this.engine.clear(keep);
    this.topPoints = [];
    this.fan = [];
  }

  fit(): void {
    this.chart = chartFor(this.engine.width, this.engine.height);
  }

  sprayPoint(index: number, duration: number): Promise<void> {
    const { layer, center, options } = this.pointLayer(index, 2);
    this.topPoints.push(layer);
    return this.engine.spray(dotJob(layer, center.x, center.y, { ...options, duration }), this.timeline.instant);
  }

  stampPoints(order: number[], fade: number): Promise<void[]> {
    return Promise.all(
      order.map((i) => {
        const { layer, center, options } = this.pointLayer(i, 0, 0);
        void this.engine.spray(dotJob(layer, center.x, center.y, { ...options, duration: TIMING.dot }), true);
        return this.engine.fadeLayer(layer, 1, this.fadeTime(fade));
      }),
    );
  }

  sprayLine(thetas: Thetas, kind: LineKind, duration: number, reverse = false): Promise<void> {
    const segment = lineSegment(thetas, this.chart, this.clipRectangle(kind));
    if (!segment) return Promise.resolve();

    const [start, end] = segment;
    const style = STYLE[kind];
    const padding = style.width * 2;
    const x0 = Math.max(0, Math.min(start.x, end.x) - padding);
    const y0 = Math.max(0, Math.min(start.y, end.y) - padding);
    const x1 = Math.min(this.engine.width, Math.max(start.x, end.x) + padding);
    const y1 = Math.min(this.engine.height, Math.max(start.y, end.y) + padding + DRIP_ROOM[kind]);
    const color = kind === 'diverge' ? COLORS.diverge : COLORS.line;
    const layer = this.engine.createLayer({ color, z: 1, bounds: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } });
    this.fan.push(layer);

    const { instant } = this.timeline;
    const seconds = Math.max(0.05, duration / 1000);
    const speed = instant ? NOMINAL_SPEED : (Math.hypot(end.x - start.x, end.y - start.y) / seconds) * 1.2;
    const job = pathJob(layer, reverse ? [end, start] : [start, end], {
      speed,
      width: style.width,
      load: (style.thickness * speed) / NOMINAL_SPEED,
      dwell: (style.dwell * NOMINAL_SPEED) / speed,
      hesitations: style.hesitations,
      end: kind === 'finalLine' ? 'blob' : 'taper',
    });
    return this.engine.spray(job, instant);
  }

  fadeFan(): void {
    this.fan.forEach((layer, i) => {
      const age = this.fan.length - 1 - i;
      void this.engine.fadeLayer(layer, fadeOpacity(age), this.fadeTime(TIMING.fade), fadeGray(age));
    });
  }

  wipeFan(): void {
    for (const layer of [...this.fan, ...this.topPoints]) {
      void this.engine.fadeLayer(layer, 0, this.fadeTime(TIMING.fanOut)).then(() => this.engine.removeLayer(layer));
    }
    this.fan = [];
    this.topPoints = [];
  }

  private fadeTime(duration: number): number {
    return this.timeline.instant ? 0 : duration;
  }

  private pointLayer(index: number, z: number, opacity = 1) {
    const sample = this.samples[index];
    const center = this.chart.point(sample.km, sample.price);
    const layer = this.engine.createLayer({
      color: COLORS.point,
      opacity,
      z,
      bounds: { x: center.x - 30, y: center.y - 30, width: 60, height: 60 + DRIP_ROOM.dot },
    });
    const [minimumLoad, maximumLoad] = STYLE.dot.load;
    return { layer, center, options: { width: STYLE.dot.width, load: minimumLoad + Math.random() * (maximumLoad - minimumLoad) } };
  }

  private clipRectangle(kind: LineKind): Rectangle {
    if (kind !== 'diverge') return this.chart.area;
    return { x: -20, y: -20, width: this.engine.width + 40, height: this.engine.height + 40 };
  }
}
