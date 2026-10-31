const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    hashedOtp: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['login', 'register'],
      default: 'login'
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 5
    },
    expiresAt: {
      type: Date,
      required: true
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// TTL index to automatically remove expired OTP documents after 10 minutes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('Otp', otpSchema);
