const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    eligibility: {
      type: String,
      default: '',
    },
    entranceExams: {
      type: [String],
      default: [],
    },
    careerPaths: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for query speed
courseSchema.index({ category: 1 });

module.exports = mongoose.model('Course', courseSchema);
