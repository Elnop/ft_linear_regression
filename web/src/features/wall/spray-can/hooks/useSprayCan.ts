import { useEffect, useRef } from 'react';
import { CanMotion } from '@/features/wall/spray-can/lib/CanMotion.ts';
import { drawMist } from '@/features/wall/spray-can/lib/drawMist.ts';
import { HOLE, VIEW_WIDTH } from '@/features/wall/spray-can/configs/ShapeConfig.ts';
import type { PaintEngine } from '@/features/wall/shared/lib/PaintEngine.ts';

export function useSprayCan(engine: PaintEngine | null) {
  const box = useRef<HTMLDivElement>(null);
  const mist = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!engine || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const element = box.current!;
    const canvas = mist.current!;
    const context = canvas.getContext('2d')!;

    const motion = new CanMotion(window.innerWidth + 200, window.innerHeight * 0.3);
    let color = '';
    let misty = false;
    let last = performance.now();
    let frame = 0;

    const resize = () => {
      const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const deltaSeconds = Math.min(0.05, (now - last) / 1000);
      last = now;
      const width = window.innerWidth;
      const canWidth = Math.max(64, Math.min(110, width * 0.075));
      const scale = canWidth / VIEW_WIDTH;

      const nozzle = engine.nozzle();
      const pose = motion.step(deltaSeconds, nozzle, canWidth);
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

      if (misty) context.clearRect(0, 0, width, window.innerHeight);
      misty = pose.spraying;
      if (pose.spraying && nozzle) drawMist(context, pose, nozzle, color, canWidth);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [engine]);

  return { box, mist };
}
