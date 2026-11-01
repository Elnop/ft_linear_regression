import { useEffect } from 'react';
import { useEngine, useEngineFailed } from '@/features/graffiti/shared/engineStore.ts';
import type { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import { AnimationDirector } from '@/features/graffiti/features/animation-director/lib/AnimationDirector.ts';
import { PaintlessDirector } from '@/features/graffiti/features/animation-director/lib/PaintlessDirector.ts';
import type { Director, DirectorDependencies } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';
import { animationPlaybackStore } from '@/states/animation-playback/animationPlaybackStore.ts';
import { DATA } from '@/states/regression/configs/DatasetConfig.ts';
import { regressionActions } from '@/states/regression/stores/regressionStore.ts';

const DEPENDENCIES: DirectorDependencies = { playback: animationPlaybackStore, regression: regressionActions, samples: DATA };

function createDirector(engine: PaintEngine | null, engineFailed: boolean): Director | null {
  if (engine) return new AnimationDirector(engine, DEPENDENCIES);
  if (engineFailed) return new PaintlessDirector(DEPENDENCIES);
  return null;
}

export function useAnimationDirector(): void {
  const engine = useEngine();
  const engineFailed = useEngineFailed();
  useEffect(() => {
    const director = createDirector(engine, engineFailed);
    if (!director) return;
    director.start();
    return () => director.destroy();
  }, [engine, engineFailed]);
}
