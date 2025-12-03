import { Worker } from "bullmq";
import IORedis from "ioredis";
const connection = require("../config/redisdb");
const jobQueue = require("../queues/jobQueue");
const Postjob = require("../models/Execution");

const jobProcessor = new Worker("jobQueue", async job => {



},{connection});
