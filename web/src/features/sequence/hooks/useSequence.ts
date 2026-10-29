import { useEffect, useState, useSyncExternalStore } from 'react';
import type { PaintEngine } from '@/lib/paint/engine.ts';
import { SequenceController } from '@/features/sequence/lib/controller.ts';
import { IDLE_STATE } from '@/features/sequence/lib/state.ts';
import type { Sequence } from '@/features/sequence/types.ts';

const noop = () => () => {};

export function useSequence(engine: PaintEngine | null): Sequence {
  const [ctl, setCtl] = useState<SequenceController | null>(null);

  useEffect(() => {
    if (!engine) return;
    const c = new SequenceController(engine);
    // oxlint-disable-next-line react/set-state-in-effect -- publishes a controller tied to the engine's lifetime
    setCtl(c);
    c.start();
    return () => {
      c.destroy();
      setCtl(null);
    };
  }, [engine]);

  const state = useSyncExternalStore(ctl?.subscribe ?? noop, ctl?.getState ?? (() => IDLE_STATE));
  return {
    ...state,
    skip: ctl?.skip ?? (() => {}),
    train: ctl?.train ?? (async () => {}),
    replay: ctl ? () => ctl.start() : () => {},
    predict: ctl?.predict ?? (() => null),
  };
}
