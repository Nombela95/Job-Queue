import { JobQueueOptions, JobResult, Job } from './types';

export class JobQueue {
  private queue: Job<any>[];
  private activeJobs: number;
  private jobStartTimes: number[];
  private disposed: boolean;
  private readonly concurrencyLimit: number;
  private readonly rateLimit: number;
  private readonly timeoutLimit: number;

  constructor(options: JobQueueOptions = {}) {
    this.queue = [];
    this.activeJobs = 0;
    this.jobStartTimes = [];
    this.disposed = false;
    this.concurrencyLimit = options.concurrencyLimit ?? 1000;
    this.rateLimit = options.rateLimit ?? Infinity;
    this.timeoutLimit = (options.timeoutLimit ?? 1200) * 1000;
  }

  public schedule<T>(fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<JobResult<T>> {
    if (this.disposed) {
      throw new Error('Queue has been disposed');
    }

    return new Promise((resolve, reject) => {
      const job: Job<T> = {
        fn,
        args,
        resolve,
        reject,
        queuedAt: Date.now()
      };
      this.queue.push(job);
      this.processNextJob();
    });
  }

  private async processNextJob(): Promise<void> {
    if (this.activeJobs >= this.concurrencyLimit) {
      return;
    }

    if (!this.checkRateLimit()) {
      setTimeout(() => this.processNextJob(), 1000);
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeJobs++;
    this.jobStartTimes.push(Date.now());

    const startTime = Date.now();
    const queueTime = startTime - job.queuedAt;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Job timed out after ${this.timeoutLimit}ms`)), this.timeoutLimit);
      });

      const result = await Promise.race([
        job.fn(...job.args),
        timeoutPromise
      ]);

      const executionTime = Date.now() - startTime;
      job.resolve({
        result,
        queueTime,
        executionTime
      });
    } catch (error) {
      job.reject(error);
    } finally {
      this.activeJobs--;
      this.processNextJob();
    }
  }

  private checkRateLimit(): boolean {
    if (this.rateLimit === Infinity) return true;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.jobStartTimes = this.jobStartTimes.filter(time => time > oneMinuteAgo);
    return this.jobStartTimes.length < this.rateLimit;
  }

  public size(): number {
    return this.queue.length;
  }

  public active(): number {
    return this.activeJobs;
  }

  public dispose(): void {
    this.disposed = true;
    const error = new Error('Queue has been disposed');
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (job) {
        job.reject(error);
      }
    }
  }
}