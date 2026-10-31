import { mulberry32 } from '@/shared/lib/random.ts';
import { coverRectangle } from './coverRectangle.ts';

export type Roughness = { at(x: number, y: number): number };

function boxBlur(source: Float32Array, width: number, height: number, radius: number): Float32Array {
  const horizontal = new Float32Array(source.length);
  const blurred = new Float32Array(source.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let i = Math.max(0, x - radius); i <= Math.min(width - 1, x + radius); i++, count++) sum += source[y * width + i];
      horizontal[y * width + x] = sum / count;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, y - radius); j <= Math.min(height - 1, y + radius); j++, count++) sum += horizontal[j * width + x];
      blurred[y * width + x] = sum / count;
    }
  }
  return blurred;
}

export function computeRoughness(image: HTMLImageElement, cssWidth: number, cssHeight: number, scale: number): Roughness {
  const width = Math.max(1, Math.ceil(cssWidth * scale));
  const height = Math.max(1, Math.ceil(cssHeight * scale));
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const random = mulberry32(1337);
  const field = new Float32Array(width * height);
  if (context) {
    context.canvas.width = width;
    context.canvas.height = height;
    const cover = coverRectangle(image.naturalWidth, image.naturalHeight, width, height);
    context.drawImage(image, cover.x, cover.y, cover.width, cover.height);
    const pixels = context.getImageData(0, 0, width, height).data;
    const luminance = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
      luminance[i] = (0.3 * pixels[i * 4] + 0.59 * pixels[i * 4 + 1] + 0.11 * pixels[i * 4 + 2]) / 255;
    }
    const blurred = boxBlur(luminance, width, height, 3);
    let mean = 0;
    for (let i = 0; i < width * height; i++) mean += Math.abs(luminance[i] - blurred[i]);
    mean = mean / (width * height) || 0.01;
    for (let i = 0; i < width * height; i++) {
      const deviation = (luminance[i] - blurred[i]) / mean;
      const value = 0.3 * Math.abs(deviation) + (deviation < 0 ? 0.2 * -deviation : 0);
      field[i] = Math.min(1, Math.max(0, 0.22 + value + 0.25 * (random() - 0.5)));
    }
  } else {
    for (let i = 0; i < width * height; i++) field[i] = 0.3 + 0.4 * random();
  }
  return {
    at(x: number, y: number) {
      const i = Math.min(width - 1, Math.max(0, Math.floor(x)));
      const j = Math.min(height - 1, Math.max(0, Math.floor(y)));
      return field[j * width + i];
    },
  };
}
