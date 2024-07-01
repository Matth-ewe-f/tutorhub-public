export {}

import mongoose = require("mongoose");
import ViewSchema = require("./Views");

const ProfileSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    affiliation: {
        type: String,
        required: true,
    },
    graduationYear: {
        type: String,
        default: null,
    },
    department: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: null,
    },
    profilePicKey: {
        type: String,
        default: null,
    },
    views: {
        type: [ViewSchema],
        default: []
    },
    availability: {
        type: [Number],
        default: []
    },
    courseBookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CoursePost',
        default: null
    }],
    activityBookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ActivityPost',
        default: null
    }]
  });
const Profile = mongoose.model("Profile", ProfileSchema);

export = Profile;