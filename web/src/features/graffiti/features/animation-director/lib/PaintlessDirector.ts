import { DEFAULT_TRAIN } from '@core/configs/TrainingConfig.ts';
import type { TrainOptions } from '@core/types/CoreTypes.ts';
import type { Director, DirectorDependencies } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';
import { resetStores } from './resetStores.ts';
import { runTraining, stepAt } from './training.ts';

export class PaintlessDirector implements Director {
  private dependencies: DirectorDependencies;

  constructor(dependencies: DirectorDependencies) {
    this.dependencies = dependencies;
    dependencies.playback.setState({
      skip: () => {},
      replay: () => this.start(),
      train: (overrides = {}) => {
        this.show({ ...DEFAULT_TRAIN, ...overrides });
        return Promise.resolve();
      },
    });
  }

  start(): void {
    this.show(DEFAULT_TRAIN);
    this.dependencies.playback.setState({ phase: 'interactive', visiblePoints: this.dependencies.samples.length, trainingActive: false });
  }

  destroy(): void {
    resetStores(this.dependencies);
  }

  private show(options: TrainOptions): void {
    const { regression, samples } = this.dependencies;
    const plan = runTraining(samples, options);
    regression.restart();
    regression.show(stepAt(samples, plan, plan.steps.length - 1));
    regression.finish(plan.diverged);
  }
}
