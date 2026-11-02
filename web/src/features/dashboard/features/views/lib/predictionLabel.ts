import type { Rectangle, Vec2 } from '@/shared/types/GeometryTypes.ts';

const GAP = 12;
const EDGE = 4;

export function predictionLabel(at: Vec2, frame: Rectangle, fontSize: number, labelWidth: number): { x: number; y: number; anchor: 'start' | 'end' } {
  const left = frame.x + EDGE;
  const right = frame.x + frame.width - EDGE;
  const flip = at.x + GAP + labelWidth > right;
  // Clamped so the whole label stays in the frame; a label wider than the frame keeps its start visible.
  const x = flip ? Math.max(Math.min(at.x - GAP, right), left + labelWidth) : Math.max(Math.min(at.x + GAP, right - labelWidth), left);
  const y = Math.min(frame.y + frame.height - EDGE, Math.max(frame.y + fontSize + EDGE, at.y - GAP));
  return { x, y, anchor: flip ? 'end' : 'start' };
}
