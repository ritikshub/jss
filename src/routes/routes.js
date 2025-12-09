const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");
const { jobScheduler } = require("../queues/jobProcessor");


// getting the job details by id
router.get("/api/jobs/:id",jobController.getJob);

// getting all the jobs
router.get("/api/jobs", jobController.getJob);

// adding job to the database
router.post("/api/job", jobController.createJob);

// deleting a job from the database:
router.delete("/api/job/:id", jobController.deleteJob);

//getting the history of the queue:
router.get("/api/executions", jobController.jobHistory)

module.exports = router;
