import type { PaintLayer } from './layer.ts';

export type Renderer = {
  resize(cssWidth: number, cssHeight: number, pixelRatio: number): void;
  setWall(image: HTMLImageElement): void;
  render(layers: PaintLayer[]): void;
  release(layer: PaintLayer): void;
  destroy(): void;
};
