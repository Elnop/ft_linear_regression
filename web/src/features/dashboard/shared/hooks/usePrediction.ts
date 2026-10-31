import { parseMileage } from '@core/mileage.ts';
import { useMemo } from 'react';
import { displayableEstimate } from '@/features/dashboard/shared/lib/estimate.ts';
import { usePlayground } from '@/features/dashboard/shared/stores/playgroundStore.ts';
import { selectIntro, selectUsableThetas } from '@/features/wall/sequence/lib/selectors.ts';
import { useSequence } from '@/features/wall/sequence/stores/sequenceStore.ts';
import type { Vec2 } from '@/shared/lib/geometry.ts';
import { useChart } from '@/shared/stores/viewportStore.ts';

type Prediction = { invalid: boolean; mileage: number | null; price: number | null; at: Vec2 | null };

export function usePrediction(): Prediction {
  const km = usePlayground((state) => state.km);
  const thetas = useSequence(selectUsableThetas);
  const intro = useSequence(selectIntro);
  const chart = useChart();

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
