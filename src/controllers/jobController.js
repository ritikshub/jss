const Postjob = require("../models/Execution");
const Jobs = require("../models/Jobs");
const { Job } = require("../queues/jobProcessor");
const { enqueueJob, jobQueue } = require("../queues/jobQueue");
const { default: mongoose } = require("mongoose");

// ----------------------- creating the job to process---------------------------------------
const createJob = async(req, res) => {
    try {
        const job = new Jobs(req.body);
        const savedjob = await job.save();
        // once the job is validated and saved it is going to be added to the queue.
        await enqueueJob(savedjob)
        res.status(201).json({
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

// ------------------------------getting job from the database----------------------------------
const getJob = async (req, res) => {
    try {
        const jobs =  await Jobs.find().lean();
        res.status(200).json({
            success: true,
            data: jobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


//----------------------------- getting execution history of all the job in the queue---------------------------------

const jobHistory = async (req, res) => {
    try {
        const jobs = await jobQueue.getJobs(
            ["completed", "active", "waiting", "failed", "delayed"],
            0, 50 // pagination thing
        );
        const history = await Promise.all(
            jobs.map(async j => ({
                id: j.id,
                name: j.name,
                state: await j.getState(),
                attemptsMade: j.attemptsMade,
                processedOn: j.processedOn,
                finishedOn: j.finishedOn

            }))
        );
        res.json({
            success: true, history
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    };
};
// --------------getting a job by id-----------------------------------------
const jobById = async (req, res) => {
    try {
        const { id } = req.params; // Mongo Job _id from route param
        const job = await Jobs.findById(id).lean();

        if (!job) {
        return res.status(404).json({
            success: false,
            message: `Job with id ${id} not found`
        });
        }

        res.status(200).json({
        success: true,
        data: job
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: error.message
        });
    }
};

// ---------------------------------patching a job ------------------------------------
const patchJob = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // updating the existing job 
        const existingJob = await Jobs.findById(id);
        console.log(existingJob);
        if (!existingJob) {
            return res.status(404).json({ success: false, message: "Job not found"});
        }
        if (existingJob.schedulingConfig?.cronExpression) {
            await jobQueue.removeRepeatable(existingJob.name, {
                cron: existingJob.schedulingConfig.cronExpression
            });
        }

        const updateJob = await Jobs.findByIdAndUpdate(id, { $set: updates }, {
            new: true,
            runValidators: true
        });
        // Re enque with the new data
        await enqueueJob(updateJob);
        res.status(200).json({
            success: true,
            data: updateJob
        });

    }catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
// -----------------------getting history of one time job-------------------------
const executionHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await jobQueue.getJob(id);

        if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job Not Found"
        });
        }
        return res.status(200).json({
        success: true,
        job: {
            id: job.id,
            name: job.name,
            data: job.data,
            state: await job.getState(),
            attemptsMade: job.attemptsMade,
            returnvalue: job.returnvalue,
            stacktrace: job.stacktrace,
            timestamp: job.timestamp,
            finishedOn: job.finishedOn,
            processedOn: job.processedOn
        }
        });

    } catch (error) {
        console.error("Execution History Error", error);
        return res.status(500).json({
        success: false,
        message: error.message
        });
    }
};

// ----------Pausing the job queue --------------------------------
const pauseQueue = async (req, res) => {
    try {
        await jobQueue.pause();
        return res.status(200).json({
        success: true,
        message: "Queue paused successfully"
        });
    } catch (error) {
        return res.status(500).json({
        success: false,
        message: error.message
        });
    }
};

//------------- Resuming the job queue ------------------------------
const resumeQueue = async (req, res) => {
    try {
        await jobQueue.resume();
        return res.status(200).json({
        success: true,
        message: "Queue resumed successfully"
        });
    } catch (error) {
        return res.status(500).json({
        success: false,
        message: error.message
        });
    }
};
// ------------------deleting a job from the queue---------------------------
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await jobQueue.getJob(id);
        if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job Not Found"
        });
        }

        await job.remove(); // ✅ built-in BullMQ function

        return res.status(200).json({
        success: true,
        message: `Job ${id} deleted successfully`
        });
    } catch (error) {
        console.error("Delete Job Error", error);
        return res.status(500).json({
        success: false,
        message: error.message
        });
    }
};
// -------------------deleting a Repeatable Job from the queue-------------------------
const deleteRepeatableJob = async (req, res) => {
    try {
        const { key } = req.params; // e.g. "repeat:hash:timestamp"

        await jobQueue.removeRepeatableByKey(key); // ✅ built-in BullMQ function

        return res.status(200).json({
        success: true,
        message: `Repeatable job ${key} deleted successfully`
        });
    } catch (error) {
        console.error("Delete Repeatable Job Error", error);
        return res.status(500).json({
        success: false,
        message: error.message
        });
    }
};



const getJobExecutions = async (req, res) => {
    try {
        const { id } = req.params;

        // Find all executions tied to this job
        const executions = await Postjob.find({ jobRef: id })
        .sort({ startedAt: -1 }) // newest first
        .lean();

        if (!executions || executions.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No executions found for this job"
        });
        }

        return res.status(200).json({
        success: true,
        jobId: id,
        executions
        });
    } catch (error) {
        return res.status(500).json({
        success: false,
        message: error.message
        });
    }
};

module.exports = { getJobExecutions };






module.exports = {
    createJob,
    getJob,
    jobById,
    deleteJob,
    deleteRepeatableJob,
    jobHistory,
    patchJob,
    executionHistory,
    resumeQueue,
    pauseQueue,
    getJobExecutions
};
