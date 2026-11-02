import type { Rectangle } from '@/shared/types/GeometryTypes.ts';
import type { Anchor } from '@/features/graffiti/shared/types/LayerTypes.ts';

export function anchoredRectangle(bounds: Rectangle, { from, pin }: Anchor, to: Rectangle): Rectangle {
  const scaleX = to.width / from.width;
  const scaleY = to.height / from.height;
  if (pin) {
    const shiftX = to.x + (pin.x - from.x) * scaleX - pin.x;
    const shiftY = to.y + (pin.y - from.y) * scaleY - pin.y;
    return { ...bounds, x: bounds.x + shiftX, y: bounds.y + shiftY };
  }
  return { x: to.x + (bounds.x - from.x) * scaleX, y: to.y + (bounds.y - from.y) * scaleY, width: bounds.width * scaleX, height: bounds.height * scaleY };
}
