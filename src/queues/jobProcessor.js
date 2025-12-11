const { Worker } = require("bullmq");
const connection = require("../config/redisdb");
const Postjob = require("../models/Execution");
const dbConnect = require("../config/db");
const axios = require("axios"); // for sending the payload to the webhook once the work is done

// ---------------function to save the updated job data to the database -------------
async function logJobResult(jobId, status, durationMs, resultDetails) {
    const update = {
        endedAt: new Date(),
        status: status,
        durationMs: durationMs,
        resultData: resultDetails,
    };

    const updatedPostJob = await Postjob.findOneAndUpdate(
        { jobRef: jobId }, update, { new: true } 
    );
}

//  ------ the processor logic here that worker will use----------
async function executeWebhookJob(job) {
    const { id, webhookUrl, name, executionData } = job.data;

    const fullPayload = {
        job_id: id,
        attempt: job.attemptsMade + 1,
        action_type: name,
        worker_timestamp: new Date().toISOString(),

    };

    const start = Date.now();

    try {
        const response = await axios.post(webhookUrl, fullPayload, {
            headers: { "Content-Type": "application/json" }
        });
        const duration = Date.now() - start;

        if(response.status >= 200 && response.status <300) {
            //logging the result to the mongo
            await logJobResult(id, "success", duration, {
                status: response.status,
                data: response.data
            });
        

        console.log(`Job ${id}: Webhook successful (Status: ${response.status})`);

        return { status: "DELIVERED", httpStatus: response.status };
        } else {
            throw new Error(`Webhook failed with non-2xx status code: ${response.status}`);
        }

    } catch (error) {
        const duration = Date.now() - start;
        let errorMessage = error.message;

        //log the failure to the database:
        await logJobResult(id, "failed", duration, {
            error: errorMessage,
            status: error.response.status
        });
        throw new Error(errorMessage);
    }
}
// -------------main worker function--------------------------------------------
const jobProcessor = new Worker("jobQueue", executeWebhookJob, {
    connection,
    concurrency: 5,
    autorun: true,
    removeOnComplete: true,
});


// -------------event listner in case of job completed---------------------------
jobProcessor.on("completed", job => {
    console.log(`BullMQ marked job ${job.id} completed`);
});

// ---------------------event listener in case of job failed-------------------
jobProcessor.on("failed", (job, err) => {
    console.error(`BullMQ marked job ${job?.id} failed:`, err);
});

module.exports = jobProcessor;