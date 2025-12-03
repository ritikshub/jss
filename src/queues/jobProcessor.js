const { Worker } = require("bullmq");
const connection = require("../config/redisdb");
const Postjob = require("../models/Execution");
const dbConnect = require("../config/db");



const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const jobProcessor = new Worker("jobQueue", async job => {
    console.log("Processing Job:", job.data);
    const start = Date.now();

    try {
        await sleep(5000);
        const duration = Date.now() - start;

    // update the postjob data
    await Postjob.findByIdAndUpdate(job.data.postjobId, {
        endedAt: new Date(),
        status: "success",
        durationMs: duration,
        resultData: { message: "Webhook work is done and dusted" }
    });

    console.log(`Job ${job.id} done, updated Postjob ${job.data.postjobId}`);
    } catch (error) {
        console.error(`Job ${job.id} failed:`, error);

        await Postjob.findByIdAndUpdate(job.data.postjobId, {
        endedAt: new Date(),
        status: "failed",
        resultData: { error: error.message }
    });

    throw error; // rethrow so BullMQ marks job failed
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