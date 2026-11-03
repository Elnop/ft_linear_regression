import type { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';
import type { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import type { Slicer } from '@/features/graffiti/shared/lib/Slicer.ts';
import { flowLayer } from '@/features/graffiti/shared/lib/flowLayer.ts';
import type { LayerOptions } from '@/features/graffiti/shared/types/LayerTypes.ts';
import type { Job } from '@/features/graffiti/shared/types/SprayTypes.ts';
import type { Surface } from '@/features/graffiti/shared/types/SurfaceTypes.ts';
import { FLOW_STEP, MAX_DELTA_SECONDS } from '@/features/graffiti/shared/configs/FlowConfig.ts';

const SETTLE_SECONDS = 1.5;

export class OffscreenWall implements Surface {
  readonly width: number;
  readonly height: number;
  layers: PaintLayer[] = [];

  private engine: PaintEngine;
  private slicer: Slicer;
  private pending = new Set<Promise<void>>();

  constructor(engine: PaintEngine, slicer: Slicer) {
    this.engine = engine;
    this.slicer = slicer;
    this.width = engine.width;
    this.height = engine.height;
  }

  createLayer(options: LayerOptions): PaintLayer {
    const layer = this.engine.detachedLayer(options);
    const at = this.layers.findIndex((other) => other.z > layer.z);
    if (at < 0) this.layers.push(layer);
    else this.layers.splice(at, 0, layer);
    return layer;
  }

  spray(job: Job): Promise<void> {
    const running = this.run(job).catch((error: unknown) => {
      if (!this.slicer.stopped) throw error;
    });
    this.pending.add(running);
    const settled = () => this.pending.delete(running);
    void running.then(settled, settled);
    return running;
  }

  fadeLayer(layer: PaintLayer, opacity: number, _durationMs: number, gray = layer.gray): Promise<void> {
    layer.opacity = opacity;
    layer.gray = gray;
    return Promise.resolve();
  }

  removeLayer(layer: PaintLayer): void {
    this.layers = this.layers.filter((other) => other !== layer);
  }

  clear(keep: PaintLayer[] = []): void {
    this.layers = this.layers.filter((layer) => keep.includes(layer));
  }

  async finish({ dry }: { dry: boolean }): Promise<PaintLayer[]> {
    while (this.pending.size > 0) await Promise.all(this.pending);
    await this.slicer.pause();
    for (const layer of this.layers) {
      for (let simulated = 0; layer.wet && simulated < SETTLE_SECONDS; simulated += MAX_DELTA_SECONDS) {
        flowLayer(layer, MAX_DELTA_SECONDS);
        if (this.slicer.due) await this.slicer.pause();
      }
    }
    if (dry) for (const layer of this.layers) layer.dry();
    return this.layers;
  }

  private async run(job: Job): Promise<void> {
    while (!job.update(FLOW_STEP)) if (this.slicer.due) await this.slicer.pause();
  }
}
