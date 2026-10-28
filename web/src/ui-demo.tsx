import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import raw from '../../data.csv?raw';
import { parseDataset } from '../../core/csv.ts';
import { estimatePrice } from '../../core/hypothesis.ts';
import { mae, r2, rmse } from '../../core/metrics.ts';
import { trainSteps } from '../../core/train.ts';
import type { TrainStep } from '../../core/types.ts';
import { PaintWall, type PaintEngine } from './paint/index.ts';
import { drawTitle, titleLayout } from './title/index.ts';
import { chartFor, parseKm, useWallSize, WallUI, type CostPoint } from './ui/index.ts';

type Phase = 'title' | 'ui-in' | 'points' | 'interactive';

const data = parseDataset(raw);
const params = new URLSearchParams(location.search);
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function train(learningRate: number): { last: TrainStep; history: CostPoint[]; diverged: boolean } {
  const history: CostPoint[] = [];
  let last: TrainStep | null = null;
  for (const s of trainSteps(data, { learningRate, iterations: 10_000 })) {
    if ((s.iter & (s.iter - 1)) === 0 || s.iter % 500 === 0) history.push({ iter: s.iter, cost: s.cost });
    last = s;
  }
  const diverged = !Number.isFinite(last!.theta0) || !Number.isFinite(last!.theta1) || !Number.isFinite(last!.cost);
  return { last: last!, history, diverged };
}

function Demo() {
  const { width, height } = useWallSize();
  const chart = useMemo(() => chartFor(width, height), [width, height]);
  const title = useMemo(() => titleLayout(width, height), [width, height]);
  const [phase, setPhase] = useState<Phase>((params.get('phase') as Phase) ?? 'title');
  const [km, setKm] = useState(params.get('km') ?? '');
  const [lr, setLr] = useState(0.5);
  const [speed, setSpeed] = useState(4);
  const [paused, setPaused] = useState(false);
  const [forceDiverged, setForceDiverged] = useState(params.get('diverged') === '1');
  const [model, setModel] = useState(() => train(0.5));
  const tempo = useRef(Number(params.get('tempo') ?? 1));
  const engineRef = useRef<PaintEngine | null>(null);
  const run = useRef(0);

  const paint = async (engine: PaintEngine, start: Phase) => {
    const id = ++run.current;
    engine.clear();
    const live = () => id === run.current;
    const c = chartFor(engine.width, engine.height);
    if (start === 'title') {
      tempo.current = Number(params.get('tempo') ?? 1);
      setPhase('title');
      const t0 = performance.now();
      await drawTitle(engine, { tempo: () => tempo.current, seed: 7 });
      console.info(`title tagged in ${Math.round(performance.now() - t0)} ms`);
      if (!live()) return;
      setPhase('ui-in');
      await wait(700);
    } else {
      drawTitle(engine, { tempo: 30, seed: 7 });
    }
    if (!live()) return;
    setPhase('points');
    const fast = start !== 'title';
    for (const s of data) {
      const p = c.point(s.km, s.price);
      const layer = engine.createLayer({ color: '#00f0ff', bounds: { x: p.x - 30, y: p.y - 30, w: 60, h: 150 } });
      const dot = engine.sprayDot(layer, p.x, p.y, { duration: 140, load: 2, width: 15 });
      if (!fast) await dot;
      if (!live()) return;
    }
    const t = model.last;
    const a = c.point(0, estimatePrice(t, 0));
    const b = c.point(250_000, estimatePrice(t, 250_000));
    const line = engine.createLayer({ color: '#ff2bd6', bounds: { x: c.area.x - 40, y: Math.min(a.y, b.y) - 40, w: c.area.w + 80, h: Math.abs(b.y - a.y) + 300 } });
    await engine.sprayPath(line, [a, b], { speed: fast ? 1400 : 700, width: 16, load: fast ? 3.2 : 1.6 });
    if (live()) setPhase('interactive');
  };

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const t = setTimeout(() => paint(engine, 'interactive'), 300);
    return () => clearTimeout(t);
  }, [width, height]);

  const kmValue = parseKm(km);
  const price = kmValue === null ? null : estimatePrice(model.last, kmValue);
  const kmOnChart = kmValue === null ? null : Math.min(250_000, kmValue);
  const marker = kmOnChart === null || model.diverged ? null : chart.point(kmOnChart, estimatePrice(model.last, kmOnChart));
  const diverged = forceDiverged || model.diverged;
  const uiVisible = phase !== 'title';

  return (
    <>
      <PaintWall
        ref={engineRef}
        onReady={(e) => {
          engineRef.current = e;
          paint(e, phase);
        }}
      />
      <WallUI
        width={width}
        height={height}
        chart={chart}
        title={title}
        uiVisible={uiVisible}
        showSkip={phase === 'title' || phase === 'points'}
        onSkip={() => (tempo.current = 12)}
        theta0={diverged ? Infinity : model.last.theta0}
        theta1={diverged ? -Infinity : model.last.theta1}
        progress={phase === 'interactive' ? { label: 'PASSAGE', value: '10 000' } : { label: 'POINTS', value: phase === 'points' ? '…' : '0 / 24' }}
        costHistory={model.history}
        r2={diverged ? null : r2(data, model.last)}
        rmse={diverged ? null : rmse(data, model.last)}
        mae={diverged ? null : mae(data, model.last)}
        diverged={diverged}
        km={km}
        onKmChange={setKm}
        price={price}
        marker={marker}
        controls={{
          trainingActive: false,
          disabled: phase !== 'interactive',
          onTrain: () => setModel(train(lr)),
          onReset: () => engineRef.current && paint(engineRef.current, 'interactive'),
          paused,
          onPause: () => setPaused(!paused),
          learningRate: lr,
          onLearningRateChange: setLr,
          speed,
          onSpeedChange: setSpeed,
        }}
      />
      {params.get('panel') !== '0' && (
        <div style={{ position: 'fixed', left: '50%', top: 6, transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 6, font: '12px monospace' }}>
          <button onClick={() => engineRef.current && paint(engineRef.current, 'title')}>replay</button>
          <button onClick={() => setPhase(uiVisible ? 'title' : 'interactive')}>ui {uiVisible ? 'off' : 'on'}</button>
          <button onClick={() => setForceDiverged(!forceDiverged)}>diverged {diverged ? 'on' : 'off'}</button>
          <button onClick={() => setKm(km ? '' : '120000')}>marker</button>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
