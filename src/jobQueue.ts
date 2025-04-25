type JobQueueOptions = {
    concurrencyLimit?: number; 
    rateLimit?: number;        
    timeoutLimit?: number;     
};

// Job queue result object 
type JobResult<T> = {
    result: T;          
    queueTime: number;  
    executionTime: number 
};

export class JobQueue {

    constructor(options?: JobQueueOptions) {
       // TODO: Add logic to create new job queues
    }

    schedule<T>(fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<JobResult<T>> {
       // TODO: Implement logic 
        throw new Error("Not implemented");
    }

    size(): number {
       // TODO: Implement logic to get the current number of job queues
        throw new Error("Not implemented");
    }

    active(): number {
       // TODO: Get the current number of active jobs, please
        throw new Error("Not implemented");
    }

    dispose(): void {
       // TODO: Implement logic behind disposing the queue
        throw new Error("Not implemented");
    }
}