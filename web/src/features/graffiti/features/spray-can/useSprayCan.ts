import { useEffect, useRef } from 'react';
import { CanMotion } from '@/features/graffiti/features/spray-can/lib/CanMotion.ts';
import { drawMist } from '@/features/graffiti/features/spray-can/lib/drawMist.ts';
import { HOLE, VIEW_WIDTH } from '@/features/graffiti/features/spray-can/configs/ShapeConfig.ts';
import { CAN_SIZE, CAN_START } from '@/features/graffiti/features/spray-can/configs/CanSizeConfig.ts';
import type { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import { pixelRatio } from '@/features/graffiti/shared/lib/pixelRatio.ts';
import { sceneStore } from '@/shared/sceneStore.ts';
import { prefersReducedMotion } from '@/shared/lib/prefersReducedMotion.ts';

export function useSprayCan(engine: PaintEngine | null) {
  const box = useRef<HTMLDivElement>(null);
  const mist = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!engine || prefersReducedMotion()) return;
    const activeEngine = engine;
    const element = box.current!;
    const canvas = mist.current!;
    const context = canvas.getContext('2d')!;

    const start = sceneStore.getState();
    const motion = new CanMotion(start.width + CAN_START.offsetRight, start.height * CAN_START.heightRatio);
    let color = '';
    let misty = false;
    let last = performance.now();
    let frame = 0;

    function resize({ width, height }: { width: number; height: number }) {
      const ratio = pixelRatio();
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    resize(start);
    const unsubscribe = sceneStore.subscribe(resize);

    function tick(now: number) {
      const deltaSeconds = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { width, height } = sceneStore.getState();
      const canWidth = Math.max(CAN_SIZE.minimum, Math.min(CAN_SIZE.maximum, width * CAN_SIZE.sceneRatio));
      const scale = canWidth / VIEW_WIDTH;

      const nozzle = activeEngine.nozzle();
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
      element.classList.toggle('gone', !!nozzle && !nozzle.followable);

      if (misty) context.clearRect(0, 0, width, height);
      misty = pose.spraying;
      if (pose.spraying && nozzle) drawMist(context, pose, nozzle, color, canWidth);

      frame = pose.resting && !nozzle ? 0 : requestAnimationFrame(tick);
    }
    function wake() {
      if (frame !== 0) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
    wake();
    const unsubscribeActivity = activeEngine.onActivity(wake);

    return () => {
      cancelAnimationFrame(frame);
      unsubscribeActivity();
      unsubscribe();
    };
  }, [engine]);

  return { box, mist };
}
