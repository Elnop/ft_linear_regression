import { estimatePrice } from '@core/hypothesis.ts';
import { useMemo } from 'react';
import { usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { selectIntro } from '@/features/sequence/lib/selectors.ts';
import { hasFiniteThetas } from '@/features/sequence/lib/training.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { isDisplayablePrice, parseKm } from '@/lib/format.ts';
import { useChart } from '@/lib/viewport/viewportStore.ts';

type Prediction = { price: number | null; at: { x: number; y: number } | null };

const NONE: Prediction = { price: null, at: null };

export function usePrediction(): Prediction {
  const km = usePlayground((state) => state.km);
  const thetas = useSequence((state) => state.thetas);
  const diverged = useSequence((state) => state.diverged);
  const intro = useSequence(selectIntro);
  const chart = useChart();

  return useMemo(() => {
    const kmValue = parseKm(km);
    if (kmValue === null || diverged || !thetas || !hasFiniteThetas(thetas)) return NONE;
    const price = estimatePrice(thetas, kmValue);
    if (!isDisplayablePrice(price)) return NONE;
    return { price, at: intro ? null : { x: chart.x(kmValue), y: chart.y(price) } };
  }, [km, thetas, diverged, intro, chart]);
}
