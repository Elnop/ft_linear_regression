import type { Sample, Thetas } from '@core/types/CoreTypes.ts';

import { readRem } from '@/shared/lib/readRem.ts';
import { sceneFor } from '@/shared/lib/sceneFor.ts';
import type { Surface } from '@/features/graffiti/shared/types/SurfaceTypes.ts';
import type { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import { dotJob, pathJob } from '@/features/graffiti/features/animation-director/lib/nozzle.ts';
import type { Rectangle } from '@/shared/types/GeometryTypes.ts';
import { lineSegment } from '@/shared/lib/lineSegment.ts';
import { fadeGray, fadeOpacity } from '@/features/graffiti/features/animation-director/lib/fade.ts';
import { TIMING } from '@/features/graffiti/features/animation-director/configs/TimingConfig.ts';
import type { FanLayers, LineKind, Run, Training } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';
import { isFinalPass } from '@/features/graffiti/features/animation-director/lib/training.ts';
import { lineKindAt } from '@/features/graffiti/features/animation-director/lib/lineKindAt.ts';
import type { ChartMapping } from '@/shared/types/ChartTypes.ts';
import { STYLE, COLORS } from '@/features/graffiti/features/animation-director/configs/StyleConfig.ts';
import { NOMINAL_SPEED } from '@/features/graffiti/features/animation-director/configs/NozzleConfig.ts';

const DRIP_ROOM = { dot: 120, line: 50, diverge: 70, finalLine: 260 } as const;

function fadeTime(run: Run, duration: number) {
  return run.instant ? 0 : duration;
}

export class WallPainter {
  private chart: ChartMapping;

  private readonly engine: Surface;
  private readonly samples: Sample[];
  private topPoints: PaintLayer[] = [];
  private fan: PaintLayer[] = [];

  constructor(engine: Surface, samples: Sample[]) {
    this.engine = engine;
    this.samples = samples;
    this.chart = sceneFor(engine.width, engine.height, readRem()).chart;
  }

  clear(keep: PaintLayer[] = []): void {
    this.engine.clear(keep);
    this.topPoints = [];
    this.fan = [];
  }

  fit(): void {
    this.chart = sceneFor(this.engine.width, this.engine.height, readRem()).chart;
  }

  get fanLayers(): FanLayers {
    return { fan: this.fan, topPoints: this.topPoints };
  }

  takeOver({ fan, topPoints }: FanLayers): void {
    this.fan = fan;
    this.topPoints = topPoints;
  }

  async sprayPasses(run: Run, plan: Training, onPass: (pass: number) => void = () => {}): Promise<void> {
    for (let pass = 0; pass < plan.steps.length; pass++) {
      onPass(pass);
      const duration = isFinalPass(plan, pass) ? TIMING.finalPass : TIMING.pass;
      const painting = this.sprayLine(run, plan.steps[pass], lineKindAt(plan, pass), duration, pass % 2 === 1);
      this.fadeFan(run);
      await run.wait(painting);
      await run.sleep(TIMING.afterPass);
    }
  }

  async redot(run: Run, order: number[]): Promise<void> {
    for (const i of order) {
      await run.wait(this.sprayPoint(run, i, TIMING.redot));
      await run.sleep(TIMING.redotGap);
    }
  }

  sprayPoint(run: Run, index: number, duration: number): Promise<void> {
    const { layer, center, options } = this.pointLayer(index, 2);
    this.topPoints.push(layer);
    return this.engine.spray(dotJob(layer, center, { ...options, duration }), run.instant);
  }

  stampPoints(run: Run, order: number[], fadeDuration: number): Promise<void[]> {
    return Promise.all(
      order.map((i) => {
        const { layer, center, options } = this.pointLayer(i, 0, 0);
        void this.engine.spray(dotJob(layer, center, { ...options, duration: TIMING.dot }), true);
        return this.engine.fadeLayer(layer, 1, fadeTime(run, fadeDuration));
      }),
    );
  }

  sprayLine(run: Run, thetas: Thetas, kind: LineKind, duration: number, reverse = false): Promise<void> {
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
    const layer = this.engine.createLayer({ color, z: 1, bounds: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, anchor: { region: 'chart', from: this.chart.area } });
    this.fan.push(layer);

    const { instant } = run;
    const seconds = Math.max(0.05, duration / 1000);
    const speed = instant ? NOMINAL_SPEED : (Math.hypot(end.x - start.x, end.y - start.y) / seconds) * STYLE.speedMargin;
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

  fadeFan(run: Run): void {
    for (const [i, layer] of this.fan.entries()) {
      const age = this.fan.length - 1 - i;
      void this.engine.fadeLayer(layer, fadeOpacity(age), fadeTime(run, TIMING.fade), fadeGray(age));
    }
  }

  wipeFan(run: Run): void {
    for (const layer of [...this.fan, ...this.topPoints]) {
      void this.engine.fadeLayer(layer, 0, fadeTime(run, TIMING.fanOut)).then(() => this.engine.removeLayer(layer));
    }
    this.fan = [];
    this.topPoints = [];
  }

  private pointLayer(index: number, z: number, opacity = 1) {
    const sample = this.samples[index];
    const center = this.chart.point(sample.km, sample.price);
    const layer = this.engine.createLayer({
      color: COLORS.point,
      opacity,
      z,
      bounds: { x: center.x - STYLE.pointBox / 2, y: center.y - STYLE.pointBox / 2, width: STYLE.pointBox, height: STYLE.pointBox + DRIP_ROOM.dot },
      anchor: { region: 'chart', from: this.chart.area, pin: center },
    });
    const [minimumLoad, maximumLoad] = STYLE.dot.load;
    return { layer, center, options: { width: STYLE.dot.width, load: minimumLoad + Math.random() * (maximumLoad - minimumLoad) } };
  }

  private clipRectangle(kind: LineKind): Rectangle {
    if (kind !== 'diverge') return this.chart.area;
    return { x: -20, y: -20, width: this.engine.width + 40, height: this.engine.height + 40 };
  }
}
