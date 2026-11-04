const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true,
      default: 'Full Stack Developer'
    },
    difficulty: {
      type: String,
      enum: ['Junior', 'Mid', 'Senior'],
      default: 'Mid'
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress'
    },
    questions: [
      {
        questionIndex: Number,
        questionText: String,
        category: String,
        expectedKeywords: [String],
        candidateAnswer: { type: String, default: '' },
        codeSnippet: { type: String, default: '' },
        evaluation: {
          score: { type: Number, default: 0 },
          accuracy: { type: Number, default: 0 },
          clarity: { type: Number, default: 0 },
          depth: { type: Number, default: 0 },
          strengths: String,
          improvements: String,
          modelAnswer: String
        },
        answeredAt: Date
      }
    ],
    totalScore: {
      type: Number,
      default: 0
    },
    overallFeedback: {
      type: String,
      default: ''
    },
    topStrengths: {
      type: [String],
      default: []
    },
    keyRecommendations: {
      type: [String],
      default: []
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    recordingUrl: {
      type: String,
      default: ''
    },
    recordingDuration: {
      type: Number,
      default: 0
    },
    recordingMimeType: {
      type: String,
      default: 'video/webm'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
