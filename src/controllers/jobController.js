const Postjob = require("../models/Execution");
const Jobs = require("../models/Jobs")
const { default: mongoose } = require("mongoose");

// creating the job to process

const createJob = async(req, res) => {
    try {
        console.log(req.body);
        const job = new Jobs(req.body);
        const savejob = await job.save();
        res.status(200).json({
            success: true,
            data: savejob
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
