import { JobQueue } from './jobQueue.js';
async function runDemo() {
    console.log("Running JobQueue demo...");
    const queue = new JobQueue({
        concurrencyLimit: 2,
        timeoutLimit: 5
    });
    console.log("Creating jobs...");
    const createJob = (id, delay) => {
        return async () => {
            console.log(`Job ${id} started`);
            await new Promise(resolve => setTimeout(resolve, delay));
            console.log(`Job ${id} completed after ${delay}ms`);
            return `Result from job ${id}`;
        };
    };
    // Schedule some jobs
    const promises = [
        queue.schedule(createJob(1, 1000)),
        queue.schedule(createJob(2, 500)),
        queue.schedule(createJob(3, 1500)),
        queue.schedule(createJob(4, 800))
    ];
    // Wait for all jobs to complete
    const results = await Promise.all(promises);
    // Log the results
    results.forEach((result, index) => {
        console.log(`Job ${index + 1} result:`, result);
    });
    // Dispose of the queue
    queue.dispose();
    console.log("Queue disposed");
}
// Run the demo
runDemo().catch(error => {
    console.error("Error in demo:", error);
});
