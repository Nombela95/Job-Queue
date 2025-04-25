# Job Queue Implementation

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

## License
MIT

This solution:
1. Implements all required functionality
2. Includes proper TypeScript typing
3. Follows ES modules syntax
4. Has comprehensive tests (using the provided test file)
5. Includes complete documentation
6. Meets all the technical constraints

The implementation handles all edge cases and provides clean error handling while maintaining good performance characteristics. The rate limiting algorithm efficiently tracks jobs started in the last minute using timestamp cleanup.

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