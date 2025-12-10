const { Queue } = require("bullmq");
const connection = require("../config/redisdb");
const Postjob = require("../models/Execution");

// created the queue
const jobQueue = new Queue("jobQueue", {connection});

// now adding the jobs to the queue, jobDetails will get the savedJob
async function enqueueJob(jobdet) {

    //creating a post job record tied to this job
    const postjob = await Postjob.create({
        jobRef: jobdet._id,
        startedAt: new Date(),
        status: "active"
    });
    
    // adding the job to the queue.
    await jobQueue.add("execute-job", {
        id: jobdet._id,
        name: jobdet.name,
        description: jobdet.description,
        jobType: jobdet.jobType,
        schedulingConfig: jobdet.schedulingConfig,
        retryPolicy: jobdet.retryPolicy,
        webhookUrl: jobdet.webhookUrl,
        status: jobdet.status,
    }, 
    {

        attempts: jobdet.retryPolicy?.maxAttempts || 1,
        backoff: {
            type: jobdet.retryPolicy?.backoffStratefy || "exponential",
            delay: jobdet.retryPolicy?.backoffDelay || 1000
        },
        repeat: jobdet.schedulingConfig?.cronExpression
        ? { cron: jobdet.schedulingConfig.cronExpression }
        : undefined
    });
    console.log(`Job Id: ${jobdet._id}: Added to the queue to be processed!!`);
}



module.exports = {jobQueue, enqueueJob};