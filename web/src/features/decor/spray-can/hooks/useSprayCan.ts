import { useEffect, useEffectEvent, useRef } from 'react';
import { CanMotion } from '@/features/decor/spray-can/lib/motion.ts';
import { drawMist } from '@/features/decor/spray-can/lib/mist.ts';
import { HOLE, VIEW_W } from '@/features/decor/spray-can/lib/shape.ts';
import type { PaintEngine } from '@/lib/paint/engine.ts';

export function useSprayCan(engine: PaintEngine | null, hidden: boolean) {
  const box = useRef<HTMLDivElement>(null);
  const mist = useRef<HTMLCanvasElement>(null);
  const isHidden = useEffectEvent(() => hidden);

  useEffect(() => {
    if (!engine || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = box.current!;
    const canvas = mist.current!;
    const ctx = canvas.getContext('2d')!;

    const motion = new CanMotion(window.innerWidth + 200, window.innerHeight * 0.3);
    let color = '';
    let misty = false;
    let last = performance.now();
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = window.innerWidth;
      const canW = Math.max(64, Math.min(110, w * 0.075));
      const scale = canW / VIEW_W;

      const n = engine.nozzle();
      const hidden = isHidden();
      const pose = motion.step(dt, n, hidden, canW);
      if (pose.color !== color) {
        color = pose.color;
        el.style.setProperty('--paint', color);
      }

      const hx = HOLE.x * scale;
      const hy = HOLE.y * scale;
      el.style.width = `${canW}px`;
      el.style.transformOrigin = `${hx}px ${hy}px`;
      el.style.transform = `translate(${pose.x - hx}px, ${pose.y - hy + pose.rattle * 2}px) rotate(${pose.angle}deg)`;
      el.classList.toggle('pressed', pose.spraying);
      el.classList.toggle('gone', hidden || (!!n && n.active > 2));

      if (misty) ctx.clearRect(0, 0, w, window.innerHeight);
      misty = pose.spraying;
      if (pose.spraying && n) drawMist(ctx, pose, n, color, canW);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [engine]);

  return { box, mist };
}
