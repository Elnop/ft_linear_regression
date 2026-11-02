import type { Rectangle, Vec2 } from '@/shared/types/GeometryTypes.ts';

const GAP = 12;
const FLIP_ZONE = 140;
const EDGE = 4;

export function predictionLabel(at: Vec2, frame: Rectangle, fontSize: number): { x: number; y: number; anchor: 'start' | 'end' } {
  const right = frame.x + frame.width;
  const bottom = frame.y + frame.height;
  const flip = at.x > right - FLIP_ZONE;
  const x = flip ? Math.min(at.x - GAP, right - EDGE) : Math.max(at.x + GAP, frame.x + EDGE);
  const y = Math.min(bottom - EDGE, Math.max(frame.y + fontSize + EDGE, at.y - GAP));
  return { x, y, anchor: flip ? 'end' : 'start' };
}
