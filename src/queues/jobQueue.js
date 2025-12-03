import { Queue } from "bullmq";
import IORedis from "ioredis";
const connection = require("../config/redisdb");

// created the queue
const jobQueue = new Queue("jobQueue", {connection});

// now adding the jobs to the queue, jobDetails will get the savedJob
async function enqueueJob(jobdet) {
    await jobQueue.add("execute-job", {
        id: jobdet._id,
        name: jobdet.name,
        description: jobdet.description,
        jobType: jobdet.jobType,
        schedulingConfig: jobdet.schedulingConfig,
        retryPolicy: jobdet.retryPolicy,
        webhookUrl: jobdet.webhookUrl,
        status: jobdet.status,
    }, {

        attempts: jobdet.retryPolicy?.maxAttempts || 1,
        backoff: {
            type: jobdet.retryPolicy?.backoffStratefy || "exponential",
            delay: jobdet.retryPolicy?.backoffDelay || 1000
    },
    });
    console.log(`Job Id: ${jobdet._id} enqueued!!`);
}



module.exports = {jobQueue, enqueueJob};