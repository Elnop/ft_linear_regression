import { smoothstep } from '@/lib/easing.ts';
import { stepFlow } from './flow.ts';
import { FILM_SCALE, PaintLayer } from './layer.ts';
import type { Job } from './nozzle.ts';
import { createGLRenderer, type Renderer } from './glRenderer.ts';
import { computeRoughness, type Roughness } from './roughness.ts';
import type { LayerOptions, Nozzle } from './types.ts';

const FLOW_STEP = 1 / 120;
const MAX_DELTA_SECONDS = 1 / 10;
const SETTLE_BUDGET_MS = 120;

type Running = { job: Job; done: () => void };
type Look = { opacity: number; gray: number };
type Tween = { layer: PaintLayer; from: Look; to: Look; elapsed: number; duration: number; done: () => void };

export class PaintEngine {
  readonly canvas: HTMLCanvasElement;
  readonly ready: Promise<void>;
  width = 0;
  height = 0;

  private renderer: Renderer;
  private layers: PaintLayer[] = [];
  private jobs: Running[] = [];
  private tweens: Tween[] = [];
  private resizeListeners = new Set<() => void>();
  private roughness: Roughness | null = null;
  private wall: HTMLImageElement | null = null;
  private frame = 0;
  private lastTime = 0;
  private needsDraw = true;
  private pixelRatio = 0;
  private observer: ResizeObserver;

  constructor(container: HTMLElement, wallUrl: string) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    this.renderer = createGLRenderer(this.canvas);
    container.appendChild(this.canvas);
    this.measure();

    this.ready = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.wall = image;
        this.renderer.setWall(image);
        this.fitRoughness(image);
        this.wake();
        resolve();
      };
      image.onerror = () => reject(new Error(`cannot load ${wallUrl}`));
      image.src = wallUrl;
    });

    this.observer = new ResizeObserver(() => {
      if (!this.measure()) return;
      if (this.wall) {
        this.fitRoughness(this.wall);
        this.renderer.render(this.layers);
      }
      this.wake();
      for (const listener of this.resizeListeners) listener();
    });
    this.observer.observe(container);
  }

  createLayer(options: LayerOptions): PaintLayer {
    if (!this.roughness) throw new Error('PaintEngine used before ready');
    const bounds = options.bounds ?? { x: 0, y: 0, width: this.width, height: this.height };
    const layer = new PaintLayer({ ...options, bounds }, this.roughness);
    const at = this.layers.findIndex((other) => other.z > layer.z);
    if (at < 0) this.layers.push(layer);
    else this.layers.splice(at, 0, layer);
    return layer;
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
    this.jobs = this.jobs.filter((running) => kept(running.job.layer));
    this.tweens = this.tweens.filter((tween) => kept(tween.layer));
    this.wake();
  }

  spray(job: Job, instant = false): Promise<void> {
    if (instant) {
      while (!job.update(FLOW_STEP));
      this.wake();
      return Promise.resolve();
    }
    return new Promise((done) => {
      this.jobs.push({ job, done });
      this.wake();
    });
  }

  nozzle(): Nozzle | null {
    const running = this.jobs.at(-1);
    return running ? { x: running.job.position.x, y: running.job.position.y, color: running.job.layer.hex, active: this.jobs.length } : null;
  }

  fadeLayer(layer: PaintLayer, opacity: number, durationMs: number, gray = layer.gray): Promise<void> {
    this.tweens = this.tweens.filter((tween) => tween.layer !== layer);
    this.wake();
    if (durationMs <= 0) {
      layer.opacity = opacity;
      layer.gray = gray;
      return Promise.resolve();
    }
    const from = { opacity: layer.opacity, gray: layer.gray };
    return new Promise((done) => {
      this.tweens.push({ layer, from, to: { opacity, gray }, elapsed: 0, duration: durationMs / 1000, done });
    });
  }

  settle(): void {
    const until = performance.now() + SETTLE_BUDGET_MS;
    for (const layer of this.layers) {
      while (layer.wet && performance.now() < until) this.flow(layer, MAX_DELTA_SECONDS);
    }
    this.wake();
  }

  onResize(listener: () => void): () => void {
    this.resizeListeners.add(listener);
    return () => this.resizeListeners.delete(listener);
  }

  destroy(): void {
    cancelAnimationFrame(this.frame);
    this.frame = -1;
    this.observer.disconnect();
    this.renderer.destroy();
    this.canvas.remove();
  }

  private measure(): boolean {
    const box = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(box.width));
    const height = Math.max(1, Math.round(box.height));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    if (width === this.width && height === this.height && pixelRatio === this.pixelRatio) return false;
    this.width = width;
    this.height = height;
    this.pixelRatio = pixelRatio;
    this.canvas.width = Math.round(width * pixelRatio);
    this.canvas.height = Math.round(height * pixelRatio);
    this.renderer.resize(width, height);
    this.needsDraw = true;
    return true;
  }

  private fitRoughness(wall: HTMLImageElement): void {
    this.roughness = computeRoughness(wall, this.width, this.height, FILM_SCALE);
  }

  private flow(layer: PaintLayer, deltaSeconds: number): void {
    const stepCount = Math.max(2, Math.ceil(deltaSeconds / FLOW_STEP));
    for (let step = 0; step < stepCount; step++) stepFlow(layer, deltaSeconds / stepCount);
    layer.gloss = Math.max(0.35, layer.gloss - deltaSeconds * 0.08);
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

    this.advanceJobs(deltaSeconds);
    const wet = this.flowWetLayers(deltaSeconds);
    this.advanceTweens(deltaSeconds);

    if (this.needsDraw && this.wall) this.renderer.render(this.layers);
    this.needsDraw = false;

    if (this.jobs.length > 0 || wet || this.tweens.length > 0) {
      this.frame = requestAnimationFrame(this.tick);
    }
  };

  private advanceJobs(deltaSeconds: number): void {
    const jobs = this.jobs;
    this.jobs = [];
    for (const running of jobs) {
      if (running.job.update(deltaSeconds)) running.done();
      else this.jobs.push(running);
    }
  }

  private flowWetLayers(deltaSeconds: number): boolean {
    let wet = false;
    for (const layer of this.layers) {
      if (!layer.wet) continue;
      this.flow(layer, deltaSeconds);
      wet ||= layer.wet;
      this.needsDraw = true;
    }
    return wet;
  }

  private advanceTweens(deltaSeconds: number): void {
    const finished: Tween[] = [];
    this.tweens = this.tweens.filter((tween) => {
      const { layer, from, to } = tween;
      tween.elapsed = Math.min(tween.duration, tween.elapsed + deltaSeconds);
      const eased = smoothstep(tween.elapsed / tween.duration);
      layer.opacity = from.opacity + (to.opacity - from.opacity) * eased;
      layer.gray = from.gray + (to.gray - from.gray) * eased;
      this.needsDraw = true;
      if (tween.elapsed < tween.duration) return true;
      finished.push(tween);
      return false;
    });
    for (const tween of finished) tween.done();
  }
}
