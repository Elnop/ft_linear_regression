import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { PaintEngine } from '../paint/index.ts';
import { SequenceController } from './controller.ts';
import { DATA, DEFAULT_TRAIN } from './model.ts';
import type { Sequence, SequenceOptions, SequenceState } from './types.ts';

const IDLE: SequenceState = {
  phase: 'idle',
  visiblePoints: 0,
  totalPoints: DATA.length,
  thetas: null,
  iteration: null,
  metrics: null,
  costHistory: [],
  diverged: false,
  divergedAt: null,
  trainingActive: false,
  skipping: false,
  trainOptions: DEFAULT_TRAIN,
  chart: null,
};

const noop = () => () => {};

export function useSequence(engine: PaintEngine | null, options: SequenceOptions = {}): Sequence {
  const [ctl, setCtl] = useState<SequenceController | null>(null);
  const drawTitle = useRef(options.drawTitle);
  drawTitle.current = options.drawTitle;

  useEffect(() => {
    if (!engine) return;
    const c = new SequenceController(engine);
    if (drawTitle.current) c.setDrawTitle((e, ctx) => (drawTitle.current ?? (() => Promise.resolve()))(e, ctx));
    setCtl(c);
    c.start();
    return () => {
      c.destroy();
      setCtl(null);
    };
  }, [engine]);

  const state = useSyncExternalStore(ctl?.subscribe ?? noop, ctl?.getState ?? (() => IDLE));
  return {
    ...state,
    skip: ctl?.skip ?? (() => {}),
    train: ctl?.train ?? (async () => {}),
    replay: ctl ? () => ctl.start() : () => {},
    predict: ctl?.predict ?? (() => null),
  };
}
