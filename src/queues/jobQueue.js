import { Queue } from "bullmq";
const connection = require("../config/redisdb");

const jobQueue = new Queue("jobQueue", connection);

const addJobToQueue = async () => {
    
}