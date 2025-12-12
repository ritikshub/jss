const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");
const { jobScheduler } = require("../queues/jobProcessor");


// listing job details by id
router.get("/api/jobs/:id",jobController.jobById);

// listing all the jobs
router.get("/api/jobs", jobController.getJob);

// craeting a job 
router.post("/api/jobs", jobController.createJob);

// deleting a repeatable job from the queue.
router.delete("/api/jobs/:key", jobController.deleteRepeatableJob)

//updating the job details
router.patch("/api/jobs/:id", jobController.patchJob);

// pausing the job of the queue
router.patch("/api/executions/pause", jobController.pauseQueue);

// resume the job of the queue
router.patch("/api/executions/resume", jobController.resumeQueue);

//getting the all executions
router.get("/api/executions", jobController.jobHistory);

//getting the single execution details
router.get("/api/jobs/:id/executions", jobController.getJobExecutions);

// get stats of the queue
router.get("/api/executions/stats", jobController.getQueueStats);

// get stats by id
router.get("/api/executions/:id", jobController.getJobStatsById)

module.exports = router;
