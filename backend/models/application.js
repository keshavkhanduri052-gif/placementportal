const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        studentName: {
            type: String,
            required: true
        },
        studentEmail: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true
        },
        location: {
            type: String,
            default: "Not specified"
        },
        applicationLink: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Application", applicationSchema);