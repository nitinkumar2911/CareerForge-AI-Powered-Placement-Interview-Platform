const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      type: String,
      required: true,
      default: 'Remote'
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'],
      default: 'Full-time'
    },
    experienceLevel: {
      type: String,
      enum: ['Internship', 'Entry Level', 'Mid Level', 'Senior Level'],
      default: 'Entry Level'
    },
    salaryRange: {
      type: String,
      default: 'Competitive'
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description']
    },
    requirements: {
      type: [String],
      default: []
    },
    responsibilities: {
      type: [String],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    applicantsCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active'
    },
    deadline: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
