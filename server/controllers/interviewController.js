const path = require('path');
const fs = require('fs');
const multer = require('multer');
const InterviewSession = require('../models/InterviewSession');
const Application = require('../models/Application');

// Multer storage configuration for interview video recordings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'interviews');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `interview_${req.params.id || 'rec'}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB max video size
});

exports.uploadMiddleware = upload.single('recording');

// @desc    Initialize a new AI interview session
// @route   POST /api/interviews
// @access  Private (Student)
exports.createSession = async (req, res, next) => {
  try {
    const { role = 'Full Stack Developer', difficulty = 'Mid' } = req.body;

    const session = await InterviewSession.create({
      student: req.user.id,
      role,
      difficulty,
      status: 'in_progress',
      questions: []
    });

    res.status(201).json({
      success: true,
      session
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get interview session details
// @route   GET /api/interviews/:id
// @access  Private
exports.getSessionById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id)
      .populate('student', 'name email college avatar');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    // Ensure only the student owner, recruiters, or admin can view
    if (
      session.student._id.toString() !== req.user.id &&
      req.user.role !== 'recruiter' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this interview report' });
    }

    res.json({
      success: true,
      session
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload recorded interview video and audio
// @route   POST /api/interviews/:id/recording
// @access  Private (Student)
exports.uploadRecording = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { durationSeconds } = req.body;

    const session = await InterviewSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (session.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to upload recording for this session' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video recording file provided' });
    }

    const relativeUrl = `/uploads/interviews/${req.file.filename}`;
    session.recordingUrl = relativeUrl;
    if (durationSeconds) {
      session.recordingDuration = Number(durationSeconds) || session.durationSeconds || 0;
    }
    session.recordingMimeType = req.file.mimetype || 'video/webm';
    await session.save();

    // Automatically update student's submitted applications so recruiters immediately get this interview video!
    await Application.updateMany(
      { student: req.user.id },
      { $set: { interviewSession: session._id, interviewRecordingUrl: relativeUrl } }
    );

    res.json({
      success: true,
      message: 'Interview recording uploaded successfully and attached to candidate profile',
      recordingUrl: relativeUrl,
      recordingDuration: session.recordingDuration,
      session
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all interview sessions for current student
// @route   GET /api/interviews/my-sessions
// @access  Private (Student)
exports.getMySessions = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ student: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all platform interview sessions (Admin)
// @route   GET /api/interviews/admin/all
// @access  Private (Admin)
exports.getAllSessions = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find()
      .populate('student', 'name email college')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (err) {
    next(err);
  }
};
