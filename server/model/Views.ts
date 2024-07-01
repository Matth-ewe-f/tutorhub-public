import { ObjectId } from "mongodb";
import mongoose = require("mongoose")

const ViewSchema = new mongoose.Schema({
    viewerId: {
        type: ObjectId,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    durationInSeconds: {
        type: Number,
        required: true
    }
});

export = ViewSchema