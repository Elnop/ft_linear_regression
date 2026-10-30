class Cancelled extends Error {}

export type Run = {
  sleep: (duration: number) => Promise<void>;
  wait: <T>(promise: Promise<T>) => Promise<T>;
  isCurrent: () => boolean;
};

export class Timeline {
  scale = 1;
  instant = false;
  private current = 0;

  restart(instant = false): Run {
    this.scale = 1;
    this.instant = instant;
    const id = ++this.current;
    const isCurrent = () => id === this.current;
    const check = () => {
      if (!isCurrent()) throw new Cancelled();
    };
    return {
      isCurrent,
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
          await new Promise((resolve) => setTimeout(resolve, Math.min(left / this.scale, 50)));
          check();
          left -= (performance.now() - startedAt) * this.scale;
        }
      },
    };
  }

  async play(run: Run, script: () => Promise<void>): Promise<boolean> {
    try {
      await script();
    } catch (error) {
      if (error instanceof Cancelled) return false;
      throw error;
    }
    if (!run.isCurrent()) return false;
    this.scale = 1;
    return true;
  }
}
