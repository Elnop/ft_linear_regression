import type { TrainOptions } from '@core/types.ts';
import { drawTitle as tagTitle } from '@/features/title/lib/draw.ts';
import type { PaintEngine } from '@/lib/paint/engine.ts';
import { shuffled } from '@/lib/random.ts';
import type { DrawTitle, Prediction, SequenceState } from '@/features/sequence/types.ts';
import { WallPainter } from './painter.ts';
import { IDLE_STATE } from './state.ts';
import { TIMING } from './timing.ts';
import {
  DATA,
  DEFAULT_TRAIN,
  isFinalPass,
  isFinite2,
  lineKindAt,
  priceAt,
  runTraining,
  stepAt,
  type Step,
  type Training,
} from './training.ts';

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
  private painter: WallPainter;

  private order = shuffled(DATA.length);
  private training: Training | null = null;
  private unResize: () => void;
  private resizeTimer = 0;

  constructor(engine: PaintEngine, drawTitle: DrawTitle = defaultTitle) {
    this.engine = engine;
    this.drawTitle = drawTitle;
    this.painter = new WallPainter(engine, () => this.scale);
    this.state = IDLE_STATE;
    this.unResize = engine.onResize(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.repaint(), 300);
    });
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = (): SequenceState => this.state;

  start(): void {
    const gen = this.restart();
    this.painter.clear();
    void this.run(gen, () => this.playIntro(gen));
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
    this.set({ trainingActive: true, trainOptions: o, diverged: false, costHistory: [] });
    await this.run(gen, () => this.playTraining(gen, plan));
  };

  predict = (km: number): Prediction | null => {
    const t = this.state.thetas;
    if (!t || !isFinite2(t)) return null;
    const price = priceAt(t, km);
    return { price, x: this.painter.chart.x(km), y: this.painter.chart.y(price) };
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
    this.set({ ...IDLE_STATE, phase: 'title' });

    await this.sleep(gen, TIMING.uiIn);
    this.set({ visiblePoints: DATA.length });
    await this.wait(gen, this.painter.stampPoints(this.order, TIMING.pointsIn));

    await this.wait(gen, this.paintTitle());
    await this.sleep(gen, TIMING.beforeDescent);

    this.set({ phase: 'descent' });
    await this.playPasses(gen, plan);
    this.set({ phase: 'interactive' });
  }

  private async playTraining(gen: number, plan: Training): Promise<void> {
    this.painter.wipeFan();
    await this.sleep(gen, TIMING.fanOut);

    await this.playPasses(gen, plan);
    this.set({ trainingActive: false });
  }

  private async playPasses(gen: number, plan: Training): Promise<void> {
    const last = plan.steps.length - 1;
    for (let j = 0; j <= last; j++) {
      this.show(stepAt(plan, j));
      const painting = this.sprayPass(plan, j);
      this.painter.fadeFan();
      await this.wait(gen, painting);
      await this.sleep(gen, TIMING.afterPass);
    }
    this.set({ diverged: plan.diverged });

    for (const i of this.order) {
      await this.wait(gen, this.painter.sprayPoint(i, TIMING.redot, true));
      await this.sleep(gen, TIMING.redotGap);
    }
  }

  private paintTitle(): Promise<void> {
    return this.drawTitle(this.engine, { timeScale: () => this.scale, signal: this.abort.signal });
  }

  private sprayPass(plan: Training, j: number): Promise<void> {
    const duration = isFinalPass(plan, j) ? TIMING.finalPass : TIMING.pass;
    return this.painter.sprayLine(plan.steps[j], lineKindAt(plan, j), duration, j % 2 === 1);
  }

  private repaint(): void {
    const gen = this.restart();
    this.scale = TIMING.skipScale;
    this.painter.clear();
    this.painter.fit();

    const jobs: Promise<void>[] = [this.paintTitle()];
    void this.painter.stampPoints(this.order);

    const plan = this.training ?? runTraining(DATA, DEFAULT_TRAIN, true);
    this.training = plan;
    plan.steps.forEach((_, j) => jobs.push(this.sprayPass(plan, j)));
    this.show(stepAt(plan, plan.steps.length - 1), {
      diverged: plan.diverged,
      trainingActive: false,
    });
    for (const i of this.order) jobs.push(this.painter.sprayPoint(i, TIMING.redot, true));
    this.painter.fadeFan(true);
    this.set({ phase: 'interactive', visiblePoints: DATA.length, skipping: true });
    void this.run(gen, async () => {
      await this.wait(gen, Promise.all(jobs));
    });
  }
}
