const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");
const { jobScheduler } = require("../queues/jobProcessor");


// getting the job details by id
router.get("/api/jobs/:id",jobController.jobById);

// getting all the jobs
router.get("/api/jobs", jobController.getJob);

// adding job to the database
router.post("/api/jobs", jobController.createJob);

// deleting a job from the database:
router.delete("/api/jobs/:id", jobController.deleteJob);

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
router.get("/api/executions/:id", jobController.executionHistory);

router.get("/api/jobs/:id/executions", jobController.getJobExecutions);

module.exports = router;
