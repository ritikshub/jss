const mongoose = require("mongoose");
const jobSchema =  new mongoose. Schema({
    name: {
        type: String,
        minlength: 3,
        required: [true, "You need a name to identify the job"],

    },
    description: {
        type: String,

    },
    startedAt: {
        type: Date,
        required: true,
        index: true,
    },
    endedAt: {
        type: Date,
    },
    status: {
        type: String,
        required: true,
        index: true,
        enum: {
            values: ["success", "failed", "timeout"],
            message: "based on the job details it will fetch the values"
        }
    },
    resultData: {
        tupe: mongoose.Schema.Types.Mixed,
    },
    retryAttempts: {
        type: Number,
        default: 0,
        min: 0,

    },
    durationMs: {
        type: Number,
        
    },
    timestamps: true,


});

module.exports = mongoose.model("Job", jobSchema);


