import { useEffect } from 'react';
import { useEngine } from '@/features/wall/shared/engineStore.ts';
import { AnimationDirector } from '@/features/wall/features/animation-director/lib/AnimationDirector.ts';
import { IDLE_PLAYBACK_ACTIONS, IDLE_PLAYBACK } from '@/states/animation-playback/AnimationPlaybackStateConfig.ts';
import { animationPlaybackStore } from '@/states/animation-playback/animationPlaybackStore.ts';
import { regressionActions } from '@/states/regression/stores/regressionStore.ts';

export function useAnimationDirector(): void {
  const engine = useEngine();
  useEffect(() => {
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
      animationPlaybackStore.setState({ ...IDLE_PLAYBACK, ...IDLE_PLAYBACK_ACTIONS });
      regressionActions.reset();
    };
  }, [engine]);
}
