import type { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import type { LayerOptions } from '@/features/graffiti/shared/types/LayerTypes.ts';
import type { Job } from '@/features/graffiti/shared/types/SprayTypes.ts';

export type Surface = {
  readonly width: number;
  readonly height: number;
  createLayer(options: LayerOptions): PaintLayer;
  spray(job: Job, instant?: boolean): Promise<void>;
  fadeLayer(layer: PaintLayer, opacity: number, durationMs: number, gray?: number): Promise<void>;
  removeLayer(layer: PaintLayer): void;
  clear(keep?: PaintLayer[]): void;
};
