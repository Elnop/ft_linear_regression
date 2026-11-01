const MAX_PIXEL_RATIO = 2;

export function pixelRatio(): number {
  return Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
}
