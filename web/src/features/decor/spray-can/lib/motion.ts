import type { Nozzle, Vec2 } from '@/lib/paint/types.ts';

const BASE_TILT = -14;
const PARK_AFTER = 2.5;
const SHAKE = 0.6;
const GRAVITY = 2600;
const SUBSTEP = 1 / 240;

export type CanPose = { x: number; y: number; angle: number; rattle: number; spraying: boolean; color: string };

export class CanMotion {
  private position: Vec2;
  private velocity = { x: 0, y: 0 };
  private aim: { x: number; y: number; velocityX: number; velocityY: number };
  private angle = BASE_TILT;
  private shake = 0;
  private idle = PARK_AFTER;
  private fall: { velocityX: number; velocityY: number; spin: number } | null = null;
  private color = '';

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.aim = { x, y, velocityX: 0, velocityY: 0 };
  }

  step(deltaSeconds: number, nozzle: Nozzle | null, hidden: boolean, canWidth: number): CanPose {
    const { position, velocity, aim } = this;
    const spraying = !!nozzle && nozzle.active <= 2 && !hidden;
    if (spraying) {
      this.idle = 0;
      if (nozzle.color !== this.color) {
        this.color = nozzle.color;
        this.shake = SHAKE;
      }
      const targetX = nozzle.x + canWidth * 0.36;
      const targetY = nozzle.y - canWidth * 0.1;
      const jump = Math.hypot(targetX - aim.x, targetY - aim.y);
      if (this.fall || jump > canWidth * 0.6 || deltaSeconds === 0) {
        aim.velocityX = 0;
        aim.velocityY = 0;
      } else {
        const blend = Math.min(1, deltaSeconds * 12);
        aim.velocityX += ((targetX - aim.x) / deltaSeconds - aim.velocityX) * blend;
        aim.velocityY += ((targetY - aim.y) / deltaSeconds - aim.velocityY) * blend;
      }
      aim.x = targetX;
      aim.y = targetY;
    } else {
      this.idle += deltaSeconds;
    }

    if (spraying && this.fall) {
      this.fall = null;
      velocity.x = 0;
      velocity.y = 0;
      this.angle = BASE_TILT + ((((this.angle - BASE_TILT + 180) % 360) + 360) % 360) - 180;
    } else if (!spraying && !this.fall && this.idle >= PARK_AFTER) {
      this.fall = { velocityX: velocity.x * 0.3 + (Math.random() - 0.5) * 80, velocityY: -180, spin: (Math.random() < 0.5 ? -1 : 1) * (140 + Math.random() * 120) };
    }

    this.shake = Math.max(0, this.shake - deltaSeconds);
    const rattle = this.shake > 0 ? Math.sin(this.shake * 30) * (this.shake / SHAKE) : 0;
    if (this.fall) {
      if (position.y < window.innerHeight + canWidth * 3) {
        this.fall.velocityY += GRAVITY * deltaSeconds;
        position.x += this.fall.velocityX * deltaSeconds;
        position.y += this.fall.velocityY * deltaSeconds;
        this.angle += this.fall.spin * deltaSeconds;
      }
    } else {
      const frequency = spraying ? 26 : 14;
      const feed = spraying ? 1 : 0;
      for (let remaining = deltaSeconds; remaining > 1e-6; remaining -= SUBSTEP) {
        const substep = Math.min(SUBSTEP, remaining);
        velocity.x += (frequency * frequency * (aim.x - position.x) + 2 * frequency * (aim.velocityX * feed - velocity.x)) * substep;
        velocity.y += (frequency * frequency * (aim.y - position.y) + 2 * frequency * (aim.velocityY * feed - velocity.y)) * substep;
        position.x += velocity.x * substep;
        position.y += velocity.y * substep;
      }
      const tilt = BASE_TILT + Math.max(-8, Math.min(8, velocity.x * 0.008)) + rattle * 6;
      this.angle += (tilt - this.angle) * Math.min(1, deltaSeconds * 6);
    }

    return { x: position.x, y: position.y, angle: this.angle, rattle, spraying, color: this.color };
  }
}
