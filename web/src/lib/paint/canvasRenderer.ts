import { FILM_SCALE, isEmpty, resetRectangle, type PaintLayer } from './layer.ts';
import type { Renderer } from './renderer.ts';
import { coverRectangle } from './cover.ts';

export function createCanvasRenderer(canvas: HTMLCanvasElement): Renderer {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D unavailable');
  let wall: HTMLImageElement | null = null;
  let view = { width: 1, height: 1, pixelRatio: 1 };
  const cache = new Map<number, { canvas: HTMLCanvasElement; image: ImageData }>();

  const refresh = (layer: PaintLayer) => {
    let entry = cache.get(layer.id);
    if (!entry) {
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = layer.mistWidth;
      layerCanvas.height = layer.mistHeight;
      entry = { canvas: layerCanvas, image: new ImageData(layer.mistWidth, layer.mistHeight) };
      cache.set(layer.id, entry);
    }
    if (isEmpty(layer.filmDirty) && isEmpty(layer.mistDirty)) return entry.canvas;
    const cellSize = 1 / FILM_SCALE;
    const filmDirty = layer.filmDirty;
    const mistDirty = layer.mistDirty;
    const x0 = Math.max(0, Math.min(isEmpty(filmDirty) ? Infinity : filmDirty.x0 * cellSize, mistDirty.x0));
    const y0 = Math.max(0, Math.min(isEmpty(filmDirty) ? Infinity : filmDirty.y0 * cellSize, mistDirty.y0));
    const x1 = Math.min(layer.mistWidth - 1, Math.max(isEmpty(filmDirty) ? -1 : filmDirty.x1 * cellSize + cellSize - 1, mistDirty.x1));
    const y1 = Math.min(layer.mistHeight - 1, Math.max(isEmpty(filmDirty) ? -1 : filmDirty.y1 * cellSize + cellSize - 1, mistDirty.y1));
    const pixels = entry.image.data;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const thickness = layer.film[Math.floor(y / cellSize) * layer.filmWidth + Math.floor(x / cellSize)] + (layer.mist[y * layer.mistWidth + x] / 255) * 1.6;
        const alpha = 1 - Math.exp(-3.6 * thickness);
        const i = (y * layer.mistWidth + x) * 4;
        pixels[i] = layer.color[0] * 255;
        pixels[i + 1] = layer.color[1] * 255;
        pixels[i + 2] = layer.color[2] * 255;
        pixels[i + 3] = alpha * 255;
      }
    }
    entry.canvas.getContext('2d')!.putImageData(entry.image, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    resetRectangle(filmDirty);
    resetRectangle(mistDirty);
    return entry.canvas;
  };

  return {
    resize(width, height, pixelRatio) {
      view = { width, height, pixelRatio };
    },
    setWall(image) {
      wall = image;
    },
    render(layers) {
      context.setTransform(view.pixelRatio, 0, 0, view.pixelRatio, 0, 0);
      context.globalAlpha = 1;
      context.fillStyle = '#111';
      context.fillRect(0, 0, view.width, view.height);
      if (wall) {
        const cover = coverRectangle(wall.naturalWidth, wall.naturalHeight, view.width, view.height);
        context.drawImage(wall, cover.x, cover.y, cover.width, cover.height);
      }
      for (const layer of layers) {
        const layerCanvas = refresh(layer);
        context.globalAlpha = layer.opacity;
        context.filter = layer.gray > 0 ? `grayscale(${layer.gray})` : 'none';
        context.drawImage(layerCanvas, layer.bounds.x, layer.bounds.y);
        context.filter = 'none';
      }
    },
    release(layer) {
      cache.delete(layer.id);
    },
    destroy() {
      cache.clear();
    },
  };
}
