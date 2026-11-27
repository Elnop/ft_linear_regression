import { ControlBar } from '@/features/dashboard/features/training/components/presenters/ControlBar.tsx';
import { useWarn } from '@/features/dashboard/features/training/hooks/useWarn.ts';
import { selectIntro } from '@/features/dashboard/shared/dashboard-state/lib/animationPlaybackSelectors.ts';
import { useAnimationPlayback } from '@/features/dashboard/shared/dashboard-state/hooks/useAnimationPlayback.ts';
import { useTrainingOptions } from '@/features/dashboard/features/training/hooks/useTrainingOptions.ts';

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
      disabled={intro}
      training={{
        active: trainingActive,
        onTrain: () => void train({ learningRate }).catch((error: unknown) => console.error(error)),
        onReset: replay,
      }}
      learningRate={{ value: learningRate, onChange: setLearningRate, warn }}
    />
  );
}
