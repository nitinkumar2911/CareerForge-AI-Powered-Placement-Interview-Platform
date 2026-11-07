const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const InterviewSession = require('../models/InterviewSession');

async function cleanDefaultData() {
  try {
    await connectDB();
    console.log('--- Cleaning Default Student & Recruiter Data ---');

    // Default demo emails
    const defaultEmails = [
      'student@careerforge.io',
      'priya@careerforge.io',
      'recruiter@careerforge.io',
      'david.chen@cloudnova.io'
    ];

    // Find default users
    const defaultUsers = await User.find({ email: { $in: defaultEmails } });
    const defaultUserIds = defaultUsers.map((u) => u._id);

    console.log('Found default users to remove:', defaultUsers.map((u) => `${u.name} (${u.email}) [${u.role}]`));

    // Delete applications linked to default users
    const deletedApps = await Application.deleteMany({
      $or: [
        { student: { $in: defaultUserIds } },
        { recruiter: { $in: defaultUserIds } }
      ]
    });
    console.log(`✓ Deleted ${deletedApps.deletedCount} default applications`);

    // Delete resumes linked to default students
    const deletedResumes = await Resume.deleteMany({ student: { $in: defaultUserIds } });
    console.log(`✓ Deleted ${deletedResumes.deletedCount} default resumes`);

    // Delete interview sessions linked to default students
    const deletedSessions = await InterviewSession.deleteMany({ student: { $in: defaultUserIds } });
    console.log(`✓ Deleted ${deletedSessions.deletedCount} default interview sessions`);

    // Delete jobs posted by default recruiters
    const deletedJobs = await Job.deleteMany({ recruiter: { $in: defaultUserIds } });
    console.log(`✓ Deleted ${deletedJobs.deletedCount} default jobs`);

    // Delete default students and recruiters
    const deletedUsers = await User.deleteMany({ _id: { $in: defaultUserIds } });
    console.log(`✓ Deleted ${deletedUsers.deletedCount} default student and recruiter accounts`);

    // Verify / Ensure CareerForge Admin is present and role is 'admin'
    let admin = await User.findOne({ email: 'admin@careerforge.io' });
    if (!admin) {
      console.log('Creating CareerForge Admin account...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      admin = await User.create({
        name: 'CareerForge Admin',
        email: 'admin@careerforge.io',
        password: hashedPassword,
        role: 'admin',
        title: 'Platform System Administrator',
        bio: 'Superadmin overseeing placement pipeline integrity and platform analytics.'
      });
      console.log('✓ CareerForge Admin created successfully');
    } else {
      if (admin.role !== 'admin' || admin.name !== 'CareerForge Admin') {
        admin.role = 'admin';
        admin.name = 'CareerForge Admin';
        await admin.save();
      }
      console.log('✓ CareerForge Admin verified with role "admin"');
    }

    // List remaining users
    const remainingUsers = await User.find({}, 'name email role');
    console.log('\n--- Remaining Users in Database ---');
    remainingUsers.forEach((u) => {
      console.log(`• ${u.name} | ${u.email} | Role: ${u.role}`);
    });

    console.log('\n✓ Cleanup completed successfully!');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning default data:', err);
    process.exit(1);
  }
}

cleanDefaultData();
