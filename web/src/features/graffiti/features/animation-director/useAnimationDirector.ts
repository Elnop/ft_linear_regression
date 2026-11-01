import { useEffect } from 'react';
import { useEngine, useEngineFailed } from '@/features/graffiti/shared/engineStore.ts';
import { AnimationDirector } from '@/features/graffiti/features/animation-director/lib/AnimationDirector.ts';
import { playWithoutPaint } from '@/features/graffiti/features/animation-director/lib/playWithoutPaint.ts';
import { IDLE_PLAYBACK_ACTIONS, IDLE_PLAYBACK } from '@/states/animation-playback/AnimationPlaybackStateConfig.ts';
import { animationPlaybackStore } from '@/states/animation-playback/animationPlaybackStore.ts';
import { regressionActions } from '@/states/regression/stores/regressionStore.ts';

function resetPlayback(): void {
  animationPlaybackStore.setState({ ...IDLE_PLAYBACK, ...IDLE_PLAYBACK_ACTIONS });
  regressionActions.reset();
}

export function useAnimationDirector(): void {
  const engine = useEngine();
  const engineFailed = useEngineFailed();
  useEffect(() => {
    if (engineFailed) {
      playWithoutPaint(animationPlaybackStore);
      return resetPlayback;
    }
    if (!engine) return;
    const director = new AnimationDirector(engine, animationPlaybackStore);
    animationPlaybackStore.setState({
      skip: director.skip,
      train: director.train,
      replay: () => director.start(),
    });
    director.start();
    return () => {
      director.destroy();
      resetPlayback();
    };
  }, [engine, engineFailed]);
}
