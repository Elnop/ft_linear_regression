import type { Sample, TrainOptions } from '@core/types/CoreTypes.ts';
import { paintTitle } from '@/features/wall/sequence/lib/title.ts';
import type { PaintEngine } from '@/features/wall/shared/lib/engine.ts';
import type { PaintLayer } from '@/features/wall/shared/lib/layer.ts';
import { shuffled } from '@/shared/lib/random.ts';
import type { StoreApi } from 'zustand/vanilla';
import type { SequenceState, Run, Training, SequenceStep } from '@/features/wall/sequence/types/SequenceTypes.ts';
import { lineKindAt, WallPainter } from './painter.ts';
import { IDLE_STATE } from './state.ts';
import { Timeline } from './timeline.ts';
import { TIMING } from './timing.ts';
import { DEFAULT_TRAIN, isFinalPass, runTraining, stepAt } from './training.ts';

export class SequenceController {
  private timeline = new Timeline();
  private engine: PaintEngine;
  private store: StoreApi<SequenceState>;
  private samples: Sample[];
  private painter: WallPainter;

  private order: number[];
  private training: Training | null = null;
  private title: PaintLayer | null = null;
  private unsubscribeResize: () => void;
  private resizeTimer = 0;

  constructor(engine: PaintEngine, store: StoreApi<SequenceState>, samples: Sample[]) {
    this.engine = engine;
    this.store = store;
    this.samples = samples;
    this.order = shuffled(samples.length);
    this.painter = new WallPainter(engine, samples, this.timeline);
    this.unsubscribeResize = engine.onResize(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.repaint(), 300);
    });
  }

  start(): void {
    const run = this.timeline.restart();
    this.painter.clear(this.title ? [this.title] : []);
    void this.timeline.play(() => this.playIntro(run));
  }

  destroy(): void {
    this.timeline.restart();
    clearTimeout(this.resizeTimer);
    this.unsubscribeResize();
  }

  skip = (): void => {
    if (this.state.phase === 'idle') return;
    if (this.state.phase === 'interactive' && !this.state.trainingActive) return;
    this.paintFinal();
  };

  train = async (overrides: Partial<TrainOptions> = {}): Promise<void> => {
    if (this.state.phase !== 'interactive') return;
    const options: TrainOptions = { ...DEFAULT_TRAIN, ...overrides };
    const plan = runTraining(this.samples, options);
    const run = this.timeline.restart();
    this.training = plan;
    this.set({ trainingActive: true, diverged: false, costHistory: [] });
    await this.timeline.play(() => this.playTraining(run, plan));
  };

  private get state(): SequenceState {
    return this.store.getState();
  }

  private set(patch: Partial<SequenceState>): void {
    this.store.setState(patch);
  }

  private show(step: SequenceStep, extra: Partial<SequenceState> = {}): void {
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
    await this.paintBackdrop(run);
    await run.sleep(TIMING.beforeDescent);

    this.set({ phase: 'descent' });
    await this.playPasses(run, plan);
    this.set({ phase: 'interactive' });
  }

  private async paintBackdrop(run: Run): Promise<void> {
    this.set({ visiblePoints: this.samples.length });
    await run.wait(this.painter.stampPoints(this.order, TIMING.pointsIn));
    if (!this.title) this.title = await run.wait(paintTitle(this.engine, this.timeline));
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
      await run.wait(this.painter.sprayPoint(i, TIMING.redot));
      await run.sleep(TIMING.redotGap);
    }
  }

  private sprayPass(plan: Training, pass: number): Promise<void> {
    const duration = isFinalPass(plan, pass) ? TIMING.finalPass : TIMING.pass;
    return this.painter.sprayLine(plan.steps[pass], lineKindAt(plan, pass), duration, pass % 2 === 1);
  }

  private repaint(): void {
    this.title = null;
    this.painter.fit();
    this.paintFinal();
  }

  private paintFinal(): void {
    const run = this.timeline.restart(true);
    this.painter.clear(this.title ? [this.title] : []);
    const plan = this.training ?? runTraining(this.samples, DEFAULT_TRAIN);
    this.training = plan;
    void this.timeline.play(async () => {
      await this.paintBackdrop(run);
      await this.playPasses(run, plan);
      this.engine.settle();
      this.set({ phase: 'interactive', trainingActive: false });
    });
  }
}
