import type { TrainOptions } from '@core/types/CoreTypes.ts';
import { paintTitle } from './paintTitle.ts';
import type { PaintEngine } from '@/features/wall/shared/lib/PaintEngine.ts';
import type { PaintLayer } from '@/features/wall/shared/lib/PaintLayer.ts';
import { shuffled } from '@/features/wall/shared/lib/random.ts';
import type { StoreApi } from 'zustand/vanilla';
import type { Run, Training } from '@/features/wall/animation-director/types/AnimationDirectorTypes.ts';
import type { AnimationPlaybackState } from '@/states/animation-playback/types/AnimationPlaybackTypes.ts';
import { DATA } from '@/states/regression/configs/DatasetConfig.ts';
import { DEFAULT_TRAIN } from '@/states/regression/configs/TrainingConfig.ts';
import { regressionActions } from '@/states/regression/stores/regressionStore.ts';
import { WallPainter } from './WallPainter.ts';
import { IDLE_PLAYBACK } from '@/states/animation-playback/configs/AnimationPlaybackStateConfig.ts';
import { Timeline } from './Timeline.ts';
import { TIMING } from '@/features/wall/animation-director/configs/TimingConfig.ts';
import { isFinalPass, runTraining, stepAt } from './training.ts';
import { lineKindAt } from './lineKindAt.ts';

export class AnimationDirector {
  private timeline = new Timeline();
  private engine: PaintEngine;
  private store: StoreApi<AnimationPlaybackState>;
  private painter: WallPainter;

  private order: number[];
  private training: Training | null = null;
  private title: PaintLayer | null = null;
  private unsubscribeResize: () => void;
  private resizeTimer = 0;

  constructor(engine: PaintEngine, store: StoreApi<AnimationPlaybackState>) {
    this.engine = engine;
    this.store = store;
    this.order = shuffled(DATA.length);
    this.painter = new WallPainter(engine, DATA, this.timeline);
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
    const plan = runTraining(DATA, options);
    const run = this.timeline.restart();
    this.training = plan;
    this.set({ trainingActive: true });
    regressionActions.restart();
    await this.timeline.play(() => this.playTraining(run, plan));
  };

  private get state(): AnimationPlaybackState {
    return this.store.getState();
  }

  private set(patch: Partial<AnimationPlaybackState>): void {
    this.store.setState(patch);
  }

  private async playIntro(run: Run): Promise<void> {
    const plan = runTraining(DATA, DEFAULT_TRAIN);
    this.training = plan;
    this.order = shuffled(DATA.length);
    this.set({ ...IDLE_PLAYBACK, phase: 'title' });
    regressionActions.reset();

    await run.sleep(TIMING.interfaceIn);
    await this.paintBackdrop(run);
    await run.sleep(TIMING.beforeDescent);

    this.set({ phase: 'descent' });
    await this.playPasses(run, plan);
    this.set({ phase: 'interactive' });
  }

  private async paintBackdrop(run: Run): Promise<void> {
    this.set({ visiblePoints: DATA.length });
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
      regressionActions.show(stepAt(DATA, plan, pass));
      const painting = this.sprayPass(plan, pass);
      this.painter.fadeFan();
      await run.wait(painting);
      await run.sleep(TIMING.afterPass);
    }
    regressionActions.finish(plan.diverged);

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
    const plan = this.training ?? runTraining(DATA, DEFAULT_TRAIN);
    this.training = plan;
    void this.timeline.play(async () => {
      await this.paintBackdrop(run);
      await this.playPasses(run, plan);
      this.engine.settle();
      this.set({ phase: 'interactive', trainingActive: false });
    });
  }
}
