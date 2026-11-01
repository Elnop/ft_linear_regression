import { DEFAULT_TRAIN } from '@core/configs/TrainingConfig.ts';
import type { TrainOptions } from '@core/types/CoreTypes.ts';
import { paintTitle } from './paintTitle.ts';
import type { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import type { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import { shuffled } from '@/features/graffiti/shared/lib/random.ts';
import type { Director, DirectorDependencies, Run, Training } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';
import type { AnimationPlaybackState } from '@/states/animation-playback/AnimationPlaybackTypes.ts';
import { WallPainter } from './WallPainter.ts';
import { IDLE_PLAYBACK } from '@/states/animation-playback/AnimationPlaybackStateConfig.ts';
import { Timeline } from './Timeline.ts';
import { TIMING } from '@/features/graffiti/features/animation-director/configs/TimingConfig.ts';
import { isFinalPass, runTraining, stepAt } from './training.ts';
import { lineKindAt } from './lineKindAt.ts';
import { resetStores } from './resetStores.ts';

const MINOR_INTRO_RESIZE = 0.15;

export class AnimationDirector implements Director {
  private timeline = new Timeline();
  private engine: PaintEngine;
  private dependencies: DirectorDependencies;
  private painter: WallPainter;

  private order: number[] = [];
  private training: Training | null = null;
  private title: PaintLayer | null = null;
  private unsubscribeResize: () => void;
  private resizeTimer = 0;
  private paintedWidth: number;
  private paintedHeight: number;

  constructor(engine: PaintEngine, dependencies: DirectorDependencies) {
    this.engine = engine;
    this.dependencies = dependencies;
    this.painter = new WallPainter(engine, dependencies.samples, this.timeline);
    this.paintedWidth = engine.width;
    this.paintedHeight = engine.height;
    this.unsubscribeResize = engine.onResize(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.onResized(), TIMING.resizeSettle);
    });
    dependencies.playback.setState({ skip: this.skip, train: this.train, replay: () => this.start() });
  }

  start(): void {
    this.refit();
    const run = this.timeline.restart();
    this.painter.clear(this.title ? [this.title] : []);
    void this.timeline.play(() => this.playIntro(run));
  }

  destroy(): void {
    this.timeline.restart();
    clearTimeout(this.resizeTimer);
    this.unsubscribeResize();
    resetStores(this.dependencies);
  }

  private skip = (): void => {
    if (this.state.phase === 'idle') return;
    if (this.state.phase === 'interactive' && !this.state.trainingActive) return;
    this.paintFinal();
  };

  private train = async (overrides: Partial<TrainOptions> = {}): Promise<void> => {
    if (this.state.phase !== 'interactive') return;
    const options: TrainOptions = { ...DEFAULT_TRAIN, ...overrides };
    const plan = runTraining(this.dependencies.samples, options);
    const run = this.timeline.restart();
    this.training = plan;
    this.set({ trainingActive: true });
    this.dependencies.regression.restart();
    await this.timeline.play(() => this.playTraining(run, plan));
  };

  private get state(): AnimationPlaybackState {
    return this.dependencies.playback.getState();
  }

  private set(patch: Partial<AnimationPlaybackState>): void {
    this.dependencies.playback.setState(patch);
  }

  private async playIntro(run: Run): Promise<void> {
    const plan = runTraining(this.dependencies.samples, DEFAULT_TRAIN);
    this.training = plan;
    this.order = shuffled(this.dependencies.samples.length);
    this.set({ ...IDLE_PLAYBACK, phase: 'title' });
    this.dependencies.regression.reset();

    await run.sleep(TIMING.interfaceIn);
    await this.paintBackdrop(run);
    await run.sleep(TIMING.beforeDescent);

    this.set({ phase: 'descent' });
    await this.playPasses(run, plan);
    this.set({ phase: 'interactive' });
    if (this.sizeChanged()) this.repaint();
  }

  private async paintBackdrop(run: Run): Promise<void> {
    this.set({ visiblePoints: this.dependencies.samples.length });
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
    const { regression, samples } = this.dependencies;
    for (let pass = 0; pass < plan.steps.length; pass++) {
      regression.show(stepAt(samples, plan, pass));
      const painting = this.sprayPass(plan, pass);
      this.painter.fadeFan();
      await run.wait(painting);
      await run.sleep(TIMING.afterPass);
    }
    regression.finish(plan.diverged);

    for (const i of this.order) {
      await run.wait(this.painter.sprayPoint(i, TIMING.redot));
      await run.sleep(TIMING.redotGap);
    }
  }

  private sprayPass(plan: Training, pass: number): Promise<void> {
    const duration = isFinalPass(plan, pass) ? TIMING.finalPass : TIMING.pass;
    return this.painter.sprayLine(plan.steps[pass], lineKindAt(plan, pass), duration, pass % 2 === 1);
  }

  private onResized(): void {
    const { phase } = this.state;
    const intro = phase === 'title' || phase === 'descent';
    if (intro && this.isMinorResize()) return;
    this.repaint();
  }

  private isMinorResize(): boolean {
    return this.engine.width === this.paintedWidth && Math.abs(this.engine.height - this.paintedHeight) < this.paintedHeight * MINOR_INTRO_RESIZE;
  }

  private sizeChanged(): boolean {
    return this.engine.width !== this.paintedWidth || this.engine.height !== this.paintedHeight;
  }

  private refit(): void {
    if (!this.sizeChanged()) return;
    this.paintedWidth = this.engine.width;
    this.paintedHeight = this.engine.height;
    this.title = null;
    this.painter.fit();
  }

  private repaint(): void {
    this.refit();
    this.paintFinal();
  }

  private paintFinal(): void {
    const plan = this.training;
    if (!plan) return;
    const run = this.timeline.restart(true);
    this.painter.clear(this.title ? [this.title] : []);
    void this.timeline.play(async () => {
      await this.paintBackdrop(run);
      await this.playPasses(run, plan);
      this.engine.settle();
      this.set({ phase: 'interactive', trainingActive: false });
    });
  }
}
