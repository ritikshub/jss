const mongoose = require("mongoose");
const Job = require("../models/Jobs")
const HistorySchema = require("../models/History")
const postjob = new mongoose.Schema({
    jobRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true
    },
    startedAt: {
        type: Date,
        required: true,
        index: true
    },
    endedAt: {
        type: Date,
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["active","success", "failed", "timeout"],
            message: "Job is either success, failed or timeout"
        }
    },
    resultData: {
        type: mongoose.Schema.Types.Mixed
    },
    retryAttempts: {
        type: Number,
        default: 0,
        min: 0,
        max: 3
    },
    durationMs: {
        type: Number,
        min: 0
    },
    history: [HistorySchema]
},
{
    timestamps: true
});

module.exports = mongoose.model("Postjob", postjob);
