const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const InterviewSession = require('../models/InterviewSession');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Student)
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This job posting is no longer active' });
    }

    // Check if student already applied
    const existingApp = await Application.findOne({ job: jobId, student: req.user.id });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this position'
      });
    }

    // Locate student's resume
    const resume = await Resume.findOne({ student: req.user.id });

    // Locate student's highest / latest completed interview session with video recording prioritized
    let latestInterview = await InterviewSession.findOne({
      student: req.user.id,
      status: 'completed',
      recordingUrl: { $exists: true, $ne: '' }
    }).sort({ createdAt: -1 });

    if (!latestInterview) {
      latestInterview = await InterviewSession.findOne({
        student: req.user.id,
        status: 'completed'
      }).sort({ totalScore: -1 });
    }

    const application = await Application.create({
      job: jobId,
      student: req.user.id,
      recruiter: job.recruiter,
      resume: resume ? resume._id : undefined,
      interviewSession: latestInterview ? latestInterview._id : undefined,
      interviewRecordingUrl: latestInterview?.recordingUrl || '',
      coverLetter: coverLetter || '',
      status: 'Applied'
    });

    // Increment applicantsCount on Job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully with interview profile attached',
      application
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applications submitted by logged-in student
// @route   GET /api/applications/my-applications
// @access  Private (Student)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('job', 'title company location jobType salaryRange status')
      .populate('interviewSession', 'totalScore role difficulty recordingUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applications for a specific job posting
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter / Admin)
exports.getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Verify recruiter owns job (or is admin)
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view these applicants' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('student', 'name email title college graduationYear cgpa skills avatar githubUrl linkedinUrl')
      .populate('resume')
      .populate('interviewSession', 'role difficulty totalScore topStrengths overallFeedback recordingUrl recordingDuration questions createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobTitle: job.title,
      company: job.company,
      count: applications.length,
      applications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status & feedback
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter / Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this application' });
    }

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (err) {
    next(err);
  }
};
