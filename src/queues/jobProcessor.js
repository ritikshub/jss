const { Worker } = require("bullmq");
const connection = require("../config/redisdb");
const Postjob = require("../models/Execution");
const dbConnect = require("../config/db");
const axios = require("axios"); // for sending the payload to the webhook once the work is done

// ---------------function to save the updated job data to the database -------------
async function logJobResult(postJobId, status, durationMs, resultDetails) {
    const update = {
        endedAt: new Date(),
        status,
        durationMs,
        resultData: resultDetails
    };

    const historyEntry = {
        timestamp: new Date(),
        event: status === "success" ? "Execution completed" : "Execution failed",
        details: resultDetails
    };

    const updatedPostJob = await Postjob.findByIdAndUpdate(
        postJobId,
        {
        $set: update,   
        $push: { history: historyEntry }  
        },
        { new: true }
    );
}


//  ------ -------------the processor logic here that worker will use----------
async function executeWebhookJob(job) {
    const { mongoJobId, postJobId, webhookUrl, name, webhookPayload } = job.data;

    const fullPayload = {
        ...webhookPayload,
        job_id: mongoJobId,
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
            await logJobResult(postJobId, "success", duration, {
                status: response.status,
                data: response.data
            });
        console.log(`Job ${mongoJobId}: Webhook successful (Status: ${response.status})`);

        return { status: "DELIVERED", httpStatus: response.status };
        } else {
            throw new Error(`Webhook failed with non-2xx status code: ${response.status}`);
        }

    } catch (error) {
        const duration = Date.now() - start;
        let errorMessage = error.message;
        const statusCode = error.response ? error.response.status : null; 
        
        //log the failure to the database:
        await logJobResult(postJobIdid, "failed", duration, {
            error: errorMessage,
            status: statusCode
        });
        console.error(`Job ${mongoJobIdid} failed: ${errorMessage} (Status: ${statusCode})`);
        
        //dead letter queue
        if (job.attemptsMade >= job.opts.attempts) {
            await deadLetterQueue.add("deadLetterJob", {
                originalJobId: mongoJobId,
                postJobId,
                data: job.data,
                failedReason: error.message,
                stacktrace: job.stacktrace
            });
            console.log(`Job ${mongoJobId} moved to Dead Letter Queue`);
        }
        throw error;  
    }
}

// -------------main worker function--------------------------------------------
const jobProcessor = new Worker("jobQueue", executeWebhookJob, {
    connection,
    concurrency: 5,
    autorun: true,
});

// ---------------------event listener ---------------------------
jobProcessor.on("completed", async (job, result) => {
    console.log(`BullMQ marked job ${job.id} completed`, result);
});

jobProcessor.on("failed", async (job, err) => {
    console.error(`BullMQ marked job ${job.id} failed: ${err.message}`);
});

jobProcessor.on("error", (err) => {
    console.error("Worker error:", err);
});

module.exports = jobProcessor;