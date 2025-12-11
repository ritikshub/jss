# Job Queue System

A Node.js backend service for managing jobs with **MongoDB (Mongoose)** and **BullMQ**.  
Jobs are defined and validated via Mongoose schemas, stored in MongoDB, and then enqueued into a Redis-backed BullMQ queue for execution.  
Execution logs are tracked in a separate `Postjob` schema for auditing.

---

## 🚀 Features
- **Job definition** (`Job` schema) with scheduling config (`recurring` via cron or `onetime` via date).
- **Execution logging** (`Postjob` schema) with start/end times, status, retries, and duration.
- **Queue integration** using BullMQ with Redis.
- **Worker** that consumes jobs, prints details, simulates work (sleep 5s), and updates execution logs.
- **Retry policy** with configurable attempts and backoff strategies.

# BullMq Cheat Sheet
await queue.add('jobName', { ...data }, {

  /* ------------------------ Core Options ------------------------ */

  jobId: 'logical-id-123',      // Custom job ID (useful for de-duplication)
  priority: 1,                  // Lower number = higher priority (1 is highest)
  delay: 5000,                  // Delay before first execution (in ms)
  lifo: false,                  // true = add to end (LIFO)
  attempts: 3,                  // Total attempts: 1 initial + retries

  backoff: {                    // Backoff strategy for retries
    type: 'fixed' | 'exponential' | 'customName',
    delay: 2000                 // Backoff duration
  },

  /* ------------------------ Repeat / Scheduler ------------------------ */

  repeat: {
    every: 60000,               // Run every X ms
    cron: '*/10 * * * * *',     // Or provide a cron expression
    limit: 100,                 // Max total runs
    jobId: 'scheduler-123',     // Stable job identity for scheduler
    startDate: new Date(),      // Optional start time
    endDate: new Date(),        // Optional end time
    tz: 'Asia/Kolkata'          // Timezone
  },

  /* ------------------------ Cleanup Behavior ------------------------ */

  removeOnComplete: true | number,  // Auto-remove job when done (or keep last N)
  removeOnFail: false | number,     // Auto-remove on failure

  /* ------------------------ Misc Options ------------------------ */

  timeout: 30000,               // Max processing time before forced failure
  attemptsMade: 0,              // Internal use
});
