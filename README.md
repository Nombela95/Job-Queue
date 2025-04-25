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
```
1. git clone https://github.com/Nombela95/Job-Queue

2. npm install
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