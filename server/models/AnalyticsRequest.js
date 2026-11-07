const mongoose = require('mongoose');

const analyticsRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requesterName: {
      type: String,
      required: true
    },
    requesterEmail: {
      type: String,
      required: true
    },
    requesterRole: {
      type: String,
      enum: ['student', 'recruiter'],
      required: true
    },
    organization: {
      type: String,
      default: ''
    },
    purpose: {
      type: String,
      required: [true, 'Please provide a reason or purpose for accessing analytics']
    },
    status: {
      type: String,
      enum: ['pending', 'shared', 'rejected'],
      default: 'pending'
    },
    sharedAt: {
      type: Date
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    producerNotes: {
      type: String,
      default: ''
    },
    snapshotData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalyticsRequest', analyticsRequestSchema);
