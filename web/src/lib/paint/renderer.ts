import type { PaintLayer } from './layer.ts';

export type Renderer = {
  resize(cssW: number, cssH: number, dpr: number): void;
  setWall(img: HTMLImageElement): void;
  render(layers: PaintLayer[]): void;
  release(layer: PaintLayer): void;
  destroy(): void;
};
