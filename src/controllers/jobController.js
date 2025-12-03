const Postjob = require("../models/Execution");
const Jobs = require("../models/Jobs")
const { enqueueJob } = require("../queues/jobQueue");
const { default: mongoose } = require("mongoose");

// creating the job to process

const createJob = async(req, res) => {
    try {
        console.log(req.body);
        const job = new Jobs(req.body);
        const savedjob = await job.save();
        // once the job is validated and saved it is going to be added to the queue.
        await enqueueJob(savedjob)
        res.status(200).json({
            success: true,
            data: savedjob,
            message: "Job created and added to the queue successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getJob = async (req, res) => {
    try {
        const job = Jobs.find();
        res.status(200).json({
            success: true,
            data: job
        });

    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    createJob,
    getJob,
};
