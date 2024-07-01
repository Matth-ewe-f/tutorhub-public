export {}

const mongoose = require('mongoose');
const {Schema} = require('mongoose');
import ViewSchema = require("./Views");

const PostReview = require("../model/PostReview.ts");
const PostReviewSchema = PostReview.schema;

const CoursePostSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
    },
    userFirstName: {
        type: String,
        required: true,
    },
    userLastName: {
        type: String,
        required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    courseNumber: {
        type: String,
        default: null,
    },
    courseDepartment: { //essentially courseTags
        type: [String],
        default: null,
    },
    gradeReceived: {
        type: String,
        default: null,
    },
    semesterTaken: {
        type: String,
        default: null,
    },
    professorTakenWith: {
        type: String,
        default: null,
    },
    takenAtHopkins: {
        type: Boolean,
        required: true,
    },
    schoolTakenAt: {
        type: String,
        default: null
    },
    reviews: {
        type: [PostReviewSchema],
        default: []
    },
    views: {
        type: [ViewSchema],
        default: []
    }
});

const CoursePost = mongoose.model("CoursePost", CoursePostSchema);

module.exports = CoursePost;
