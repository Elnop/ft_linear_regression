import type { DirectorDependencies } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';
import { IDLE_PLAYBACK, IDLE_PLAYBACK_ACTIONS } from '@/shared-features/animation-playback/AnimationPlaybackStateConfig.ts';

export function resetStores({ playback, regression }: DirectorDependencies): void {
  playback.setState({ ...IDLE_PLAYBACK, ...IDLE_PLAYBACK_ACTIONS });
  regression.reset();
}
