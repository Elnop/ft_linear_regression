import type { Sample, TrainOptions } from '@core/types.ts';
import { drawTitle, stampTitle } from '@/features/title/lib/draw.ts';
import type { PaintEngine } from '@/lib/paint/engine.ts';
import { shuffled } from '@/lib/random.ts';
import type { StoreApi } from 'zustand/vanilla';
import type { SequenceState } from '@/features/sequence/types.ts';
import { lineKindAt, WallPainter } from './painter.ts';
import { IDLE_STATE } from './state.ts';
import { Timeline, type Run } from './timeline.ts';
import { TIMING } from './timing.ts';
import { DEFAULT_TRAIN, isFinalPass, runTraining, stepAt, type Step, type Training } from './training.ts';

export class SequenceController {
  private timeline = new Timeline();
  private engine: PaintEngine;
  private store: StoreApi<SequenceState>;
  private samples: Sample[];
  private painter: WallPainter;

  private order: number[];
  private training: Training | null = null;
  private unsubscribeResize: () => void;
  private resizeTimer = 0;

  constructor(engine: PaintEngine, store: StoreApi<SequenceState>, samples: Sample[]) {
    this.engine = engine;
    this.store = store;
    this.samples = samples;
    this.order = shuffled(samples.length);
    this.painter = new WallPainter(engine, samples, () => this.timeline.scale);
    this.unsubscribeResize = engine.onResize(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.repaint(), 300);
    });
  }

  start(): void {
    const run = this.restart();
    this.painter.clear();
    void this.play(run, () => this.playIntro(run));
  }

  destroy(): void {
    this.restart();
    clearTimeout(this.resizeTimer);
    this.unsubscribeResize();
  }

  skip = (): void => {
    if (this.timeline.scale === TIMING.skipScale) return;
    if (this.state.phase === 'interactive' && !this.state.trainingActive) return;
    this.timeline.scale = TIMING.skipScale;
    this.set({ skipping: true });
  };

  train = async (overrides: Partial<TrainOptions> = {}): Promise<void> => {
    if (this.state.phase !== 'interactive') return;
    const options: TrainOptions = { ...DEFAULT_TRAIN, ...overrides };
    const plan = runTraining(this.samples, options);
    const run = this.restart();
    this.training = plan;
    this.set({ trainingActive: true, trainOptions: options, diverged: false, costHistory: [] });
    await this.play(run, () => this.playTraining(run, plan));
  };

  private get state(): SequenceState {
    return this.store.getState();
  }

  private set(patch: Partial<SequenceState>): void {
    this.store.setState(patch);
  }

  private restart(): Run {
    const run = this.timeline.restart();
    if (this.state.skipping) this.set({ skipping: false });
    return run;
  }

  private async play(run: Run, script: () => Promise<void>): Promise<void> {
    if (await this.timeline.play(run, script)) this.set({ skipping: false });
  }

  private show(step: Step, extra: Partial<SequenceState> = {}): void {
    this.set({
      thetas: { theta0: step.thetas.theta0, theta1: step.thetas.theta1 },
      iteration: step.iteration,
      metrics: step.metrics,
      costHistory: step.history,
      ...extra,
    });
  }

  private async playIntro(run: Run): Promise<void> {
    const plan = runTraining(this.samples, DEFAULT_TRAIN);
    this.training = plan;
    this.order = shuffled(this.samples.length);
    this.set({ ...IDLE_STATE, phase: 'title' });

    await run.sleep(TIMING.interfaceIn);
    this.set({ visiblePoints: this.samples.length });
    await run.wait(this.painter.stampPoints(this.order, TIMING.pointsIn));

    await run.wait(drawTitle(this.engine, () => this.timeline.scale));
    await run.sleep(TIMING.beforeDescent);

    this.set({ phase: 'descent' });
    await this.playPasses(run, plan);
    this.set({ phase: 'interactive' });
  }

  private async playTraining(run: Run, plan: Training): Promise<void> {
    this.painter.wipeFan();
    await run.sleep(TIMING.fanOut);

    await this.playPasses(run, plan);
    this.set({ trainingActive: false });
  }

  private async playPasses(run: Run, plan: Training): Promise<void> {
    for (let pass = 0; pass < plan.steps.length; pass++) {
      this.show(stepAt(this.samples, plan, pass));
      const painting = this.sprayPass(plan, pass);
      this.painter.fadeFan();
      await run.wait(painting);
      await run.sleep(TIMING.afterPass);
    }
    this.set({ diverged: plan.diverged });

    for (const i of this.order) {
      await run.wait(this.painter.sprayPoint(i, TIMING.redot, true));
      await run.sleep(TIMING.redotGap);
    }
  }

  private sprayPass(plan: Training, pass: number): Promise<void> {
    const duration = isFinalPass(plan, pass) ? TIMING.finalPass : TIMING.pass;
    return this.painter.sprayLine(plan.steps[pass], lineKindAt(plan, pass), duration, pass % 2 === 1);
  }

  private repaint(): void {
    this.restart();
    this.painter.clear();
    this.painter.fit();

    stampTitle(this.engine);
    void this.painter.stampPoints(this.order);
    const plan = this.training ?? runTraining(this.samples, DEFAULT_TRAIN);
    this.training = plan;
    plan.steps.forEach((step, pass) => this.painter.stampLine(step, lineKindAt(plan, pass), pass % 2 === 1));
    for (const i of this.order) this.painter.stampTopPoint(i);
    this.painter.fadeFan(true);
    this.engine.settle();

    this.show(stepAt(this.samples, plan, plan.steps.length - 1), { diverged: plan.diverged, trainingActive: false });
    this.set({ phase: 'interactive', visiblePoints: this.samples.length });
  }
}
