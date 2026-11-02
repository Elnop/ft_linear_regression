import type { Run } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';

class Cancelled extends Error {}

export class Timeline {
  private controller = new AbortController();

  restart(instant = false): Run {
    this.controller.abort(new Cancelled());
    this.controller = new AbortController();
    const { signal } = this.controller;
    return {
      instant,
      signal,
      wait: async (promise) => {
        const value = await promise;
        signal.throwIfAborted();
        return value;
      },
      sleep: async (duration) => {
        signal.throwIfAborted();
        if (instant) return;
        let left = duration;
        while (left > 0) {
          const startedAt = performance.now();
          await new Promise((resolve) => setTimeout(resolve, Math.min(left, 50)));
          signal.throwIfAborted();
          left -= performance.now() - startedAt;
        }
      },
    };
  }

  async play(script: () => Promise<void>): Promise<void> {
    try {
      await script();
    } catch (error) {
      if (!(error instanceof Cancelled)) throw error;
    }
  }
}
