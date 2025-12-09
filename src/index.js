const express = require("express");
const dbConnect = require("../src/config/db");
const routes = require("../src/routes/routes");

// bull-board v6 imports
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { createBullBoard } = require("@bull-board/api");
const { ExpressAdapter } = require("@bull-board/express");

//importing the jobQueue that will queue the job to process
const { jobQueue } = require("../src/queues/jobQueue");

// importing the worker
require("../src/queues/jobProcessor");

const app = express();
dbConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// bull-board setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
    queues: [new BullMQAdapter(jobQueue)],
    serverAdapter,
    options: {
        uiConfig: { boardTitle: "My Job Queues" }
    }
});

app.use("/admin/queues", serverAdapter.getRouter());

// routes
app.get("/", (req, res) => {
    res.json({
        message: "Hi, Daman!!",
        routes: "Below are the routes that works now",
        links: {
            to_get_all_job: "https://unvizored-pettishly-wynona.ngrok-free.dev/api/jobs",
            to_get_a_job: "https://unvizored-pettishly-wynona.ngrok-free.dev/api/jobs/:id",
            to_create_a_job: "https://unvizored-pettishly-wynona.ngrok-free.dev/api/job",
            to_delete_a_job: "https://unvizored-pettishly-wynona.ngrok-free.dev/api/job/:id",
            queue_dashboard: "https://unvizored-pettishly-wynona.ngrok-free.dev/admin/queues/queue/jobQueue?status=completed",
            format: {
                message: {

                        "name": "Weekend Cleanup Job",
                        "description": "Performs system cleanup every Sunday at 2 AM.",
                        "jobType": "webhook",
                        "schedulingConfig": {
                            "scheduleType": "recurring",
                            "cronExpression": "0 2 * * SUN"
                        },
                        "retryPolicy": {
                            "maxAttempts": 4,
                            "backoffStratefy": "exponential",
                            "backoffDelay": 4000
                        },
                        "webhookUrl": "https://webhook.site/132a9f11-3b17-47a2-90fb-471ba43f0d0c",
                        "status": "active"
                        }
            }

        }
    });
});
app.use("/", routes);

// start server
app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000/");
    console.log("Bull-board at http://localhost:3000/admin/queues");
});