const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const InterviewSession = require('../models/InterviewSession');
const AnalyticsRequest = require('../models/AnalyticsRequest');
const {
  PRODUCER_EMAIL,
  notifyProducerOfAnalyticsRequest,
  sendAnalyticsDossierEmail
} = require('../services/emailService');

/**
 * Calculates 100% REAL platform analytics and placement figures dynamically from the database
 */
const getRealAnalyticsSnapshot = async () => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
  const totalJobs = await Job.countDocuments();
  const activeJobs = await Job.countDocuments({ status: 'active' });
  const totalApplications = await Application.countDocuments();
  const totalInterviews = await InterviewSession.countDocuments({ status: 'completed' });

  // 1. Real Placement Rate (from applications with 'Offered' status)
  const placedStudentIds = await Application.find({ status: 'Offered' }).distinct('student');
  const placedCount = placedStudentIds.length;

  let placementRate = '0%';
  if (totalStudents > 0) {
    const rate = Math.round((placedCount / totalStudents) * 100);
    placementRate = `${rate}%`;
  } else if (placedCount > 0) {
    placementRate = '100%';
  }

  // 2. Real Salary Calculations (from actual Jobs in the database)
  const allJobs = await Job.find({}).select('title company salaryRange skills');
  let minSalaries = [];
  let maxSalaries = [];
  let salaryCurrency = '₹';

  allJobs.forEach(job => {
    if (!job.salaryRange || job.salaryRange.toLowerCase().includes('competitive')) return;
    if (job.salaryRange.includes('$')) salaryCurrency = '$';

    const numbers = job.salaryRange
      .replace(/,/g, '')
      .match(/[\d.]+/g);

    if (numbers && numbers.length > 0) {
      const isLpa = /lpa/i.test(job.salaryRange);
      const parsed = numbers.map(n => {
        let val = parseFloat(n);
        if (isLpa && val < 100) {
          val = val * 100000;
        }
        return val;
      }).filter(n => !isNaN(n) && n > 0);

      if (parsed.length === 1) {
        minSalaries.push(parsed[0]);
        maxSalaries.push(parsed[0]);
      } else if (parsed.length >= 2) {
        minSalaries.push(Math.min(parsed[0], parsed[1]));
        maxSalaries.push(Math.max(parsed[0], parsed[1]));
      }
    }
  });

  const formatSalary = (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) return 'Not Disclosed';
    if (amount >= 100000) {
      const inLpa = (amount / 100000).toFixed(1);
      return `${salaryCurrency}${inLpa} LPA`;
    }
    return `${salaryCurrency}${Math.round(amount).toLocaleString('en-IN')}`;
  };

  let avgSalary = 'Not Disclosed';
  let highestSalary = 'Not Disclosed';

  if (maxSalaries.length > 0) {
    const highestVal = Math.max(...maxSalaries);
    const avgVal = (
      minSalaries.reduce((a, b) => a + b, 0) + maxSalaries.reduce((a, b) => a + b, 0)
    ) / (minSalaries.length + maxSalaries.length);

    avgSalary = formatSalary(avgVal);
    highestSalary = formatSalary(highestVal);
  }

  // 3. Real In-Demand Sectors & Skills (from real Job titles & skills created in app)
  const sectorMap = {};
  allJobs.forEach(job => {
    if (job.title) {
      let t = job.title.trim();
      t = t.charAt(0).toUpperCase() + t.slice(1);
      sectorMap[t] = (sectorMap[t] || 0) + 2;
    }
    (job.skills || []).forEach(s => {
      let sk = s.trim();
      if (sk) {
        sk = sk.charAt(0).toUpperCase() + sk.slice(1);
        sectorMap[sk] = (sectorMap[sk] || 0) + 1;
      }
    });
  });

  const totalPoints = Object.values(sectorMap).reduce((a, b) => a + b, 0) || 1;
  let topRecruitingSectors = Object.entries(sectorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, count]) => ({
      domain,
      share: `${Math.round((count / totalPoints) * 100)}%`
    }));

  if (topRecruitingSectors.length === 0) {
    topRecruitingSectors = [{ domain: 'Open Engineering Positions', share: '100%' }];
  }

  // 4. Applications Status Breakdown
  const appStatusGroups = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  const applicationBreakdown = appStatusGroups.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  // 5. Interview Scores
  const interviewStats = await InterviewSession.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        avgScore: { $avg: '$totalScore' },
        maxScore: { $max: '$totalScore' },
        minScore: { $min: '$totalScore' }
      }
    }
  ]);
  const avgInterviewScore = interviewStats.length > 0 ? Math.round(interviewStats[0].avgScore) : 0;

  // 6. Most in-demand skills
  const skillCountMap = {};
  allJobs.forEach(j => {
    (j.skills || []).forEach(s => {
      const key = s.trim();
      skillCountMap[key] = (skillCountMap[key] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCountMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalStudents,
    totalRecruiters,
    totalJobs,
    activeJobs,
    totalApplications,
    totalInterviews,
    placedCount,
    placementRate,
    avgSalary,
    highestSalary,
    topRecruitingSectors,
    applicationBreakdown,
    topSkills,
    avgInterviewScore,
    sharedDate: new Date().toISOString()
  };
};

// @desc    Get complete platform analytics
// @route   GET /api/analytics
// @access  Private (Admin & Recruiter)
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const stats = await getRealAnalyticsSnapshot();

    // Recent applications with details
    const recentApplications = await Application.find()
      .populate('student', 'name email avatar college')
      .populate('job', 'title company location')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      stats: {
        ...stats,
        recentApplications
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit a request to Platform Producer for Placement Analytics
// @route   POST /api/analytics/request
// @access  Private (Student & Recruiter)
exports.requestAnalytics = async (req, res, next) => {
  try {
    const { purpose, organization } = req.body;

    if (!purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please state the reason or intended purpose for accessing placement analytics'
      });
    }

    const org = organization || req.user.college || req.user.companyName || 'Campus Partner';

    const analyticsReq = await AnalyticsRequest.create({
      user: req.user.id,
      requesterName: req.user.name,
      requesterEmail: req.user.email,
      requesterRole: req.user.role,
      organization: org,
      purpose,
      status: 'pending'
    });

    // Notify Producer (nitin2911.in@gmail.com)
    await notifyProducerOfAnalyticsRequest({
      requesterName: req.user.name,
      requesterEmail: req.user.email,
      requesterRole: req.user.role,
      organization: org,
      purpose,
      requestId: analyticsReq._id
    });

    res.status(201).json({
      success: true,
      message: `Analytics request sent to Platform Producer at ${PRODUCER_EMAIL}. You will receive the whole placement dossier upon approval.`,
      request: analyticsReq
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all Analytics Requests
// @route   GET /api/analytics/requests
// @access  Private (Admin only)
exports.getAnalyticsRequests = async (req, res, next) => {
  try {
    const requests = await AnalyticsRequest.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Share Whole Placement Analytics Dossier with Requester
// @route   POST /api/analytics/share/:id
// @access  Private (Admin only)
exports.shareAnalytics = async (req, res, next) => {
  try {
    const { producerNotes } = req.body;
    const analyticsReq = await AnalyticsRequest.findById(req.params.id);

    if (!analyticsReq) {
      return res.status(404).json({
        success: false,
        message: 'Analytics request record not found'
      });
    }

    // Compile 100% REAL placement data snapshot from database
    const snapshotData = await getRealAnalyticsSnapshot();

    // Dispatch email to requester with full analytics dossier
    await sendAnalyticsDossierEmail({
      requesterEmail: analyticsReq.requesterEmail,
      requesterName: analyticsReq.requesterName,
      stats: snapshotData,
      producerNotes: producerNotes || 'Approved by Platform Producer (Nitin Kumar)'
    });

    analyticsReq.status = 'shared';
    analyticsReq.sharedAt = new Date();
    analyticsReq.sharedBy = req.user.id;
    analyticsReq.producerNotes = producerNotes || 'Approved and shared via Admin Portal';
    analyticsReq.snapshotData = snapshotData;
    await analyticsReq.save();

    res.json({
      success: true,
      message: `Complete placement analytics dossier has been successfully emailed to ${analyticsReq.requesterEmail}`,
      request: analyticsReq
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's personal analytics requests
// @route   GET /api/analytics/my-requests
// @access  Private (Student & Recruiter)
exports.getMyAnalyticsRequests = async (req, res, next) => {
  try {
    const requests = await AnalyticsRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    // Dynamically calculate latest real analytics snapshot if shared, so users always see real app data
    const realSnapshot = await getRealAnalyticsSnapshot();
    const updatedRequests = requests.map(r => {
      const doc = r.toObject();
      if (doc.status === 'shared') {
        doc.snapshotData = {
          ...realSnapshot,
          sharedDate: doc.sharedAt || doc.updatedAt || new Date().toISOString()
        };
      }
      return doc;
    });

    res.json({
      success: true,
      requests: updatedRequests
    });
  } catch (err) {
    next(err);
  }
};
