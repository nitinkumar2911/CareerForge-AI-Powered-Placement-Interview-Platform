const Resume = require('../models/Resume');
const { calculateATSScore } = require('../services/atsScorerService');

// @desc    Get logged in student's resume
// @route   GET /api/resume/my-resume
// @access  Private (Student)
exports.getMyResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ student: req.user.id });

    if (!resume) {
      // Prepopulate with user details
      resume = await Resume.create({
        student: req.user.id,
        personalInfo: {
          fullName: req.user.name,
          email: req.user.email,
          phone: req.user.phone || '',
          location: req.user.location || '',
          github: req.user.githubUrl || '',
          linkedin: req.user.linkedinUrl || '',
          website: req.user.portfolioUrl || '',
          summary: req.user.bio || 'Aspiring Software Engineer passionate about developing high-performance web applications and distributed systems.'
        },
        education: [
          {
            institution: req.user.college || 'National Institute of Technology',
            degree: 'Bachelor of Technology',
            fieldOfStudy: 'Computer Science and Engineering',
            startYear: '2022',
            endYear: req.user.graduationYear || '2026',
            grade: req.user.cgpa ? `CGPA: ${req.user.cgpa}/10.0` : 'CGPA: 8.8/10.0'
          }
        ],
        experience: [
          {
            company: 'TechNovate Labs',
            role: 'Software Development Intern',
            location: 'Remote',
            startDate: 'May 2025',
            endDate: 'August 2025',
            current: false,
            description: 'Engineered RESTful microservices reducing API latency by 32%. Implemented automated CI/CD deployment pipelines using Docker.'
          }
        ],
        projects: [
          {
            title: 'CloudSync – Distributed File Storage',
            techStack: ['React', 'Node.js', 'AWS S3', 'MongoDB'],
            description: 'Architected a secure file synchronization platform serving 2,500+ active users with end-to-end encryption.',
            liveLink: 'https://cloudsync-demo.io',
            githubLink: 'https://github.com/demo/cloudsync'
          }
        ],
        skills: {
          technical: ['JavaScript', 'TypeScript', 'Python', 'Go', 'SQL'],
          frameworks: ['React', 'Node.js', 'Express.js', 'Tailwind CSS', 'Next.js'],
          tools: ['Git', 'Docker', 'MongoDB', 'PostgreSQL', 'Redis', 'AWS'],
          softSkills: ['Problem Solving', 'System Design', 'Agile Collaboration']
        },
        template: 'modern'
      });

      const ats = calculateATSScore(resume);
      resume.atsScore = ats.score;
      resume.atsFeedback = ats.feedback;
      await resume.save();
    }

    res.json({
      success: true,
      resume
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update student resume with ATS scoring
// @route   PUT /api/resume
// @access  Private (Student)
exports.saveResume = async (req, res, next) => {
  try {
    const resumeData = req.body;

    // Calculate dynamic ATS score & feedback recommendations
    const ats = calculateATSScore(resumeData);
    resumeData.atsScore = ats.score;
    resumeData.atsFeedback = ats.feedback;

    let resume = await Resume.findOneAndUpdate(
      { student: req.user.id },
      { ...resumeData, student: req.user.id },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Resume saved and analyzed successfully',
      resume
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get resume by ID (for recruiter or admin review)
// @route   GET /api/resume/:id
// @access  Private
exports.getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('student', 'name email avatar college graduationYear');

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      resume
    });
  } catch (err) {
    next(err);
  }
};
