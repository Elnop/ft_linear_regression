import { useEffect, useRef } from 'react';
import { CanMotion } from '@/features/graffiti/features/spray-can/lib/CanMotion.ts';
import { drawMist } from '@/features/graffiti/features/spray-can/lib/drawMist.ts';
import { HOLE, VIEW_WIDTH } from '@/features/graffiti/features/spray-can/ShapeConfig.ts';
import type { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import { pixelRatio } from '@/features/graffiti/shared/lib/pixelRatio.ts';
import { sceneStore } from '@/shared/sceneStore.ts';

export function useSprayCan(engine: PaintEngine | null) {
  const box = useRef<HTMLDivElement>(null);
  const mist = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!engine || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const element = box.current!;
    const canvas = mist.current!;
    const context = canvas.getContext('2d')!;

    const start = sceneStore.getState();
    const motion = new CanMotion(start.width + 200, start.height * 0.3);
    let color = '';
    let misty = false;
    let last = performance.now();
    let frame = 0;

    const resize = ({ width, height }: { width: number; height: number }) => {
      const ratio = pixelRatio();
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize(start);
    const unsubscribe = sceneStore.subscribe(resize);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const deltaSeconds = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { width, height } = sceneStore.getState();
      const canWidth = Math.max(64, Math.min(110, width * 0.075));
      const scale = canWidth / VIEW_WIDTH;

      const nozzle = engine.nozzle();
      const pose = motion.step(deltaSeconds, nozzle, canWidth, height);
      if (pose.color !== color) {
        color = pose.color;
        element.style.setProperty('--paint', color);
      }

      const holeX = HOLE.x * scale;
      const holeY = HOLE.y * scale;
      element.style.width = `${canWidth}px`;
      element.style.transformOrigin = `${holeX}px ${holeY}px`;
      element.style.transform = `translate(${pose.x - holeX}px, ${pose.y - holeY + pose.rattle * 2}px) rotate(${pose.angle}deg)`;
      element.classList.toggle('pressed', pose.spraying);
      element.classList.toggle('gone', !!nozzle && nozzle.active > 2);

      if (misty) context.clearRect(0, 0, width, height);
      misty = pose.spraying;
      if (pose.spraying && nozzle) drawMist(context, pose, nozzle, color, canWidth);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [engine]);

  return { box, mist };
}
