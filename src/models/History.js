const mongoose = require("mongoose");
const HistorySchema = new mongoose.Schema({
    bullJobId: String,
    state: String,
    result: Object,
    failedReason: String,
    processedOn: Date,
    finishedOn: Date,
    duration: Number
}, { timestamps: true });

module.exports = HistorySchema;