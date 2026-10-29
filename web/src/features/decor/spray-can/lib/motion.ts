import { rgbToHex, type Nozzle, type Vec2 } from '@/lib/paint/types.ts';

const BASE_TILT = -14;
const PARK_AFTER = 2.5;
const SHAKE = 0.6;
const GRAVITY = 2600;
const SUBSTEP = 1 / 240;

export type CanPose = { x: number; y: number; angle: number; rattle: number; spraying: boolean; color: string };

export class CanMotion {
  private pos: Vec2;
  private vel = { x: 0, y: 0 };
  private aim: { x: number; y: number; vx: number; vy: number };
  private angle = BASE_TILT;
  private shake = 0;
  private idle = PARK_AFTER;
  private fall: { vx: number; vy: number; spin: number } | null = null;
  private color = '';

  constructor(x: number, y: number) {
    this.pos = { x, y };
    this.aim = { x, y, vx: 0, vy: 0 };
  }

  step(dt: number, n: Nozzle | null, hidden: boolean, canW: number): CanPose {
    const { pos, vel, aim } = this;
    const spraying = !!n && n.active <= 2 && !hidden;
    if (spraying) {
      this.idle = 0;
      const hex = rgbToHex(n.color);
      if (hex !== this.color) {
        this.color = hex;
        this.shake = SHAKE;
      }
      const tx = n.x + canW * 0.36;
      const ty = n.y - canW * 0.1;
      const jump = Math.hypot(tx - aim.x, ty - aim.y);
      if (this.fall || jump > canW * 0.6 || dt === 0) {
        aim.vx = 0;
        aim.vy = 0;
      } else {
        const k = Math.min(1, dt * 12);
        aim.vx += ((tx - aim.x) / dt - aim.vx) * k;
        aim.vy += ((ty - aim.y) / dt - aim.vy) * k;
      }
      aim.x = tx;
      aim.y = ty;
    } else {
      this.idle += dt;
    }

    if (spraying && this.fall) {
      this.fall = null;
      vel.x = 0;
      vel.y = 0;
      this.angle = BASE_TILT + ((((this.angle - BASE_TILT + 180) % 360) + 360) % 360) - 180;
    } else if (!spraying && !this.fall && this.idle >= PARK_AFTER) {
      this.fall = { vx: vel.x * 0.3 + (Math.random() - 0.5) * 80, vy: -180, spin: (Math.random() < 0.5 ? -1 : 1) * (140 + Math.random() * 120) };
    }

    this.shake = Math.max(0, this.shake - dt);
    const rattle = this.shake > 0 ? Math.sin(this.shake * 30) * (this.shake / SHAKE) : 0;
    if (this.fall) {
      if (pos.y < window.innerHeight + canW * 3) {
        this.fall.vy += GRAVITY * dt;
        pos.x += this.fall.vx * dt;
        pos.y += this.fall.vy * dt;
        this.angle += this.fall.spin * dt;
      }
    } else {
      const w0 = spraying ? 26 : 14;
      const feed = spraying ? 1 : 0;
      for (let left = dt; left > 1e-6; left -= SUBSTEP) {
        const h = Math.min(SUBSTEP, left);
        vel.x += (w0 * w0 * (aim.x - pos.x) + 2 * w0 * (aim.vx * feed - vel.x)) * h;
        vel.y += (w0 * w0 * (aim.y - pos.y) + 2 * w0 * (aim.vy * feed - vel.y)) * h;
        pos.x += vel.x * h;
        pos.y += vel.y * h;
      }
      const tilt = BASE_TILT + Math.max(-8, Math.min(8, vel.x * 0.008)) + rattle * 6;
      this.angle += (tilt - this.angle) * Math.min(1, dt * 6);
    }

    return { x: pos.x, y: pos.y, angle: this.angle, rattle, spraying, color: this.color };
  }
}
