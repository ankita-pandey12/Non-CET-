const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }
);

// Indexes for faster aggregation
searchLogSchema.index({ timestamp: -1 });
searchLogSchema.index({ query: 1 });

module.exports = mongoose.model('SearchLog', searchLogSchema);
