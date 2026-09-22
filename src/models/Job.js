const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, trim: true },
    location: { type: String, trim: true },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'internship'],
      default: 'full_time',
    },
    description: { type: String },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    isOpen: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
