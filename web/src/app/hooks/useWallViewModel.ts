import { useMemo, useState } from 'react';
import type { WallUIProps } from '@/features/dashboard/layout/components/orchestrators/WallUI.tsx';
import { useSequence } from '@/features/sequence/hooks/useSequence.ts';
import { titleLayout } from '@/features/title/lib/layout.ts';
import { formatNumber, parseKm } from '@/lib/format.ts';
import { useWallSize } from '@/lib/hooks/useWallSize.ts';
import { chartFor } from '@/lib/layout.ts';
import type { PaintEngine } from '@/lib/paint/engine.ts';

export function useWallViewModel() {
  const [engine, setEngine] = useState<PaintEngine | null>(null);
  const seq = useSequence(engine);
  const { width, height } = useWallSize();
  const chart = useMemo(() => chartFor(width, height), [width, height]);
  const title = useMemo(() => titleLayout(width, height), [width, height]);

  const [km, setKm] = useState('100000');
  const [learningRate, setLearningRate] = useState(0.5);

  const intro = seq.phase !== 'interactive';
  const uiVisible = seq.phase !== 'idle';

  const kmValue = parseKm(km);
  const prediction = kmValue !== null && !seq.diverged ? seq.predict(kmValue) : null;
  const sane = prediction !== null && Number.isFinite(prediction.price) && Math.abs(prediction.price) < 1e7;

  const progress =
    seq.phase === 'descent' || seq.phase === 'interactive'
      ? { label: 'PASSAGE', value: formatNumber(seq.iteration ?? seq.trainOptions.iterations) }
      : { label: 'POINTS', value: `${seq.visiblePoints} / ${seq.totalPoints}` };

  const wall: Omit<WallUIProps, 'doc'> = {
    width,
    height,
    chart,
    title,
    uiVisible,
    showSkip: intro && seq.phase !== 'idle' && !seq.skipping,
    onSkip: seq.skip,
    theta0: seq.thetas?.theta0 ?? null,
    theta1: seq.thetas?.theta1 ?? null,
    progress,
    costHistory: seq.costHistory,
    r2: seq.metrics?.r2 ?? null,
    rmse: seq.metrics?.rmse ?? null,
    mae: seq.metrics?.mae ?? null,
    diverged: seq.diverged,
    km,
    onKmChange: setKm,
    price: sane ? prediction.price : null,
    marker: sane && !intro ? { x: prediction.x, y: prediction.y } : null,
    controls: {
      trainingActive: seq.trainingActive,
      disabled: intro,
      onTrain: () => void seq.train({ learningRate }).catch(() => {}),
      onReset: seq.replay,
      learningRate,
      onLearningRateChange: setLearningRate,
      speed: 1,
      speeds: [],
      onSpeedChange: () => {},
    },
  };

  return {
    engine,
    onEngineReady: setEngine,
    stickers: { chart, width, titleRight: title.rect.x + title.rect.w },
    wall,
    skipping: seq.skipping,
  };
}
