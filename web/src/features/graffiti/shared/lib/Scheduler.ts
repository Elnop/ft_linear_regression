import { smoothstep } from './smoothstep.ts';
import type { PaintLayer } from './PaintLayer.ts';
import type { Job } from '@/features/graffiti/shared/types/SprayTypes.ts';

type Running = { job: Job; done: () => void };
type Look = { opacity: number; gray: number };
type Tween = { layer: PaintLayer; from: Look; to: Look; elapsed: number; duration: number; done: () => void };

function partition<T>(items: T[], keep: (item: T) => boolean): [T[], T[]] {
  const kept: T[] = [];
  const dropped: T[] = [];
  for (const item of items) (keep(item) ? kept : dropped).push(item);
  return [kept, dropped];
}

function settle(entries: { done: () => void }[]): void {
  for (const entry of entries) entry.done();
}

export class Scheduler {
  private jobs: Running[] = [];
  private tweens: Tween[] = [];

  get busy(): boolean {
    return this.jobs.length > 0 || this.tweens.length > 0;
  }

  get currentJob(): Job | null {
    return this.jobs.at(-1)?.job ?? null;
  }

  get jobCount(): number {
    return this.jobs.length;
  }

  run(job: Job): Promise<void> {
    return new Promise((done) => this.jobs.push({ job, done }));
  }

  fade(layer: PaintLayer, to: Look, durationSeconds: number): Promise<void> {
    this.cancelFade(layer);
    const from = { opacity: layer.opacity, gray: layer.gray };
    return new Promise((done) => this.tweens.push({ layer, from, to, elapsed: 0, duration: durationSeconds, done }));
  }

  cancelFade(layer: PaintLayer): void {
    const [tweens, replaced] = partition(this.tweens, (tween) => tween.layer !== layer);
    this.tweens = tweens;
    settle(replaced);
  }

  keepOnly(kept: (layer: PaintLayer) => boolean): void {
    const [jobs, droppedJobs] = partition(this.jobs, (running) => kept(running.job.layer));
    const [tweens, droppedTweens] = partition(this.tweens, (tween) => kept(tween.layer));
    this.jobs = jobs;
    this.tweens = tweens;
    settle([...droppedJobs, ...droppedTweens]);
  }

  advanceJobs(deltaSeconds: number): void {
    const [running, finished] = partition(this.jobs, (entry) => !entry.job.update(deltaSeconds));
    this.jobs = running;
    settle(finished);
  }

  advanceTweens(deltaSeconds: number): boolean {
    if (this.tweens.length === 0) return false;
    for (const tween of this.tweens) {
      const { layer, from, to } = tween;
      tween.elapsed = Math.min(tween.duration, tween.elapsed + deltaSeconds);
      const eased = smoothstep(tween.elapsed / tween.duration);
      layer.opacity = from.opacity + (to.opacity - from.opacity) * eased;
      layer.gray = from.gray + (to.gray - from.gray) * eased;
    }
    const [running, finished] = partition(this.tweens, (tween) => tween.elapsed < tween.duration);
    this.tweens = running;
    settle(finished);
    return true;
  }
}
