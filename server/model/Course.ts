export {}

const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    courseTitle: {
      type: String,
      required: true,
    },
    courseNumber: {
        type: String,
        required: true,
        unique: true,
    },
    courseDepartment: [{
        type: String,
        required: true,
    }]
  });

const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;