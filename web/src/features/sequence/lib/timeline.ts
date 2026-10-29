class Cancelled extends Error {}

// A handle on one script run: its waits throw once a newer run has started.
export type Run = {
  sleep: (ms: number) => Promise<void>;
  wait: <T>(p: Promise<T>) => Promise<T>;
  isCurrent: () => boolean;
};

export class Timeline {
  scale = 1;
  private current = 0;

  restart(): Run {
    this.scale = 1;
    const id = ++this.current;
    const isCurrent = () => id === this.current;
    const check = () => {
      if (!isCurrent()) throw new Cancelled();
    };
    return {
      isCurrent,
      wait: async (p) => {
        const v = await p;
        check();
        return v;
      },
      sleep: async (ms) => {
        let left = ms;
        while (left > 0) {
          const t0 = performance.now();
          await new Promise((r) => setTimeout(r, Math.min(left / this.scale, 50)));
          check();
          left -= (performance.now() - t0) * this.scale;
        }
      },
    };
  }

  // Resolves true when the script finished without being superseded.
  async play(run: Run, script: () => Promise<void>): Promise<boolean> {
    try {
      await script();
    } catch (e) {
      if (e instanceof Cancelled) return false;
      throw e;
    }
    if (!run.isCurrent()) return false;
    this.scale = 1;
    return true;
  }
}
