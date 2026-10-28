import { mulberry32 } from './random.ts';

// Per film cell roughness in [0, 1] over the whole wall.
export type Roughness = { at(x: number, y: number): number };

// Where the wall image sits on the canvas (object-fit: cover), in CSS pixels.
export function coverRect(imgW: number, imgH: number, w: number, h: number) {
  const s = Math.max(w / imgW, h / imgH);
  return { x: (w - imgW * s) / 2, y: (h - imgH * s) / 2, w: imgW * s, h: imgH * s };
}

function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      let n = 0;
      for (let i = Math.max(0, x - r); i <= Math.min(w - 1, x + r); i++, n++) s += src[y * w + i];
      tmp[y * w + x] = s / n;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      let n = 0;
      for (let j = Math.max(0, y - r); j <= Math.min(h - 1, y + r); j++, n++) s += tmp[j * w + x];
      out[y * w + x] = s / n;
    }
  }
  return out;
}

// Derives roughness from the wall photo: local contrast (pores, form-tie holes,
// board marks) pins paint, plus a little fine noise for the sub-pixel texture.
export function computeRoughness(img: HTMLImageElement, cssW: number, cssH: number, scale: number): Roughness {
  const w = Math.max(1, Math.ceil(cssW * scale));
  const h = Math.max(1, Math.ceil(cssH * scale));
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rng = mulberry32(1337);
  const field = new Float32Array(w * h);
  if (ctx) {
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    const c = coverRect(img.naturalWidth, img.naturalHeight, w, h);
    ctx.drawImage(img, c.x, c.y, c.w, c.h);
    const px = ctx.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      lum[i] = (0.3 * px[i * 4] + 0.59 * px[i * 4 + 1] + 0.11 * px[i * 4 + 2]) / 255;
    }
    const blur = boxBlur(lum, w, h, 3);
    let mean = 0;
    for (let i = 0; i < w * h; i++) mean += Math.abs(lum[i] - blur[i]);
    mean = mean / (w * h) || 0.01;
    for (let i = 0; i < w * h; i++) {
      // Dark pits catch paint more than bright bumps.
      const d = (lum[i] - blur[i]) / mean;
      const v = 0.3 * Math.abs(d) + (d < 0 ? 0.2 * -d : 0);
      field[i] = Math.min(1, Math.max(0, 0.22 + v + 0.25 * (rng() - 0.5)));
    }
  } else {
    for (let i = 0; i < w * h; i++) field[i] = 0.3 + 0.4 * rng();
  }
  return {
    at(x: number, y: number) {
      const i = Math.min(w - 1, Math.max(0, Math.floor(x)));
      const j = Math.min(h - 1, Math.max(0, Math.floor(y)));
      return field[j * w + i];
    },
  };
}
