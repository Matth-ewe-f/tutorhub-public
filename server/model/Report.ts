export {}

import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
    reporterId: {
        type: String,
        required: true,
    },
    reporterName: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    reporteeId: {
        type: String,
        required: true,
    },
    reporteeName: {
        type: String,
        required: true,
    },
    resolved: {
        type: Boolean,
    },
})

const Report = mongoose.model("Report", ReportSchema);

module.exports = Report;