const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all active jobs with search & filters
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const { search, location, jobType, experienceLevel, status = 'active' } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    const jobs = await Job.find(query)
      .populate('recruiter', 'name email companyName companyWebsite avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job details
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name email companyName companyWebsite avatar');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter & Admin)
exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      jobType,
      experienceLevel,
      salaryRange,
      description,
      requirements,
      responsibilities,
      skills,
      deadline
    } = req.body;

    const job = await Job.create({
      title,
      company: company || req.user.companyName || 'Tech Enterprise',
      recruiter: req.user.id,
      location,
      jobType,
      experienceLevel,
      salaryRange,
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split('\n').filter(Boolean) : []),
      responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? responsibilities.split('\n').filter(Boolean) : []),
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      deadline
    });

    res.status(201).json({
      success: true,
      job
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update existing job posting
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter owner or Admin)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job listing' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      job
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter owner or Admin)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job listing' });
    }

    await job.deleteOne();
    // Also remove associated applications
    await Application.deleteMany({ job: req.params.id });

    res.json({
      success: true,
      message: 'Job and associated applications deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get jobs posted by current recruiter
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter)
exports.getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });

    // Attach current application count dynamically
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicantsCount: count
        };
      })
    );

    res.json({
      success: true,
      jobs: jobsWithCounts
    });
  } catch (err) {
    next(err);
  }
};
