import { useEffect, useRef } from 'react';
import wallUrl from '@/assets/wall-night.jpg';
import { PaintEngine } from '@/lib/paint/engine.ts';
import { publishEngine } from '@/lib/paint/engineStore.ts';

export function PaintWall() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = box.current!;
    let engine: PaintEngine;
    try {
      engine = new PaintEngine(element, wallUrl);
    } catch {
      return;
    }
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

  return (
    <>
      <div className="wall-backdrop" style={{ backgroundImage: `url(${wallUrl})` }} />
      <div ref={box} className="wall-paint" />
    </>
  );
}
