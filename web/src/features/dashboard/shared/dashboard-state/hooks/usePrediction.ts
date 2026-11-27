import { parseMileage } from '@core/parseMileage.ts';
import { useMemo } from 'react';
import { displayableEstimate } from '@/features/dashboard/shared/dashboard-state/lib/displayableEstimate.ts';
import { normalizeMileage } from '@/features/dashboard/shared/dashboard-state/lib/normalizeMileage.ts';
import { useKm } from '@/features/dashboard/shared/dashboard-state/hooks/useKm.ts';
import { selectIntro } from '@/features/dashboard/shared/dashboard-state/lib/animationPlaybackSelectors.ts';
import { selectUsableThetas } from '@/features/dashboard/shared/dashboard-state/lib/selectUsableThetas.ts';
import { useRegression } from '@/features/dashboard/shared/dashboard-state/hooks/useRegression.ts';
import { useAnimationPlayback } from '@/features/dashboard/shared/dashboard-state/hooks/useAnimationPlayback.ts';
import type { Vec2 } from '@/shared/scene/types/GeometryTypes.ts';
import { useScene } from '@/shared/scene/useScene.ts';

type Prediction = {
  invalid: boolean;
  outOfRange: boolean;
  mileage: number | null;
  price: number | null;
  at: Vec2 | null;
};

export function usePrediction(): Prediction {
  const km = useKm();
  const thetas = useRegression(selectUsableThetas);
  const intro = useAnimationPlayback(selectIntro);
  const { chart } = useScene();

  return useMemo(() => {
    const mileage = parseMileage(normalizeMileage(km));
    const price = mileage === null ? null : displayableEstimate(thetas, mileage);
    return {
      invalid: km.trim() !== '' && mileage === null,
      outOfRange: mileage !== null && thetas !== null && price === null,
      mileage,
      price,
      at: mileage === null || price === null || intro ? null : chart.point(mileage, price),
    };
  }, [km, thetas, intro, chart]);
}
