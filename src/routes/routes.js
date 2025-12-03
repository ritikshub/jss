const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");


// getting the job details by id
router.get("/api/jobs/:id",jobController.getJob);
// getting all the jobs

router.get("/api/jobs", jobController.getJob);

// adding job to the database

router.post("/api/job", jobController.createJob);

module.exports = router;
