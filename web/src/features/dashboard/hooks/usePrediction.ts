import { estimatePrice } from '@core/hypothesis.ts';
import { parseMileage } from '@core/mileage.ts';
import { hasFiniteThetas } from '@core/thetas.ts';
import { useMemo } from 'react';
import { usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { selectIntro } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { isDisplayablePrice } from '@/lib/format.ts';
import { useChart } from '@/lib/viewport/viewportStore.ts';

type Prediction = { invalid: boolean; price: number | null; at: { x: number; y: number } | null };

export function usePrediction(): Prediction {
  const km = usePlayground((state) => state.km);
  const thetas = useSequence((state) => state.thetas);
  const diverged = useSequence((state) => state.diverged);
  const intro = useSequence(selectIntro);
  const chart = useChart();

  return useMemo(() => {
    const mileage = parseMileage(km);
    const none = { invalid: km.trim() !== '' && mileage === null, price: null, at: null };
    if (mileage === null || diverged || !thetas || !hasFiniteThetas(thetas)) return none;
    const price = estimatePrice(thetas, mileage);
    if (!isDisplayablePrice(price)) return none;
    return { invalid: false, price, at: intro ? null : { x: chart.x(mileage), y: chart.y(price) } };
  }, [km, thetas, diverged, intro, chart]);
}
