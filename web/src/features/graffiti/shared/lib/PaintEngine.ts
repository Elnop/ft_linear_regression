import { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import { Scheduler } from '@/features/graffiti/shared/lib/Scheduler.ts';
import { pixelRatio } from '@/features/graffiti/shared/lib/pixelRatio.ts';

import { createGlRenderer } from '@/features/graffiti/shared/lib/createGlRenderer.ts';
import type { Renderer } from '@/features/graffiti/shared/types/RendererTypes.ts';
import { computeRoughness } from '@/features/graffiti/shared/lib/computeRoughness.ts';
import type { LayerOptions, Regions } from '@/features/graffiti/shared/types/LayerTypes.ts';
import type { Surface } from '@/features/graffiti/shared/types/SurfaceTypes.ts';
import { flowLayer } from '@/features/graffiti/shared/lib/flowLayer.ts';
import { FLOW_STEP, MAX_DELTA_SECONDS } from '@/features/graffiti/shared/configs/FlowConfig.ts';
import type { Nozzle, Job } from '@/features/graffiti/shared/types/SprayTypes.ts';
import type { Roughness } from '@/features/graffiti/shared/types/RoughnessTypes.ts';
import { FILM_SCALE } from '@/features/graffiti/shared/configs/LayerConfig.ts';

const FOLLOWABLE_JOBS = 2;

export class PaintEngine implements Surface {
  readonly ready: Promise<void>;
  width = 0;
  height = 0;

  private readonly canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private layers: PaintLayer[] = [];
  private scheduler = new Scheduler();
  private resizeListeners = new Set<() => void>();
  private activityListeners = new Set<() => void>();
  private roughness: Roughness | null = null;
  private regions: Regions | null = null;
  private held = false;
  private wall: HTMLImageElement | null = null;
  private frame = 0;
  private lastTime = 0;
  private needsDraw = true;
  private pixelRatio = 0;
  private observer: ResizeObserver;
  private unwatchPixelRatio = () => {};

  constructor(container: HTMLElement, wallUrl: string) {
    this.canvas = document.createElement('canvas');
    this.renderer = createGlRenderer(this.canvas);
    container.appendChild(this.canvas);
    this.measure();

    this.ready = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.wall = image;
        this.renderer.setWall(image);
        this.wake();
        resolve();
      };
      image.onerror = () => reject(new Error(`cannot load ${wallUrl}`));
      image.src = wallUrl;
    });

    this.observer = new ResizeObserver(() => this.onViewportChange());
    this.observer.observe(container);
    this.watchPixelRatio();
  }

  createLayer(options: LayerOptions): PaintLayer {
    const layer = this.detachedLayer(options);
    if (this.regions) layer.follow(this.regions);
    this.insert(layer);
    return layer;
  }

  detachedLayer(options: LayerOptions): PaintLayer {
    if (!this.wall) throw new Error('PaintEngine used before ready');
    this.roughness ??= computeRoughness(this.wall, this.width, this.height, FILM_SCALE);
    const bounds = options.bounds ?? { x: 0, y: 0, width: this.width, height: this.height };
    return new PaintLayer({ ...options, bounds }, this.roughness);
  }

  adopt(layers: PaintLayer[], { keep = [], fadeMs = 0 }: { keep?: PaintLayer[]; fadeMs?: number } = {}): void {
    const kept = (layer: PaintLayer) => keep.includes(layer);
    const leaving = this.layers.filter((layer) => !kept(layer));
    this.scheduler.keepOnly(kept);
    for (const layer of layers) if (this.regions) layer.follow(this.regions);
    if (fadeMs > 0) {
      for (const layer of layers) {
        const opacity = layer.opacity;
        layer.opacity = 0;
        void this.fadeLayer(layer, opacity, fadeMs);
      }
      for (const layer of leaving) void this.fadeLayer(layer, 0, fadeMs).then(() => this.removeLayer(layer));
    } else {
      for (const layer of leaving) this.renderer.release(layer);
      this.layers = this.layers.filter(kept);
    }
    for (const layer of layers) this.insert(layer);
    this.held = false;
    this.wake();
  }

  hold(): void {
    this.held = true;
  }

  reanchor(regions: Regions): void {
    this.regions = regions;
    for (const layer of this.layers) layer.follow(regions);
    this.wake();
  }

  removeLayer(layer: PaintLayer): void {
    this.layers = this.layers.filter((other) => other !== layer);
    this.renderer.release(layer);
    this.wake();
  }

  clear(keep: PaintLayer[] = []): void {
    const kept = (layer: PaintLayer) => keep.includes(layer);
    for (const layer of this.layers) if (!kept(layer)) this.renderer.release(layer);
    this.layers = this.layers.filter(kept);
    this.scheduler.keepOnly(kept);
    this.wake();
  }

  spray(job: Job, instant = false): Promise<void> {
    if (instant) {
      while (!job.update(FLOW_STEP));
      this.wake();
      return Promise.resolve();
    }
    const running = this.scheduler.run(job);
    this.wake();
    for (const listener of this.activityListeners) listener();
    return running;
  }

  nozzle(): Nozzle | null {
    const job = this.scheduler.currentJob;
    return job ? { x: job.position.x, y: job.position.y, color: job.layer.hex, followable: this.scheduler.jobCount <= FOLLOWABLE_JOBS } : null;
  }

  fadeLayer(layer: PaintLayer, opacity: number, durationMs: number, gray = layer.gray): Promise<void> {
    this.wake();
    if (durationMs > 0) return this.scheduler.fade(layer, { opacity, gray }, durationMs / 1000);
    this.scheduler.cancelFade(layer);
    layer.opacity = opacity;
    layer.gray = gray;
    return Promise.resolve();
  }

  onResize(listener: () => void): () => void {
    this.resizeListeners.add(listener);
    return () => this.resizeListeners.delete(listener);
  }

  onActivity(listener: () => void): () => void {
    this.activityListeners.add(listener);
    return () => this.activityListeners.delete(listener);
  }

  destroy(): void {
    cancelAnimationFrame(this.frame);
    this.frame = -1;
    this.observer.disconnect();
    this.unwatchPixelRatio();
    this.renderer.destroy();
    this.canvas.remove();
  }

  private insert(layer: PaintLayer): void {
    const at = this.layers.findIndex((other) => other.z > layer.z);
    if (at < 0) this.layers.push(layer);
    else this.layers.splice(at, 0, layer);
  }

  private onViewportChange(): void {
    if (!this.measure()) return;
    this.roughness = null;
    for (const listener of this.resizeListeners) listener();
    if (this.wall) this.renderer.render(this.layers);
    this.wake();
  }

  private watchPixelRatio(): void {
    const query = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onChange = () => {
      this.onViewportChange();
      this.watchPixelRatio();
    };
    query.addEventListener('change', onChange, { once: true });
    this.unwatchPixelRatio = () => query.removeEventListener('change', onChange);
  }

  private measure(): boolean {
    const box = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(box.width));
    const height = Math.max(1, Math.round(box.height));
    const ratio = pixelRatio();
    if (width === this.width && height === this.height && ratio === this.pixelRatio) return false;
    this.width = width;
    this.height = height;
    this.pixelRatio = ratio;
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.renderer.resize(width, height);
    this.needsDraw = true;
    return true;
  }

  private wake(): void {
    this.needsDraw = true;
    if (this.frame !== 0) return;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.frame = 0;
    const deltaSeconds = Math.min(MAX_DELTA_SECONDS, Math.max(0, (now - this.lastTime) / 1000));
    this.lastTime = now;
    const running = !this.held;

    if (running) this.scheduler.advanceJobs(deltaSeconds);
    const wet = running && this.flowWetLayers(deltaSeconds);
    if (running && this.scheduler.advanceTweens(deltaSeconds)) this.needsDraw = true;

    if (this.needsDraw && this.wall) this.renderer.render(this.layers);
    this.needsDraw = false;

    if (running && (this.scheduler.busy || wet)) this.frame = requestAnimationFrame(this.tick);
  };

  private flowWetLayers(deltaSeconds: number): boolean {
    let wet = false;
    for (const layer of this.layers) {
      if (!layer.wet) continue;
      flowLayer(layer, deltaSeconds);
      wet ||= layer.wet;
      this.needsDraw = true;
    }
    return wet;
  }
}
