type JobQueueOptions = {
  concurrencyLimit?: number;
  rateLimit?: number;
  timeoutLimit?: number;
};

type JobResult<T> = {
  result: T;
  queueTime: number;
  executionTime: number;
};

type Job<T> = {
  fn: (...args: any[]) => Promise<T>;
  args: any[];
  resolve: (value: JobResult<T>) => void;
  reject: (reason?: any) => void;
  enqueueTime: number;
};

export class JobQueue {
  private queue: Job<any>[] = [];
  private activeCount = 0;
  private lastMinuteTimestamps: number[] = [];
  private isDisposed = false;
  private concurrencyLimit: number;
  private rateLimit: number;
  private timeoutLimit: number;

  constructor(options?: JobQueueOptions) {
    this.concurrencyLimit = options?.concurrencyLimit ?? 1000;
    this.rateLimit = options?.rateLimit ?? Infinity;
    this.timeoutLimit = options?.timeoutLimit ?? 1200;
  }

  schedule<T>(
    fn: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<JobResult<T>> {
    if (this.isDisposed) {
      return Promise.reject(new Error("JobQueue has been disposed"));
    }

    return new Promise((resolve, reject) => {
      const enqueueTime = Date.now();
      const job: Job<T> = {
        fn,
        args,
        resolve,
        reject,
        enqueueTime,
      };

      this.queue.push(job);
      this.processNext();
    });
  }

  size(): number {
    return this.queue.length;
  }

  active(): number {
    return this.activeCount;
  }

  dispose(): void {
    this.isDisposed = true;
    // Reject all queued jobs
    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      job.reject(new Error("JobQueue has been disposed"));
    }
  }

  private async processNext(): Promise<void> {
    // Check if we can process more jobs
    if (
      this.isDisposed ||
      this.activeCount >= this.concurrencyLimit ||
      this.queue.length === 0 ||
      !this.canStartNewJob()
    ) {
      return;
    }

    // Get the next job (FIFO)
    const job = this.queue.shift()!;
    this.activeCount++;
    this.lastMinuteTimestamps.push(Date.now());

    const queueTime = Date.now() - job.enqueueTime;
    const startTime = Date.now();

    try {
      // Set up timeout if needed
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        if (this.timeoutLimit <= 0) return;
        timeoutId = setTimeout(() => {
          reject(new Error(`Job timed out after ${this.timeoutLimit} seconds`));
        }, this.timeoutLimit * 1000);
      });

      // Execute the job
      const result = await Promise.race([job.fn(...job.args), timeoutPromise]);

      // Clear timeout if job completed
      if (timeoutId!) {
        clearTimeout(timeoutId);
      }

      const executionTime = Date.now() - startTime;
      job.resolve({
        result,
        queueTime,
        executionTime,
      });
    } catch (error) {
      job.reject(error);
    } finally {
      this.activeCount--;
      this.cleanupRateLimitTimestamps();
      this.processNext();
    }
  }

  private canStartNewJob(): boolean {
    if (this.rateLimit === Infinity) {
      return true;
    }

    this.cleanupRateLimitTimestamps();
    return this.lastMinuteTimestamps.length < this.rateLimit;
  }

  private cleanupRateLimitTimestamps(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove timestamps older than 1 minute
    this.lastMinuteTimestamps = this.lastMinuteTimestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo
    );
  }
}
