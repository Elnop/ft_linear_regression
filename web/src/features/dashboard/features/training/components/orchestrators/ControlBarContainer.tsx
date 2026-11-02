import { ControlBar } from '@/features/dashboard/features/training/components/presenters/ControlBar.tsx';
import { useWarn } from '@/features/dashboard/features/training/useWarn.ts';
import { selectIntro } from '@/features/dashboard/shared/lib/animationPlaybackSelectors.ts';
import { useAnimationPlayback } from '@/states/animation-playback/useAnimationPlayback.ts';
import { useTrainingOptions } from '@/states/regression/hooks/useTrainingOptions.ts';

export function ControlBarContainer() {
  const trainingActive = useAnimationPlayback((state) => state.trainingActive);
  const intro = useAnimationPlayback(selectIntro);
  const train = useAnimationPlayback((state) => state.train);
  const replay = useAnimationPlayback((state) => state.replay);
  const learningRate = useTrainingOptions((state) => state.learningRate);
  const setLearningRate = useTrainingOptions((state) => state.setLearningRate);
  const warn = useWarn();
  return (
    <ControlBar
      trainingActive={trainingActive}
      disabled={intro}
      onTrain={() => void train({ learningRate }).catch((error: unknown) => console.error(error))}
      onReset={replay}
      learningRate={learningRate}
      onLearningRateChange={setLearningRate}
      warn={warn}
    />
  );
}
