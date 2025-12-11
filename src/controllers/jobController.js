const Postjob = require("../models/Execution");
const Jobs = require("../models/Jobs");
const { Job } = require("../queues/jobProcessor");
const { enqueueJob, jobQueue } = require("../queues/jobQueue");
const { default: mongoose } = require("mongoose");

// creating the job to process
const createJob = async(req, res) => {
    try {
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

// getting a job from the database
const getJob = async (req, res) => {
    try {
        const job =  await Jobs.find().lean();
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

// deleting a job from the database:
const deleteJob = async(req, res) => {
    try {
        const {id} = req.params;
        const deletedJob = await Jobs.findByIdAndDelete(id);

        if(!deletedJob) {
            return res.status(404).json({
                success: false,
                message: "Either Job Id is Wrong or Not Present in the Database"
            });
        }
        const deletedPostJob = await Postjob.findOneAndDelete({
            jobRef: id
        });
        res.status(200).json({
            success: true,
            message: "Job Deleted Successfully",
            job: deletedJob,
            postjob: deletedPostJob
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// getting execution history of all the job in the queue.

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
const executionHistory = async(req, res) => {
    try {
        const { id } = req.params;
        const getJobId = await jobQueue.findById(id);
        return res.status(200).json({
            success: true,
            getJobId

        })
        if (!getJobId) {
            return res.state(404).json({
                success: true,
                message: "Job Not Found"
            });
        }

    }catch (error) {
        console.error("Execution History Error", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}

module.exports = {
    createJob,
    getJob,
    deleteJob,
    jobHistory,
    patchJob,
    executionHistory
};
