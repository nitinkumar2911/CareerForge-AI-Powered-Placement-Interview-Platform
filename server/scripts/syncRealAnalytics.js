require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('../models/User');
    const Job = require('../models/Job');
    const Application = require('../models/Application');
    const InterviewSession = require('../models/InterviewSession');
    const AnalyticsRequest = require('../models/AnalyticsRequest');

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();
    const totalInterviews = await InterviewSession.countDocuments({ status: 'completed' });

    // 1. Real Placement Rate
    const placedStudentIds = await Application.find({ status: 'Offered' }).distinct('student');
    const placedCount = placedStudentIds.length;
    let placementRate = '0%';
    if (totalStudents > 0) {
      const rate = Math.round((placedCount / totalStudents) * 100);
      placementRate = `${rate}%`;
    } else if (placedCount > 0) {
      placementRate = '100%';
    }

    // 2. Real Salary Calculations
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
          if (isLpa && val < 100) val *= 100000;
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

    // 3. Real In-Demand Sectors & Skills
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

    const realSnapshot = {
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
      sharedDate: new Date().toISOString()
    };

    console.log('REAL SNAPSHOT COMPUTED:', realSnapshot);

    const updateRes = await AnalyticsRequest.updateMany(
      {},
      { $set: { snapshotData: realSnapshot } }
    );
    console.log('AnalyticsRequest documents updated:', updateRes.modifiedCount);

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error syncing analytics:', err);
    process.exit(1);
  }
})();
