import { gaussian } from '@/lib/random.ts';
import type { Vec2 } from '@/lib/paint/types.ts';

export function drawMist(ctx: CanvasRenderingContext2D, from: Vec2, to: Vec2, color: string, canW: number) {
  const g = ctx.createRadialGradient(to.x, to.y, 0, to.x, to.y, canW * 0.28);
  g.addColorStop(0, `${color}38`);
  g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g;
  ctx.fillRect(to.x - canW, to.y - canW, canW * 2, canW * 2);
  ctx.fillStyle = color;
  for (let i = 0; i < 26; i++) {
    const k = Math.random();
    const spread = k * canW * 0.07;
    ctx.globalAlpha = 0.25 + 0.4 * (1 - k);
    ctx.fillRect(from.x + (to.x - from.x) * k + gaussian(Math.random) * spread, from.y + (to.y - from.y) * k + gaussian(Math.random) * spread, 1.2, 1.2);
  }
  ctx.globalAlpha = 1;
}
