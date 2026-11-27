function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
}

export class Slicer {
  private budget: number;
  private readonly signal: AbortSignal;
  private sliceEnd = 0;
  private next: Promise<void> | null = null;

  constructor(budget: number, signal: AbortSignal) {
    this.budget = budget;
    this.signal = signal;
  }

  hurry(budget: number): void {
    this.budget = Math.max(this.budget, budget);
  }

  get due(): boolean {
    return this.signal.aborted || performance.now() >= this.sliceEnd;
  }

  get stopped(): boolean {
    return this.signal.aborted;
  }

  async pause(): Promise<void> {
    this.signal.throwIfAborted();
    if (!this.due) return;
    this.next ??= nextTask().then(() => {
      this.next = null;
      this.sliceEnd = performance.now() + this.budget;
    });
    await this.next;
    this.signal.throwIfAborted();
  }
}
