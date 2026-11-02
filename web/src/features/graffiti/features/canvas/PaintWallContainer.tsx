import { useEffect, useRef } from 'react';
import wallUrl from '@/assets/wall-night.jpg';
import { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import { engineActions } from '@/features/graffiti/shared/engineStore.ts';
import '@/features/graffiti/features/canvas/canvas.css';

export function PaintWallContainer() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = box.current!;
    let engine: PaintEngine;
    try {
      engine = new PaintEngine(element, wallUrl);
    } catch (error) {
      engineActions.fail(error);
      return;
    }
    let alive = true;
    engine.ready.then(
      () => {
        if (alive) engineActions.publish(engine);
      },
      (error: unknown) => {
        if (alive) engineActions.fail(error);
      },
    );
    return () => {
      alive = false;
      engineActions.publish(null);
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
