import type { Run } from '@/features/wall/sequence/types/SequenceTypes.ts';

class Cancelled extends Error {}

export class Timeline {
  instant = false;
  private current = 0;

  restart(instant = false): Run {
    this.instant = instant;
    const id = ++this.current;
    const check = () => {
      if (id !== this.current) throw new Cancelled();
    };
    return {
      wait: async (promise) => {
        const value = await promise;
        check();
        return value;
      },
      sleep: async (duration) => {
        if (instant) return check();
        let left = duration;
        while (left > 0) {
          const startedAt = performance.now();
          await new Promise((resolve) => setTimeout(resolve, Math.min(left, 50)));
          check();
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
