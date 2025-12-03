const express = require("express");
const dbConnect = require("../src/config/db");
const routes = require("../src/routes/routes");

// bull-board v6 imports
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { createBullBoard } = require("@bull-board/api");
const { ExpressAdapter } = require("@bull-board/express");
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
    res.send("Hello, there!!");
});
app.use("/", routes);

// start server
app.listen(3000, () => {
    console.log("okay, server is running!!");
    console.log("Bull-board at http://localhost:3000/admin/queues");
});