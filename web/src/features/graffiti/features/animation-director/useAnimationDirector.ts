import { useEffect } from 'react';
import { useEngine } from '@/features/graffiti/shared/useEngine.ts';
import type { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import { AnimationDirector } from '@/features/graffiti/features/animation-director/lib/AnimationDirector.ts';
import { PaintlessDirector } from '@/features/graffiti/features/animation-director/lib/PaintlessDirector.ts';
import type { Director, DirectorDependencies } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';
import { animationPlaybackStore } from '@/shared-features/animation-playback/animationPlaybackStore.ts';
import { DATA } from '@/shared-features/regression/configs/DatasetConfig.ts';
import { regressionActions } from '@/shared-features/regression/stores/regressionStore.ts';
import { prefersReducedMotion } from '@/shared/lib/prefersReducedMotion.ts';
import { sceneStore } from '@/shared/sceneStore.ts';

function createDirector(engine: PaintEngine | null, engineFailed: boolean): Director | null {
  const dependencies: DirectorDependencies = {
    playback: animationPlaybackStore,
    regression: regressionActions,
    samples: DATA,
    reducedMotion: prefersReducedMotion(),
  };
  if (engine) return new AnimationDirector(engine, dependencies, sceneStore);
  if (engineFailed) return new PaintlessDirector(dependencies);
  return null;
}

export function useAnimationDirector(): void {
  const engine = useEngine((state) => state.engine);
  const engineFailed = useEngine((state) => state.failed);
  useEffect(() => {
    const director = createDirector(engine, engineFailed);
    if (!director) return;
    director.start();
    return () => director.destroy();
  }, [engine, engineFailed]);
}
