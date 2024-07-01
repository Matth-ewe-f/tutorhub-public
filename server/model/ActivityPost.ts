export {}

const mongoose = require('mongoose');
const PostReview = require("../model/PostReview.ts");
const PostReviewSchema = PostReview.schema;
import ViewSchema = require("./Views");

const ActivityPostSchema = new mongoose.Schema({
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
    activityTitle: {
      type: String,
      required: true,
    },
    activityDescription: {
      type: String,
      default: null,
    },
    activityPostPicKey: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    tags: {
      type: [String],
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

const ActivityPost = mongoose.model("ActivityPost", ActivityPostSchema);

module.exports = ActivityPost;
