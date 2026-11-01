import { useEffect, useRef } from 'react';
import wallUrl from '@/assets/wall-night.jpg';
import { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import { publishEngine, reportEngineFailure } from '@/features/graffiti/shared/engineStore.ts';
import '@/features/graffiti/features/canvas/canvas.css';

export function PaintWallContainer() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = box.current!;
    let engine: PaintEngine;
    try {
      engine = new PaintEngine(element, wallUrl);
    } catch (error) {
      reportEngineFailure(error);
      return;
    }
    let alive = true;
    engine.ready.then(
      () => {
        if (alive) publishEngine(engine);
      },
      (error: unknown) => {
        if (alive) reportEngineFailure(error);
      },
    );
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
