import { parseMileage } from '@core/parseMileage.ts';
import { useMemo } from 'react';
import { displayableEstimate } from '@/features/dashboard/shared/lib/displayableEstimate.ts';
import { usePlayground } from '@/features/dashboard/shared/stores/playgroundStore.ts';
import { selectIntro } from '@/features/dashboard/shared/lib/sequenceSelectors.ts';
import { selectUsableThetas } from '@/features/dashboard/shared/lib/selectUsableThetas.ts';
import { useModelPort, useSequencePort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';
import type { Vec2 } from '@/shared/types/GeometryTypes.ts';
import { useScene } from '@/shared/hooks/useScene.ts';

type Prediction = { invalid: boolean; mileage: number | null; price: number | null; at: Vec2 | null };

export function usePrediction(): Prediction {
  const km = usePlayground((state) => state.km);
  const thetas = useModelPort(selectUsableThetas);
  const intro = useSequencePort(selectIntro);
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
