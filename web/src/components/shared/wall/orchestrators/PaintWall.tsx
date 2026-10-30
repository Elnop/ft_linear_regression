import { useEffect, useRef } from 'react';
import wallUrl from '@/assets/wall-night.jpg';
import { PaintEngine } from '@/lib/paint/engine.ts';
import { publishEngine } from '@/lib/paint/engineStore.ts';

export function PaintWall() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const engine = new PaintEngine(box.current!, wallUrl);
    let alive = true;
    void engine.ready.then(() => {
      if (alive) publishEngine(engine);
    });
    return () => {
      alive = false;
      publishEngine(null);
      engine.destroy();
    };
  }, []);

  return <div ref={box} style={{ position: 'fixed', inset: 0, background: '#0b0b0d', zIndex: 0 }} />;
}
