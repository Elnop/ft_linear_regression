import type { Rectangle } from './types.ts';

export function coverRectangle(imageWidth: number, imageHeight: number, width: number, height: number): Rectangle {
  const scale = Math.max(width / imageWidth, height / imageHeight);
  return { x: (width - imageWidth * scale) / 2, y: (height - imageHeight * scale) / 2, width: imageWidth * scale, height: imageHeight * scale };
}
