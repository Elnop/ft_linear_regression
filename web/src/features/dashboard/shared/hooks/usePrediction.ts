import { parseMileage } from '@core/parseMileage.ts';
import { useMemo } from 'react';
import { displayableEstimate } from '@/features/dashboard/shared/lib/displayableEstimate.ts';
import { useKm } from '@/features/dashboard/shared/stores/predictionStore.ts';
import { selectIntro } from '@/features/dashboard/shared/lib/animationPlaybackSelectors.ts';
import { selectUsableThetas } from '@/features/dashboard/shared/lib/selectUsableThetas.ts';
import { useRegression } from '@/states/regression/hooks/useRegression.ts';
import { useAnimationPlayback } from '@/states/animation-playback/hooks/useAnimationPlayback.ts';
import type { Vec2 } from '@/shared/types/GeometryTypes.ts';
import { useScene } from '@/shared/hooks/useScene.ts';

type Prediction = { invalid: boolean; mileage: number | null; price: number | null; at: Vec2 | null };

export function usePrediction(): Prediction {
  const km = useKm();
  const thetas = useRegression(selectUsableThetas);
  const intro = useAnimationPlayback(selectIntro);
  const { chart } = useScene();

  return useMemo(() => {
    const mileage = parseMileage(km);
    const price = mileage === null ? null : displayableEstimate(thetas, mileage);
    return {
      invalid: km.trim() !== '' && mileage === null,
      mileage,
      price,
      at: mileage === null || price === null || intro ? null : chart.point(mileage, price),
    };
  }, [km, thetas, intro, chart]);
}
