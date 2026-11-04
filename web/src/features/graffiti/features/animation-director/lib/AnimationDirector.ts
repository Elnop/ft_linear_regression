import { DEFAULT_TRAIN } from '@core/configs/TrainingConfig.ts';
import type { TrainOptions } from '@core/types/CoreTypes.ts';
import { paintTitle } from '@/features/graffiti/features/animation-director/lib/paintTitle.ts';
import type { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import type { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import { OffscreenWall } from '@/features/graffiti/shared/lib/OffscreenWall.ts';
import { Slicer } from '@/features/graffiti/shared/lib/Slicer.ts';
import { shuffled } from '@/features/graffiti/shared/lib/random.ts';
import type { Build, Director, DirectorDependencies, Run, SceneSource, Training } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';
import type { AnimationPlaybackState } from '@/shared-features/animation-playback/AnimationPlaybackTypes.ts';
import { WallPainter } from '@/features/graffiti/features/animation-director/lib/WallPainter.ts';
import { IDLE_PLAYBACK } from '@/shared-features/animation-playback/AnimationPlaybackStateConfig.ts';
import { Timeline } from '@/features/graffiti/features/animation-director/lib/Timeline.ts';
import { TIMING } from '@/features/graffiti/features/animation-director/configs/TimingConfig.ts';
import { BUILD_SLICE_MS } from '@/features/graffiti/features/animation-director/configs/BuildConfig.ts';
import { runTraining, stepAt } from '@/features/graffiti/features/animation-director/lib/training.ts';
import { paintFinalWall } from '@/features/graffiti/features/animation-director/lib/paintFinalWall.ts';
import { wallRegions } from '@/features/graffiti/features/animation-director/lib/wallRegions.ts';
import { resetStores } from '@/features/graffiti/features/animation-director/lib/resetStores.ts';

const MINOR_INTRO_RESIZE = 0.15;

export class AnimationDirector implements Director {
  private readonly timeline = new Timeline();
  private readonly builds = new Timeline();
  private readonly engine: PaintEngine;
  private readonly dependencies: DirectorDependencies;
  private readonly painter: WallPainter;

  private order: number[] = [];
  private training: Training | null = null;
  private build: Build | null = null;
  private title: PaintLayer | null = null;
  private readonly scene: SceneSource;
  private readonly unsubscribeResize: () => void;
  private readonly unsubscribeScene: () => void;
  private resizeTimer = 0;
  private paintedWidth: number;
  private paintedHeight: number;
  private paintedRem: number;

  constructor(engine: PaintEngine, dependencies: DirectorDependencies, scene: SceneSource) {
    this.engine = engine;
    this.dependencies = dependencies;
    this.painter = new WallPainter(engine, dependencies.samples);
    this.paintedWidth = engine.width;
    this.paintedHeight = engine.height;
    this.scene = scene;
    this.paintedRem = scene.getState().rem;
    this.unsubscribeResize = engine.onResize(this.onResize);
    this.unsubscribeScene = scene.subscribe((next, previous) => {
      if (next.rem !== previous.rem) this.onResize();
    });
    dependencies.playback.setState({ skip: this.skip, train: this.train, replay: () => this.start() });
  }

  start(): void {
    this.refit();
    const run = this.timeline.restart();
    const plan = runTraining(this.dependencies.samples, DEFAULT_TRAIN);
    this.training = plan;
    this.order = shuffled(this.dependencies.samples.length);
    this.set({ ...IDLE_PLAYBACK, phase: 'title' });
    this.dependencies.regression.reset();
    this.build = this.prepare(plan, !this.title);
    if (this.dependencies.reducedMotion) {
      void this.finish();
      return;
    }
    this.painter.clear(this.title ? [this.title] : []);
    void this.timeline.play(() => this.playIntro(run, plan));
  }

  destroy(): void {
    this.timeline.restart();
    this.dropBuild();
    clearTimeout(this.resizeTimer);
    this.unsubscribeResize();
    this.unsubscribeScene();
    resetStores(this.dependencies);
  }

  private readonly onResize = (): void => {
    this.engine.reanchor(wallRegions(this.engine.width, this.engine.height));
    clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => this.onResized(), TIMING.resizeSettle);
  };

  private get rem(): number {
    return this.scene.getState().rem;
  }

  private readonly skip = (): void => {
    if (this.state.phase === 'idle') return;
    if (this.state.phase === 'interactive' && !this.state.trainingActive) return;
    void this.finish();
  };

  private readonly train = async (overrides: Partial<TrainOptions> = {}): Promise<void> => {
    if (this.state.phase !== 'interactive') return;
    await this.finish();
    const options: TrainOptions = { ...DEFAULT_TRAIN, ...overrides };
    const plan = runTraining(this.dependencies.samples, options);
    const run = this.timeline.restart();
    this.training = plan;
    this.set({ trainingActive: true });
    this.dependencies.regression.restart();
    this.build = this.prepare(plan, false);
    try {
      if (this.dependencies.reducedMotion) await this.finish();
      else await this.timeline.play(() => this.playTraining(run, plan));
    } catch (error) {
      this.set({ trainingActive: false });
      throw error;
    }
  };

  private get state(): AnimationPlaybackState {
    return this.dependencies.playback.getState();
  }

  private set(patch: Partial<AnimationPlaybackState>): void {
    this.dependencies.playback.setState(patch);
  }

  private async playIntro(run: Run, plan: Training): Promise<void> {
    await run.sleep(TIMING.interfaceIn);
    await this.paintBackdrop(run);
    await run.sleep(TIMING.beforeDescent);

    this.set({ phase: 'descent' });
    await this.playPasses(run, plan);
    this.dropBuild();
    this.set({ phase: 'interactive' });
    if (this.sizeChanged()) this.rebuild();
  }

  private async paintBackdrop(run: Run): Promise<void> {
    this.set({ visiblePoints: this.dependencies.samples.length });
    await run.wait(this.painter.stampPoints(run, this.order, TIMING.pointsIn));
    if (!this.title) this.title = await run.wait(paintTitle(this.engine, run));
  }

  private async playTraining(run: Run, plan: Training): Promise<void> {
    this.painter.wipeFan(run);
    await run.sleep(TIMING.fanOut);

    await this.playPasses(run, plan);
    this.dropBuild();
    this.set({ trainingActive: false });
  }

  private async playPasses(run: Run, plan: Training): Promise<void> {
    const { regression, samples } = this.dependencies;
    await this.painter.sprayPasses(run, plan, (pass) => regression.show(stepAt(samples, plan, pass)));
    regression.finish(plan.diverged);
    await this.painter.redot(run, this.order);
  }

  private prepare(plan: Training, withTitle: boolean): Build {
    const run = this.builds.restart(true);
    const slicer = new Slicer(BUILD_SLICE_MS.background, run.signal);
    const wall = new OffscreenWall(this.engine, slicer);
    const painted = paintFinalWall(wall, run, { samples: this.dependencies.samples, plan, order: this.order, withTitle, dry: this.dependencies.reducedMotion }).catch((error: unknown) => {
      if (run.signal.aborted) return null;
      throw error;
    });
    return { plan, slicer, width: wall.width, height: wall.height, rem: this.rem, wall: painted };
  }

  private dropBuild(): void {
    this.builds.restart();
    this.build = null;
  }

  private async finish(fadeMs = 0): Promise<void> {
    const build = this.build;
    if (!build) return;
    build.slicer.hurry(BUILD_SLICE_MS.hurry);
    this.timeline.restart();
    this.engine.hold();
    const wall = await build.wall;
    if (!wall || build !== this.build) return;
    this.build = null;
    this.engine.adopt(wall.layers, { keep: wall.title || !this.title ? [] : [this.title], fadeMs });
    this.title = wall.title ?? this.title;
    this.painter.takeOver(wall.fanLayers);
    this.paintedWidth = build.width;
    this.paintedHeight = build.height;
    this.paintedRem = build.rem;

    const { regression, samples } = this.dependencies;
    regression.show(stepAt(samples, build.plan, build.plan.steps.length - 1));
    regression.finish(build.plan.diverged);
    this.set({ phase: 'interactive', trainingActive: false, visiblePoints: samples.length });
    if (this.sizeChanged()) this.rebuild();
  }

  private onResized(): void {
    const target = this.build ?? { width: this.paintedWidth, height: this.paintedHeight, rem: this.paintedRem };
    if (this.engine.width === target.width && this.engine.height === target.height && this.rem === target.rem) return;
    const { phase } = this.state;
    const intro = phase === 'title' || phase === 'descent';
    if (intro && this.isMinorResize()) return;
    this.rebuild();
  }

  private isMinorResize(): boolean {
    return this.engine.width === this.paintedWidth && this.rem === this.paintedRem && Math.abs(this.engine.height - this.paintedHeight) < this.paintedHeight * MINOR_INTRO_RESIZE;
  }

  private sizeChanged(): boolean {
    return this.engine.width !== this.paintedWidth || this.engine.height !== this.paintedHeight || this.rem !== this.paintedRem;
  }

  private refit(): void {
    if (!this.sizeChanged()) return;
    this.paintedWidth = this.engine.width;
    this.paintedHeight = this.engine.height;
    this.paintedRem = this.rem;
    this.title = null;
    this.painter.fit();
  }

  private rebuild(): void {
    const plan = this.training;
    if (!plan) return;
    this.timeline.restart();
    this.refit();
    this.build = this.prepare(plan, true);
    void this.finish(TIMING.crossfade);
  }
}
