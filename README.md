# Job Queue

A TypeScript implementation of a configurable job queue with concurrency control, rate limiting, and timeout handling.

## Features

- Concurrency Control: Limit simultaneous job executions
- Rate Limiting: Control jobs started per minute
- Timeout Handling: Automatic job termination
- FIFO Processing: First-in-first-out execution order
- Detailed Metrics: Track queue time and execution time
- Graceful Shutdown: Dispose mechanism for clean termination

## Installation

Clone the repository:
```
git clone https://github.com/Nombela95/Job-Queue
```
## Install dependencies

```
npm install
```
## Run the application

```
npm run build
node dist/jobQueueDemo.js
```
## Testing

Run the test suite:
```
npm test
```

## Usage

```
import { JobQueue } from 'job-queue';

// Create a job queue
const queue = new JobQueue({
  concurrencyLimit: 5,  // Run up to 5 jobs simultaneously
  rateLimit: 100,       // Max 100 jobs per minute
  timeoutLimit: 30      // 30 second timeout
});

// Schedule a job
const result = await queue.schedule(async () => {
  // Your async work here
  return 'Done!';
});

console.log(result.result);         // 'Done!'
console.log(result.queueTime);      // Time spent waiting in queue (ms)
console.log(result.executionTime);  // Time spent executing (ms)

// Clean up
queue.dispose();
```

## API

- `new JobQueue(options?)` : Creates a new job queue.

### Options:

- `concurrencyLimit`: Max simultaneous jobs (default: 1000)
- `rateLimit`: Max jobs per minute (default: unlimited)
- `timeoutLimit`: Max seconds per job (default: 1200)

### Methods

- `schedule(fn, ...args)`: Schedule a job
- `size()`: Get queued job count
- `active()`: Get running job count
- `dispose()`: Clean up resources

## 🙋‍♀️ Developer
Andiswa Nombela
```
GitHub: https://github.com/Nombela95/
```
```
GitLab: https://gitlab.com/RomanNombela/
```
```
LinkedIn: https://www.linkedin.com/in/andiswa-nombela-64865a168/
```