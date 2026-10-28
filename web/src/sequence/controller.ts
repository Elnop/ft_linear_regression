import type { ChartMapping, PaintEngine, PaintLayer, Rect } from '../paint/index.ts';
import { drawTitle as tagTitle } from '../title/index.ts';
import { chartFor } from '../ui/layout.ts';
import type { Thetas, TrainOptions } from '../../../core/types.ts';
import {
  DATA,
  DEFAULT_TRAIN,
  isFinite2,
  lineSegment,
  metricsOf,
  priceAt,
  runTraining,
  shuffled,
  type Training,
} from './model.ts';
import { COLORS, eased, fadeGray, fadeOpacity, STYLE, TIMING } from './timing.ts';
import type { CostPoint, DrawTitle, Metrics, Prediction, SequenceState } from './types.ts';

const NOMINAL_SPEED = 520;
const DRIP_ROOM = { dot: 120, line: 50, diverge: 70, finalLine: 260 } as const;

type LineKind = 'line' | 'finalLine' | 'diverge';

type Stroke = { thetas: Thetas; kind: LineKind; layer: PaintLayer | null };

type Step = { thetas: Thetas; iter: number; metrics: Metrics; history: CostPoint[] };

class Cancelled extends Error {}

const defaultTitle: DrawTitle = (engine, ctx) => tagTitle(engine, { tempo: ctx.timeScale });

export class SequenceController {
  private engine: PaintEngine;
  private drawTitle: DrawTitle;
  private state: SequenceState;
  private listeners = new Set<() => void>();

  private gen = 0;
  private abort = new AbortController();
  private scale = 1;
  private chart: ChartMapping;

  private order = shuffled(DATA.length);
  private training: Training | null = null;
  private points: PaintLayer[] = [];
  private topPoints: PaintLayer[] = [];
  private fan: Stroke[] = [];
  private unResize: () => void;
  private resizeTimer = 0;

  constructor(engine: PaintEngine, drawTitle: DrawTitle = defaultTitle) {
    this.engine = engine;
    this.drawTitle = drawTitle;
    this.chart = chartFor(engine.width, engine.height);
    this.state = {
      phase: 'idle',
      visiblePoints: 0,
      totalPoints: DATA.length,
      thetas: null,
      iteration: null,
      metrics: null,
      costHistory: [],
      diverged: false,
      divergedAt: null,
      trainingActive: false,
      skipping: false,
      trainOptions: DEFAULT_TRAIN,
      chart: this.chart,
    };
    this.unResize = engine.onResize(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.repaint(), 300);
    });
  }

  setDrawTitle(drawTitle: DrawTitle | undefined): void {
    this.drawTitle = drawTitle ?? defaultTitle;
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = (): SequenceState => this.state;

  start(): void {
    const gen = this.restart();
    this.engine.clear();
    this.run(gen, () => this.playIntro(gen));
  }

  destroy(): void {
    this.restart();
    clearTimeout(this.resizeTimer);
    this.unResize();
    this.listeners.clear();
  }

  skip = (): void => {
    if (this.scale === TIMING.skipScale) return;
    if (this.state.phase === 'interactive' && !this.state.trainingActive) return;
    this.scale = TIMING.skipScale;
    this.set({ skipping: true });
  };

  train = async (options: Partial<TrainOptions> = {}): Promise<void> => {
    if (this.state.phase !== 'interactive') return;
    const o: TrainOptions = { ...DEFAULT_TRAIN, ...options };
    const plan = runTraining(DATA, o, true);
    const gen = this.restart();
    this.training = plan;
    this.set({ trainingActive: true, trainOptions: o, diverged: false, divergedAt: null, costHistory: [] });
    await this.run(gen, () => this.playTraining(gen, plan));
  };

  predict = (km: number): Prediction | null => {
    const t = this.state.thetas;
    if (!t || !isFinite2(t)) return null;
    const price = priceAt(t, km);
    return { price, x: this.chart.x(km), y: this.chart.y(price) };
  };

  private set(patch: Partial<SequenceState>): void {
    this.state = { ...this.state, ...patch };
    for (const l of this.listeners) l();
  }

  private restart(): number {
    this.abort.abort();
    this.abort = new AbortController();
    this.scale = 1;
    if (this.state.skipping) this.set({ skipping: false });
    return ++this.gen;
  }

  private check(gen: number): void {
    if (gen !== this.gen) throw new Cancelled();
  }

  private async run(gen: number, body: () => Promise<void>): Promise<void> {
    try {
      await body();
    } catch (e) {
      if (!(e instanceof Cancelled)) throw e;
      return;
    }
    if (gen === this.gen) {
      this.scale = 1;
      this.set({ skipping: false });
    }
  }

  private async wait<T>(gen: number, p: Promise<T>): Promise<T> {
    const v = await p;
    this.check(gen);
    return v;
  }

  private async sleep(gen: number, ms: number): Promise<void> {
    let left = ms;
    while (left > 0) {
      const t0 = performance.now();
      await new Promise((r) => setTimeout(r, Math.min(left / this.scale, 50)));
      this.check(gen);
      left -= (performance.now() - t0) * this.scale;
    }
  }

  private sprayPoint(index: number, duration: number, top = false): Promise<void> {
    const s = DATA[index];
    const p = this.chart.point(s.km, s.price);
    const layer = this.engine.createLayer({
      color: COLORS.point,
      z: top ? 2 : 0,
      bounds: { x: p.x - 30, y: p.y - 30, w: 60, h: 60 + DRIP_ROOM.dot },
    });
    (top ? this.topPoints : this.points).push(layer);
    const [lo, hi] = STYLE.dot.load;
    return this.engine.sprayDot(layer, p.x, p.y, {
      duration: duration / this.scale,
      width: STYLE.dot.width,
      load: lo + Math.random() * (hi - lo),
    });
  }

  private clipRect(kind: LineKind): Rect {
    if (kind !== 'diverge') return this.chart.area;
    return { x: -20, y: -20, w: this.engine.width + 40, h: this.engine.height + 40 };
  }

  private sprayLine(thetas: Thetas, kind: LineKind, duration: number): Promise<void> {
    const stroke: Stroke = { thetas, kind, layer: null };
    this.fan.push(stroke);
    const seg = lineSegment(thetas, this.chart, this.clipRect(kind));
    if (!seg) return Promise.resolve();

    const [a, b] = seg;
    const style = STYLE[kind];
    const color = kind === 'diverge' ? COLORS.diverge : COLORS.line;
    const pad = style.width * 2;
    const x0 = Math.max(0, Math.min(a.x, b.x) - pad);
    const y0 = Math.max(0, Math.min(a.y, b.y) - pad);
    const x1 = Math.min(this.engine.width, Math.max(a.x, b.x) + pad);
    const y1 = Math.min(this.engine.height, Math.max(a.y, b.y) + pad + DRIP_ROOM[kind]);
    stroke.layer = this.engine.createLayer({ color, z: 1, bounds: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } });

    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const seconds = Math.max(0.05, duration / 1000) / this.scale;
    const speed = (length / seconds) * 1.2;
    return this.engine.sprayPath(stroke.layer, [a, b], {
      speed,
      width: style.width,
      load: (style.thickness * speed) / NOMINAL_SPEED,
      dwell: (style.dwell * NOMINAL_SPEED) / speed,
      hesitations: style.hesitations,
      end: kind === 'finalLine' ? 'blob' : 'taper',
    });
  }

  private fadeFan(instant = false): void {
    const painted = this.fan.flatMap((s) => (s.layer ? [s.layer] : []));
    painted.forEach((layer, i) => {
      const age = painted.length - 1 - i;
      if (instant) this.engine.setOpacity(layer, fadeOpacity(age), fadeGray(age));
      else this.engine.fadeLayer(layer, fadeOpacity(age), TIMING.fade / this.scale, fadeGray(age));
    });
  }

  private show(step: Step, extra: Partial<SequenceState> = {}): void {
    this.set({
      thetas: { theta0: step.thetas.theta0, theta1: step.thetas.theta1 },
      iteration: step.iter,
      metrics: step.metrics,
      costHistory: step.history,
      ...extra,
    });
  }

  private async playIntro(gen: number): Promise<void> {
    const plan = runTraining(DATA, DEFAULT_TRAIN, true);
    this.training = plan;
    this.order = shuffled(DATA.length);
    this.points = [];
    this.topPoints = [];
    this.fan = [];
    this.set({
      phase: 'title', visiblePoints: 0, thetas: null, iteration: null, metrics: null, costHistory: [],
      diverged: false, divergedAt: null, trainingActive: false, trainOptions: DEFAULT_TRAIN,
    });

    await this.wait(gen, this.drawTitle(this.engine, { timeScale: () => this.scale, signal: this.abort.signal }));
    this.set({ phase: 'ui-in' });
    await this.sleep(gen, TIMING.uiIn);

    this.set({ phase: 'points' });
    for (let i = 0; i < this.order.length; i++) {
      await this.wait(gen, this.sprayPoint(this.order[i], TIMING.dot));
      this.set({ visiblePoints: i + 1 });
      await this.sleep(gen, TIMING.dotGap);
    }
    await this.sleep(gen, TIMING.beforeDescent);

    this.set({ phase: 'descent' });
    await this.playPasses(gen, plan);
    this.set({ phase: 'interactive' });
  }

  private stepOf(plan: Training, j: number): Step {
    const s = plan.steps[j];
    return {
      thetas: s,
      iter: s.iter,
      metrics: metricsOf(DATA, s),
      history: plan.history.filter((h) => h.iter <= s.iter),
    };
  }

  private async playTraining(gen: number, plan: Training): Promise<void> {
    const old = [...this.fan.flatMap((s) => (s.layer ? [s.layer] : [])), ...this.topPoints];
    for (const layer of old) {
      this.engine.fadeLayer(layer, 0, TIMING.fanOut / this.scale).then(() => this.engine.removeLayer(layer));
    }
    this.fan = [];
    this.topPoints = [];
    await this.sleep(gen, TIMING.fanOut);

    await this.playPasses(gen, plan);
    this.set({ trainingActive: false });
  }

  private async playPasses(gen: number, plan: Training): Promise<void> {
    const last = plan.steps.length - 1;
    for (let j = 0; j <= last; j++) {
      const k = last > 0 ? j / last : 1;
      const final = j === last && !plan.diverged;
      const kind: LineKind = plan.diverged ? 'diverge' : final ? 'finalLine' : 'line';
      this.show(this.stepOf(plan, j));
      const painting = this.sprayLine(plan.steps[j], kind, final ? TIMING.finalPass : eased(TIMING.pass, k));
      this.fadeFan();
      await this.wait(gen, painting);
      await this.sleep(gen, eased(TIMING.afterPass, k));
    }
    this.set({ diverged: plan.diverged, divergedAt: plan.divergedAt });

    for (const i of this.order) {
      await this.wait(gen, this.sprayPoint(i, TIMING.redot, true));
      await this.sleep(gen, TIMING.redotGap);
    }
  }

  private repaint(): void {
    const gen = this.restart();
    this.scale = TIMING.skipScale;
    this.engine.clear();
    this.chart = chartFor(this.engine.width, this.engine.height);
    this.points = [];
    this.topPoints = [];
    this.fan = [];
    this.set({ chart: this.chart });

    const jobs: Promise<void>[] = [this.drawTitle(this.engine, { timeScale: () => this.scale, signal: this.abort.signal })];
    for (const i of this.order) jobs.push(this.sprayPoint(i, TIMING.dot));

    const plan = this.training ?? runTraining(DATA, DEFAULT_TRAIN, true);
    this.training = plan;
    plan.steps.forEach((step, j) => {
      const final = j === plan.steps.length - 1 && !plan.diverged;
      const kind: LineKind = plan.diverged ? 'diverge' : final ? 'finalLine' : 'line';
      jobs.push(this.sprayLine(step, kind, final ? TIMING.finalPass : TIMING.pass[1]));
    });
    this.show(this.stepOf(plan, plan.steps.length - 1), {
      diverged: plan.diverged,
      divergedAt: plan.divergedAt,
      trainingActive: false,
    });
    for (const i of this.order) jobs.push(this.sprayPoint(i, TIMING.redot, true));
    this.fadeFan(true);
    this.set({ phase: 'interactive', visiblePoints: DATA.length, skipping: true });
    this.run(gen, async () => {
      await this.wait(gen, Promise.all(jobs));
    });
  }
}
