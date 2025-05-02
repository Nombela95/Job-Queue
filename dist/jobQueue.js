export class JobQueue {
    constructor(options = {}) {
        this.queue = [];
        this.activeJobs = 0;
        this.jobStartTimes = [];
        this.disposed = false;
        this.concurrencyLimit = options.concurrencyLimit ?? 1000;
        this.rateLimit = options.rateLimit ?? Infinity;
        this.timeoutLimit = (options.timeoutLimit ?? 1200) * 1000;
    }
    schedule(fn, ...args) {
        if (this.disposed) {
            throw new Error('Queue has been disposed');
        }
        return new Promise((resolve, reject) => {
            const job = {
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
    async processNextJob() {
        if (this.activeJobs >= this.concurrencyLimit) {
            return;
        }
        if (!this.checkRateLimit()) {
            setTimeout(() => this.processNextJob(), 1000);
            return;
        }
        const job = this.queue.shift();
        if (!job)
            return;
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
        }
        catch (error) {
            job.reject(error);
        }
        finally {
            this.activeJobs--;
            this.processNextJob();
        }
    }
    checkRateLimit() {
        if (this.rateLimit === Infinity)
            return true;
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        this.jobStartTimes = this.jobStartTimes.filter(time => time > oneMinuteAgo);
        return this.jobStartTimes.length < this.rateLimit;
    }
    size() {
        return this.queue.length;
    }
    active() {
        return this.activeJobs;
    }
    dispose() {
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
