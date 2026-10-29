import { stepFlow } from './flow.ts';
import { FILM_SCALE, PaintLayer } from './layer.ts';
import { dotJob, moveJob, pathJob, type Job } from './nozzle.ts';
import { createGLRenderer, type Renderer } from './glRenderer.ts';
import { createCanvasRenderer } from './canvasRenderer.ts';
import { computeRoughness, type Roughness } from './roughness.ts';
import { hexToRgb, type LayerOptions, type Nozzle, type SprayDotOptions, type SprayPathOptions, type Vec2 } from './types.ts';

const FLOW_STEP = 1 / 120;
const MAX_DT = 1 / 10;

type Running = { job: Job; layer: PaintLayer; done: () => void };
type Tween = { layer: PaintLayer; from: number; to: number; grayFrom: number; grayTo: number; t: number; duration: number; done: () => void };

export class PaintEngine {
  readonly canvas: HTMLCanvasElement;
  readonly ready: Promise<void>;
  width = 0;
  height = 0;

  private renderer: Renderer;
  private layers: PaintLayer[] = [];
  private depth = new WeakMap<PaintLayer, number>();
  private jobs: Running[] = [];
  private tweens: Tween[] = [];
  private dryWaiters: { layer: PaintLayer | null; done: () => void }[] = [];
  private resizeListeners = new Set<() => void>();
  private roughness: Roughness | null = null;
  private wall: HTMLImageElement | null = null;
  private frame = 0;
  private last = 0;
  private needsDraw = true;
  private observer: ResizeObserver;

  constructor(container: HTMLElement, wallUrl: string) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    container.appendChild(this.canvas);
    try {
      this.renderer = createGLRenderer(this.canvas);
    } catch {
      this.renderer = createCanvasRenderer(this.canvas);
    }
    this.measure();

    this.ready = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.wall = img;
        this.renderer.setWall(img);
        this.roughness = computeRoughness(img, this.width, this.height, FILM_SCALE);
        this.wake();
        resolve();
      };
      img.onerror = () => reject(new Error(`cannot load ${wallUrl}`));
      img.src = wallUrl;
    });

    this.observer = new ResizeObserver(() => {
      const w = this.width;
      const h = this.height;
      this.measure();
      if (w === this.width && h === this.height) return;
      if (this.wall) this.roughness = computeRoughness(this.wall, this.width, this.height, FILM_SCALE);
      this.wake();
      for (const cb of this.resizeListeners) cb();
    });
    this.observer.observe(container);
  }

  createLayer(o: LayerOptions): PaintLayer {
    if (!this.roughness) throw new Error('PaintEngine used before ready');
    const bounds = o.bounds ?? { x: 0, y: 0, w: this.width, h: this.height };
    const layer = new PaintLayer(bounds, hexToRgb(o.color), o.opacity ?? 1, this.roughness);
    const z = o.z ?? 0;
    this.depth.set(layer, z);
    const at = this.layers.findIndex((l) => (this.depth.get(l) ?? 0) > z);
    if (at < 0) this.layers.push(layer);
    else this.layers.splice(at, 0, layer);
    return layer;
  }

  removeLayer(layer: PaintLayer): void {
    this.layers = this.layers.filter((l) => l !== layer);
    this.renderer.release(layer);
    this.wake();
  }

  clear(): void {
    for (const l of this.layers) this.renderer.release(l);
    this.layers = [];
    this.jobs = [];
    this.tweens = [];
    this.wake();
  }

  sprayPath(layer: PaintLayer, points: Vec2[], o: SprayPathOptions = {}): Promise<void> {
    return this.run(layer, pathJob(layer, points, o));
  }

  sprayDot(layer: PaintLayer, x: number, y: number, o: SprayDotOptions = {}): Promise<void> {
    return this.run(layer, dotJob(layer, x, y, o));
  }

  sweep(layer: PaintLayer, points: Vec2[], speed: number): Promise<void> {
    return this.run(layer, moveJob(points, speed));
  }

  stampPath(layer: PaintLayer, points: Vec2[], o: SprayPathOptions = {}): void {
    this.stamp(pathJob(layer, points, o));
  }

  stampDot(layer: PaintLayer, x: number, y: number, o: SprayDotOptions = {}): void {
    this.stamp(dotJob(layer, x, y, o));
  }

  nozzle(): Nozzle | null {
    const r = this.jobs[this.jobs.length - 1];
    return r ? { x: r.job.pos.x, y: r.job.pos.y, color: r.layer.color, active: this.jobs.length } : null;
  }

  setOpacity(layer: PaintLayer, opacity: number, gray = layer.gray): void {
    layer.opacity = opacity;
    layer.gray = gray;
    this.wake();
  }

  fadeLayer(layer: PaintLayer, opacity: number, durationMs: number, gray = layer.gray): Promise<void> {
    this.tweens = this.tweens.filter((t) => t.layer !== layer);
    return new Promise((done) => {
      this.tweens.push({ layer, from: layer.opacity, to: opacity, grayFrom: layer.gray, grayTo: gray, t: 0, duration: durationMs / 1000, done });
      this.wake();
    });
  }

  whenDry(layer?: PaintLayer): Promise<void> {
    return new Promise((done) => {
      this.dryWaiters.push({ layer: layer ?? null, done });
      this.wake();
    });
  }

  onResize(cb: () => void): () => void {
    this.resizeListeners.add(cb);
    return () => this.resizeListeners.delete(cb);
  }

  destroy(): void {
    cancelAnimationFrame(this.frame);
    this.frame = -1;
    this.observer.disconnect();
    this.renderer.destroy();
    this.canvas.remove();
  }

  private run(layer: PaintLayer, job: Job): Promise<void> {
    return new Promise((done) => {
      this.jobs.push({ job, layer, done });
      this.wake();
    });
  }

  private stamp(job: Job): void {
    while (!job.update(FLOW_STEP));
    this.wake();
  }

  private measure(): void {
    const r = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, Math.round(r.width));
    this.height = Math.max(1, Math.round(r.height));
    this.renderer.resize(this.width, this.height, Math.min(window.devicePixelRatio || 1, 2));
    this.needsDraw = true;
  }

  private wake(): void {
    this.needsDraw = true;
    if (this.frame !== 0) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.frame = 0;
    const dt = Math.min(MAX_DT, Math.max(0, (now - this.last) / 1000));
    this.last = now;

    const jobs = this.jobs;
    this.jobs = [];
    for (const r of jobs) {
      if (r.job.update(dt)) r.done();
      else this.jobs.push(r);
    }

    let wet = false;
    for (const l of this.layers) {
      if (!l.wet) continue;
      const n = Math.max(2, Math.ceil(dt / FLOW_STEP));
      for (let s = 0; s < n; s++) stepFlow(l, dt / n);
      l.gloss = Math.max(0.35, l.gloss - dt * 0.08);
      wet ||= l.wet;
      this.needsDraw = true;
    }

    for (const t of this.tweens) {
      t.t = Math.min(t.duration, t.t + dt);
      const k = t.duration > 0 ? t.t / t.duration : 1;
      const e = k * k * (3 - 2 * k);
      t.layer.opacity = t.from + (t.to - t.from) * e;
      t.layer.gray = t.grayFrom + (t.grayTo - t.grayFrom) * e;
      this.needsDraw = true;
    }
    const finished = this.tweens.filter((t) => t.t >= t.duration);
    this.tweens = this.tweens.filter((t) => t.t < t.duration);
    for (const t of finished) t.done();

    if (this.jobs.length === 0) {
      this.dryWaiters = this.dryWaiters.filter((w) => {
        const isDry = w.layer ? !w.layer.wet || !this.layers.includes(w.layer) : !wet;
        if (isDry) w.done();
        return !isDry;
      });
    }

    if (this.needsDraw && this.wall) this.renderer.render(this.layers);
    this.needsDraw = false;

    if (this.jobs.length > 0 || wet || this.tweens.length > 0 || this.dryWaiters.length > 0) {
      this.frame = requestAnimationFrame(this.tick);
    }
  };
}
