import { useEffect, useEffectEvent, useImperativeHandle, useRef, useState, type Ref } from 'react';
import wallUrl from '@/assets/wall-night.jpg';
import { PaintEngine } from './engine.ts';

type Props = {
  ref?: Ref<PaintEngine | null>;
  onReady?: (engine: PaintEngine) => void;
};

export function PaintWall({ ref, onReady }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<PaintEngine | null>(null);
  const ready = useEffectEvent((e: PaintEngine) => onReady?.(e));

  useEffect(() => {
    const e = new PaintEngine(box.current!, wallUrl);
    let alive = true;
    void e.ready.then(() => {
      if (!alive) return;
      setEngine(e);
      ready(e);
    });
    return () => {
      alive = false;
      e.destroy();
      setEngine(null);
    };
  }, []);

  useImperativeHandle<PaintEngine | null, PaintEngine | null>(ref, () => engine, [engine]);

  return <div ref={box} style={{ position: 'fixed', inset: 0, background: '#0b0b0d', zIndex: 0 }} />;
}
