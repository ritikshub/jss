const { Queue } = require("bullmq");
const connection = require("../config/redisdb"); // your redis config

    (async () => {
    const jobQueue = new Queue("jobQueue", { connection });

    const repeatables = await jobQueue.getRepeatableJobs();
    console.log("Repeatables before cleanup:", repeatables);

    for (const r of repeatables) {
        await jobQueue.removeRepeatableByKey(r.key);
        console.log(`Removed repeatable job: ${r.key}`);
    }

    const after = await jobQueue.getRepeatableJobs();
    console.log("Repeatables after cleanup:", after);

    process.exit(0);
})();
