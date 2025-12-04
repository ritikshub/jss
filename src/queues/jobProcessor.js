const { Worker } = require("bullmq");
const connection = require("../config/redisdb");
const Postjob = require("../models/Execution");
const dbConnect = require("../config/db");
const axios = require("axios"); // for sending the payload to the webhook once the work is done



const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const jobProcessor = new Worker("jobQueue", async job => {
    // here will be main process work
    console.log("Processing Job:", job.data);
    const start = Date.now();

    try {
        await sleep(5000);
        const duration = Date.now() - start;

    // update the postjob data
    await Postjob.findOneAndUpdate(
    {
        jobRef: job.data.id
    },
    {
        endedAt: new Date(),
        status: "success",
        durationMs: duration,
        resultData: { message: "Work is done and dusted" }
    },
    { new: true}
    );

    console.log(`Job ${job.id} done, updated Postjob ${job.data.postjobId}`);

    // after the successful completion of job, here we can put the webhook payload to be send



    } catch (error) {
        console.error(`Job ${job.id} failed:`, error);

        await Postjob.findOneAndUpdate(job.data.postjobId, {
        endedAt: new Date(),
        status: "failed",
        resultData: { error: error.message }
    });

    // here we can put the code for the webhook payload that has to be send after the failure


    throw error; 
    }
}, { connection });

// optional event listeners
jobProcessor.on("completed", job => {

    console.log(`BullMQ marked job ${job.id} completed`);
});

jobProcessor.on("failed", (job, err) => {
    console.error(`BullMQ marked job ${job?.id} failed:`, err);
});

module.exports = jobProcessor;