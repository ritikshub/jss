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
