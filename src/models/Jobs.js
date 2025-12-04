const { CronExpression } = require("cron-parser");
const mongoose = require("mongoose");
const validator = require("validator");
const { parseExpression } = require("cron-parser");

const jobschema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Job name is required"],
        minLength: [3, "Name must be at least 3 characters"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        maxLength: [500, "Description too long"],

    },
    jobType: {
        type: String,
        required: [true, "Job type is required"],
        enum: ["webhook"],

    },
    schedulingConfig: {
        scheduleType: {
            type: String,
            required: [true, "Schedule type  is required"],
            enum: ["onetime", "recurring"],
        },
        cronExpression: {
            type: String,
            required: function(){
                return this.schedulingConfig && this.schedulingConfig.type === "recurring";
            },
            validate: {
                validator: function(v) {
                    if (this.schedulingConfig.type !== "recurring") return true;
                    try {
                        parseExpression(v);
                        return true;
                    } catch {
                        return false;
                    }
                }

            },
            message: props => `${props.value} is not a valid cron expression`
        },
        executionDate: {
            type: Date,
            required: function() {
                return this.schedulingConfig && this.schedulingConfig.type === "onetime";

            }
        }
    },
    retryPolicy: {
        maxAttempts: {
            type: Number,
            min: 0,
            max: 5,
            default: 1
        },
        backoffStratefy: {
            type: String,
            enum: ["exponential", "constant"],
            default: "exponential"
        },
        backoffDelay: {
            type: Number,
            min: 100,
            default: 1000

        }

    },
    webhookUrl: {
        type: String,
        required: function() {
            return this.jobType === "webhook";
        },
        validate: {
            validator: function(v) {
                return validator.isURL(v || "");

            },
            message: props => `${props.value} is not a valid URL`
        }
    },
    status: {
        type: String,
        enum: ["active", "paused", "deleted"],
        default: "active",
        index: true
    },
    lastRunAt: Date,
    nextRunAt: Date

},

{
    timestamps: true
});

module.exports = mongoose.model("Job", jobschema);