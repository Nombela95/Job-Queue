export class JobQueue {
    constructor(options) {
        this.queue = [];
        this.activeCount = 0;
        this.lastMinuteTimestamps = [];
        this.isDisposed = false;
        this.concurrencyLimit = options?.concurrencyLimit ?? 1000;
        this.rateLimit = options?.rateLimit ?? Infinity;
        this.timeoutLimit = options?.timeoutLimit ?? 1200;
    }
    schedule(fn, ...args) {
        if (this.isDisposed) {
            return Promise.reject(new Error("JobQueue has been disposed"));
        }
        return new Promise((resolve, reject) => {
            const enqueueTime = Date.now();
            const job = {
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
    size() {
        return this.queue.length;
    }
    active() {
        return this.activeCount;
    }
    dispose() {
        this.isDisposed = true;
        // Reject all queued jobs
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            job.reject(new Error("JobQueue has been disposed"));
        }
    }
    async processNext() {
        // Check if we can process more jobs
        if (this.isDisposed ||
            this.activeCount >= this.concurrencyLimit ||
            this.queue.length === 0 ||
            !this.canStartNewJob()) {
            return;
        }
        // Get the next job (FIFO)
        const job = this.queue.shift();
        this.activeCount++;
        this.lastMinuteTimestamps.push(Date.now());
        const queueTime = Date.now() - job.enqueueTime;
        const startTime = Date.now();
        try {
            // Set up timeout if needed
            let timeoutId;
            const timeoutPromise = new Promise((_, reject) => {
                if (this.timeoutLimit <= 0)
                    return;
                timeoutId = setTimeout(() => {
                    reject(new Error(`Job timed out after ${this.timeoutLimit} seconds`));
                }, this.timeoutLimit * 1000);
            });
            // Execute the job
            const result = await Promise.race([job.fn(...job.args), timeoutPromise]);
            // Clear timeout if job completed
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            const executionTime = Date.now() - startTime;
            job.resolve({
                result,
                queueTime,
                executionTime,
            });
        }
        catch (error) {
            job.reject(error);
        }
        finally {
            this.activeCount--;
            this.cleanupRateLimitTimestamps();
            this.processNext();
        }
    }
    canStartNewJob() {
        if (this.rateLimit === Infinity) {
            return true;
        }
        this.cleanupRateLimitTimestamps();
        return this.lastMinuteTimestamps.length < this.rateLimit;
    }
    cleanupRateLimitTimestamps() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        // Remove timestamps older than 1 minute
        this.lastMinuteTimestamps = this.lastMinuteTimestamps.filter((timestamp) => timestamp > oneMinuteAgo);
    }
}
