const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'recruiter'],
      default: 'student'
    },
    college: {
      type: String,
      default: ''
    },
    companyName: {
      type: String,
      default: ''
    },
    hashedOtp: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 5
    },
    otpExpires: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000)
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Auto-expire documents after 15 minutes
pendingRegistrationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);
