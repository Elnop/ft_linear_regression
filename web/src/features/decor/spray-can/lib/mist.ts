import { gaussian } from '@/lib/random.ts';
import type { Vec2 } from '@/lib/paint/types.ts';

export function drawMist(context: CanvasRenderingContext2D, from: Vec2, to: Vec2, color: string, canWidth: number) {
  const glow = context.createRadialGradient(to.x, to.y, 0, to.x, to.y, canWidth * 0.28);
  glow.addColorStop(0, `${color}38`);
  glow.addColorStop(1, `${color}00`);
  context.fillStyle = glow;
  context.fillRect(to.x - canWidth, to.y - canWidth, canWidth * 2, canWidth * 2);
  context.fillStyle = color;
  for (let i = 0; i < 26; i++) {
    const progress = Math.random();
    const spread = progress * canWidth * 0.07;
    context.globalAlpha = 0.25 + 0.4 * (1 - progress);
    context.fillRect(from.x + (to.x - from.x) * progress + gaussian(Math.random) * spread, from.y + (to.y - from.y) * progress + gaussian(Math.random) * spread, 1.2, 1.2);
  }
  context.globalAlpha = 1;
}
