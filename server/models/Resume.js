const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      website: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      summary: { type: String, default: '' }
    },
    education: [
      {
        institution: { type: String, default: '' },
        degree: { type: String, default: '' },
        fieldOfStudy: { type: String, default: '' },
        startYear: { type: String, default: '' },
        endYear: { type: String, default: '' },
        grade: { type: String, default: '' }
      }
    ],
    experience: [
      {
        company: { type: String, default: '' },
        role: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' }
      }
    ],
    projects: [
      {
        title: { type: String, default: '' },
        techStack: { type: [String], default: [] },
        description: { type: String, default: '' },
        liveLink: { type: String, default: '' },
        githubLink: { type: String, default: '' }
      }
    ],
    skills: {
      technical: { type: [String], default: [] },
      frameworks: { type: [String], default: [] },
      tools: { type: [String], default: [] },
      softSkills: { type: [String], default: [] }
    },
    certifications: [
      {
        name: { type: String, default: '' },
        issuer: { type: String, default: '' },
        issueDate: { type: String, default: '' },
        credentialUrl: { type: String, default: '' }
      }
    ],
    template: {
      type: String,
      enum: ['modern', 'minimal', 'tech', 'executive'],
      default: 'modern'
    },
    atsScore: {
      type: Number,
      default: 0
    },
    atsFeedback: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
