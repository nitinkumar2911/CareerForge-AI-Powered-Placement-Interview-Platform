const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    },
    interviewSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession'
    },
    interviewRecordingUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Applied', 'Reviewed', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'],
      default: 'Applied'
    },
    coverLetter: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Prevent duplicate application from same student for same job
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
