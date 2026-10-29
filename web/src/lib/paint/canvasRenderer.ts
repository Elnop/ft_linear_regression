import { FILM_SCALE, isEmpty, resetRect, type PaintLayer } from './layer.ts';
import type { Renderer } from './glRenderer.ts';
import { coverRect } from './roughness.ts';

export function createCanvasRenderer(canvas: HTMLCanvasElement): Renderer {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');
  let wall: HTMLImageElement | null = null;
  let view = { w: 1, h: 1, dpr: 1 };
  const cache = new Map<number, { canvas: HTMLCanvasElement; img: ImageData }>();

  const refresh = (L: PaintLayer) => {
    let c = cache.get(L.id);
    if (!c) {
      const cv = document.createElement('canvas');
      cv.width = L.mw;
      cv.height = L.mh;
      c = { canvas: cv, img: new ImageData(L.mw, L.mh) };
      cache.set(L.id, c);
    }
    if (isEmpty(L.filmDirty) && isEmpty(L.mistDirty)) return c.canvas;
    const k = 1 / FILM_SCALE;
    const f = L.filmDirty;
    const m = L.mistDirty;
    const x0 = Math.max(0, Math.min(isEmpty(f) ? Infinity : f.x0 * k, m.x0));
    const y0 = Math.max(0, Math.min(isEmpty(f) ? Infinity : f.y0 * k, m.y0));
    const x1 = Math.min(L.mw - 1, Math.max(isEmpty(f) ? -1 : f.x1 * k + k - 1, m.x1));
    const y1 = Math.min(L.mh - 1, Math.max(isEmpty(f) ? -1 : f.y1 * k + k - 1, m.y1));
    const d = c.img.data;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const t = L.film[Math.floor(y / k) * L.fw + Math.floor(x / k)] + (L.mist[y * L.mw + x] / 255) * 1.6;
        const a = 1 - Math.exp(-3.6 * t);
        const i = (y * L.mw + x) * 4;
        d[i] = L.color[0] * 255;
        d[i + 1] = L.color[1] * 255;
        d[i + 2] = L.color[2] * 255;
        d[i + 3] = a * 255;
      }
    }
    c.canvas.getContext('2d')!.putImageData(c.img, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    resetRect(f);
    resetRect(m);
    return c.canvas;
  };

  return {
    resize(w, h, dpr) {
      view = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    },
    setWall(img) {
      wall = img;
    },
    render(layers) {
      ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, view.w, view.h);
      if (wall) {
        const c = coverRect(wall.naturalWidth, wall.naturalHeight, view.w, view.h);
        ctx.drawImage(wall, c.x, c.y, c.w, c.h);
      }
      for (const L of layers) {
        const cv = refresh(L);
        ctx.globalAlpha = L.opacity;
        ctx.filter = L.gray > 0 ? `grayscale(${L.gray})` : 'none';
        ctx.drawImage(cv, L.bounds.x, L.bounds.y);
        ctx.filter = 'none';
      }
    },
    release(L) {
      cache.delete(L.id);
    },
    destroy() {
      cache.clear();
    },
  };
}
