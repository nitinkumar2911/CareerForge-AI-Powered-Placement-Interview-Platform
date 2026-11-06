require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('./config/db');

const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const InterviewSession = require('./models/InterviewSession');
const Resume = require('./models/Resume');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Seeding initial CareerForge dataset...');

    // Clear existing collections
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await InterviewSession.deleteMany({});
    await Resume.deleteMany({});

    // Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Create Users
    const studentUser = await User.create({
      name: 'Alex Rivera',
      email: 'student@careerforge.io',
      password: hashedPassword,
      role: 'student',
      title: 'Full Stack & AI Engineer Intern',
      bio: 'Final year CS student at Stanford / Tech University. Passionate about distributed systems, React, Node.js, and generative AI.',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'Python'],
      college: 'Stanford University / Institute of Technology',
      graduationYear: '2026',
      cgpa: '9.2',
      githubUrl: 'https://github.com/alexrivera-dev',
      linkedinUrl: 'https://linkedin.com/in/alexrivera-dev',
      portfolioUrl: 'https://alexrivera.dev',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    });

    const secondStudent = await User.create({
      name: 'Priya Sharma',
      email: 'priya@careerforge.io',
      password: hashedPassword,
      role: 'student',
      title: 'Backend & Cloud Specialist',
      bio: 'Passionate about high-throughput microservices, Redis caching, and Kubernetes.',
      college: 'National Institute of Technology',
      graduationYear: '2026',
      cgpa: '9.4',
      skills: ['Go', 'Node.js', 'Docker', 'Kubernetes', 'Redis', 'AWS'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
    });

    const recruiterUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@careerforge.io',
      password: hashedPassword,
      role: 'recruiter',
      title: 'Senior Technical Talent Partner',
      bio: 'Leading University Talent Acquisition across Silicon Valley and top remote engineering teams.',
      companyName: 'Stripe & TechCorp Global',
      companyWebsite: 'https://stripe.com',
      phone: '+1 (555) 987-6543',
      location: 'San Francisco / Remote',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
    });

    const secondRecruiter = await User.create({
      name: 'David Chen',
      email: 'david.chen@cloudnova.io',
      password: hashedPassword,
      role: 'recruiter',
      title: 'Head of Engineering Recruitment',
      companyName: 'CloudNova Systems',
      companyWebsite: 'https://cloudnova.io',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
    });

    const adminUser = await User.create({
      name: 'CareerForge Admin',
      email: 'admin@careerforge.io',
      password: hashedPassword,
      role: 'admin',
      title: 'Platform System Administrator',
      bio: 'Superadmin overseeing placement pipeline integrity, university cohorts, and AI interview quality.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'
    });

    console.log('✓ Users created: Student, Recruiter, Admin accounts ready.');

    // 2. Create Jobs
    const job1 = await Job.create({
      title: 'Full Stack Software Engineer',
      company: 'Stripe',
      recruiter: recruiterUser._id,
      location: 'San Francisco, CA (Hybrid)',
      jobType: 'Full-time',
      experienceLevel: 'Entry Level',
      salaryRange: '$125,000 - $145,000 / yr',
      description: 'Join our merchant payments core engineering team building high-volume payment processing APIs, delightful merchant dashboards, and resilient financial infrastructure.',
      requirements: [
        'Solid proficiency in modern JavaScript/TypeScript and React.js',
        'Strong hands-on experience building RESTful APIs in Node.js or Go',
        'Understanding of relational & NoSQL databases (PostgreSQL, MongoDB, Redis)',
        'Familiarity with distributed caching, microservices, and Docker'
      ],
      responsibilities: [
        'Design and deploy scalable APIs processing millions of global payment transactions',
        'Collaborate with product designers to ship performant frontend interfaces',
        'Participate in code reviews, automated unit tests, and continuous delivery'
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs'],
      applicantsCount: 2,
      status: 'active'
    });

    const job2 = await Job.create({
      title: 'Frontend React Developer',
      company: 'CloudNova Systems',
      recruiter: secondRecruiter._id,
      location: 'Remote (Global)',
      jobType: 'Full-time',
      experienceLevel: 'Entry Level',
      salaryRange: '$100,000 - $120,000 / yr',
      description: 'We are seeking an ambitious frontend engineer to craft enterprise monitoring dashboards with low-latency WebSockets, interactive charts, and pixel-perfect design.',
      requirements: [
        'Extensive knowledge of React 18, Hooks, and State Management (Redux/Zustand)',
        'High level of proficiency in Tailwind CSS and responsive design',
        'Experience consuming WebSockets and RESTful endpoints',
        'Strong grasp of Web Vitals and frontend optimization techniques'
      ],
      responsibilities: [
        'Build real-time analytics visualizations using React and Canvas/SVG',
        'Ensure 60fps rendering performance across complex dashboard graphs',
        'Implement accessibility standards (WCAG 2.1 AA)'
      ],
      skills: ['React', 'JavaScript', 'Tailwind CSS', 'WebSockets', 'UI/UX'],
      applicantsCount: 1,
      status: 'active'
    });

    const job3 = await Job.create({
      title: 'Backend Systems & Cloud Intern',
      company: 'DataFlow Labs',
      recruiter: recruiterUser._id,
      location: 'New York, NY (Remote friendly)',
      jobType: 'Internship',
      experienceLevel: 'Internship',
      salaryRange: '$48 / hr ($8,000 / mo)',
      description: 'Summer 2026 technical internship focused on building real-time data streaming pipelines, Redis cluster caching, and automated cloud deployments.',
      requirements: [
        'Enrolled in BS/MS in Computer Science or related STEM field',
        'Demonstrated projects in Node.js, Express, or Python',
        'Basic familiarity with Git, Linux CLI, and RESTful concepts'
      ],
      responsibilities: [
        'Optimize database query execution and indexing',
        'Build event-driven workers using RabbitMQ / Kafka',
        'Contribute to internal developer CLI tooling'
      ],
      skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Python'],
      applicantsCount: 1,
      status: 'active'
    });

    const job4 = await Job.create({
      title: 'AI & Machine Learning Solutions Engineer',
      company: 'NextGen AI',
      recruiter: secondRecruiter._id,
      location: 'Seattle, WA (Hybrid)',
      jobType: 'Full-time',
      experienceLevel: 'Mid Level',
      salaryRange: '$140,000 - $170,000 / yr',
      description: 'Spearhead generative AI integration into enterprise workflows, fine-tuning LLM pipelines, RAG retrieval architectures, and high-throughput model inference endpoints.',
      requirements: [
        'Hands-on experience with LLM APIs (Gemini, OpenAI, Claude) and LangChain/LlamaIndex',
        'Strong Python coding skills and vector database familiarity (Pinecone, ChromaDB)',
        'Understanding of model evaluation, embeddings, and prompt engineering'
      ],
      responsibilities: [
        'Deploy production RAG retrieval systems for Fortune 500 documents',
        'Optimize token latency and evaluate automated answer accuracy'
      ],
      skills: ['Python', 'LLMs', 'Vector DB', 'FastAPI', 'PyTorch'],
      applicantsCount: 0,
      status: 'active'
    });

    console.log('✓ Jobs created across Stripe, CloudNova, DataFlow Labs, NextGen AI.');

    // 3. Create Sample ATS-Optimized Resume for Alex Rivera
    const studentResume = await Resume.create({
      student: studentUser._id,
      personalInfo: {
        fullName: 'Alex Rivera',
        email: 'alex.rivera@careerforge.io',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        website: 'https://alexrivera.dev',
        linkedin: 'https://linkedin.com/in/alexrivera-dev',
        github: 'https://github.com/alexrivera-dev',
        summary: 'Driven Full Stack Software Engineer with expertise in building scalable, real-time web applications using React, Node.js, Express, and MongoDB. Proven record of reducing API latency by 32% and architecting microservices for 20,000+ active users.'
      },
      education: [
        {
          institution: 'Stanford University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startYear: '2022',
          endYear: '2026',
          grade: 'CGPA: 9.2 / 10.0 (Dean\'s Honor List)'
        }
      ],
      experience: [
        {
          company: 'TechNovate Labs',
          role: 'Full Stack Engineering Intern',
          location: 'San Francisco, CA',
          startDate: 'May 2025',
          endDate: 'Aug 2025',
          current: false,
          description: 'Engineered high-throughput RESTful microservices in Node.js, reducing 99th percentile response latency by 32%. Implemented live WebSocket collaboration rooms supporting 1,500 simultaneous users.'
        },
        {
          company: 'Campus Placement Tech Cell',
          role: 'Lead Full Stack Developer',
          location: 'Stanford, CA',
          startDate: 'Sep 2024',
          endDate: 'Present',
          current: true,
          description: 'Architected university-wide placement portal handling 4,000 student applications and automated interview scheduling with role-based JWT security.'
        }
      ],
      projects: [
        {
          title: 'CareerForge – AI-Powered Placement Platform',
          techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Gemini AI'],
          description: 'Full-stack campus placement suite with live Socket.io AI technical interviews, instant rubric evaluation, ATS resume score meter, and recruiter candidate pipeline.',
          liveLink: 'https://careerforge.demo.io',
          githubLink: 'https://github.com/alexrivera-dev/careerforge'
        },
        {
          title: 'HyperScale – Distributed Cache & KV Store',
          techStack: ['Go', 'Raft Consensus', 'Docker', 'gRPC'],
          description: 'High-availability distributed key-value store with Raft consensus protocol achieving 45,000 write ops/sec with sub-millisecond read latency.',
          liveLink: 'https://hyperscale-demo.dev',
          githubLink: 'https://github.com/alexrivera-dev/hyperscale'
        }
      ],
      skills: {
        technical: ['JavaScript (ES6+)', 'TypeScript', 'Node.js', 'Python', 'Go', 'SQL'],
        frameworks: ['React 18', 'Express.js', 'Next.js', 'Tailwind CSS', 'Socket.io'],
        tools: ['Docker', 'MongoDB', 'PostgreSQL', 'Redis', 'Git', 'AWS (S3, EC2)'],
        softSkills: ['System Design', 'Agile/Scrum', 'Technical Communication', 'Problem Solving']
      },
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: '2025',
          credentialUrl: 'https://aws.amazon.com/verification/xyz'
        }
      ],
      template: 'modern',
      atsScore: 94,
      atsFeedback: [
        'Superb quantifiable metrics in experience section.',
        'High keyword relevance matching modern Full Stack profiles.',
        'Complete contact and portfolio repository links included.'
      ]
    });

    console.log('✓ Student Resume seeded with 94 ATS Score.');

    // 4. Create Sample Completed AI Interview Session
    const interviewSession = await InterviewSession.create({
      student: studentUser._id,
      role: 'Full Stack Developer',
      difficulty: 'Mid',
      status: 'completed',
      totalScore: 89,
      overallFeedback: 'Candidate completed 3 technical questions with an overall composite score of 89/100. Candidate exhibits exceptional readiness for top-tier placement opportunities.',
      topStrengths: [
        'Exceptional technical precision and breadth across evaluated topics.',
        'Clear articulation of architectural trade-offs and performance implications.'
      ],
      keyRecommendations: [
        'Ready for senior technical rounds. Continue staying updated on system design patterns.'
      ],
      durationSeconds: 420,
      questions: [
        {
          questionIndex: 0,
          questionText: 'Can you explain the Virtual DOM in React, how the reconciliation algorithm works, and how React 18 Concurrent features improve UI responsiveness?',
          category: 'React & Core Architecture',
          expectedKeywords: ['virtual dom', 'diffing', 'reconciliation', 'fiber', 'concurrent', 'useTransition'],
          candidateAnswer: 'The Virtual DOM is an in-memory lightweight representation of the actual DOM. When state changes, React creates a new VDOM tree and diffs it with the previous snapshot using the reconciliation algorithm (React Fiber). It minimizes slow browser DOM updates by batching mutations. In React 18, Concurrent Mode allows rendering to be interrupted so high priority events like typing are not blocked by large list renders, using hooks like useTransition.',
          codeSnippet: 'const [isPending, startTransition] = useTransition();\nstartTransition(() => { setFilteredList(hugeList); });',
          evaluation: {
            score: 92,
            accuracy: 94,
            clarity: 90,
            depth: 92,
            strengths: 'Demonstrated thorough grasp of Fiber architecture, diffing heuristics, and React 18 concurrent transitions with sample code snippet.',
            improvements: 'Could also mention key heuristics (e.g. why unique keys prevent remounting component subtrees).',
            modelAnswer: 'React Fiber enables interruptible rendering via fibers, allowing urgent interactions (typing, clicking) to preempt heavy secondary renders using hooks like useTransition and automatic batching.'
          },
          answeredAt: new Date(Date.now() - 3600000)
        },
        {
          questionIndex: 1,
          questionText: 'Explain the internal architecture of Node.js, the phases of the libuv event loop, and how Node processes asynchronous I/O versus CPU-intensive workloads.',
          category: 'Node.js Event Loop & Concurrency',
          expectedKeywords: ['event loop', 'libuv', 'timers', 'poll', 'check', 'microtask', 'process.nexttick', 'worker threads'],
          candidateAnswer: 'Node runs on a single main thread powered by Google V8 and libuv. The event loop cycles through phases: Timers (setTimeout), Pending I/O, Poll (reading sockets/files), and Check (setImmediate). Microtasks like process.nextTick and Promise callbacks run between phases. For CPU-bound tasks like cryptography or heavy loops, Node uses the libuv thread pool or Worker Threads so the main event loop is never starved.',
          codeSnippet: '',
          evaluation: {
            score: 87,
            accuracy: 88,
            clarity: 88,
            depth: 85,
            strengths: 'Clearly distinguished between I/O bound libuv offloading and CPU-bound Worker Threads. Strong understanding of microtask queuing priority.',
            improvements: 'Could discuss Cluster module for multi-core process forking in production.',
            modelAnswer: 'Node.js utilizes a single-threaded V8 engine backed by libuv for asynchronous I/O. Microtasks execute immediately after each phase or call stack exhaustion.'
          },
          answeredAt: new Date(Date.now() - 1800000)
        }
      ]
    });

    console.log('✓ Completed AI Interview Session seeded.');

    // 5. Create Applications
    await Application.create({
      job: job1._id,
      student: studentUser._id,
      recruiter: recruiterUser._id,
      resume: studentResume._id,
      interviewSession: interviewSession._id,
      status: 'Shortlisted',
      coverLetter: 'I have followed Stripe\'s engineering blog closely and built high-performance distributed systems in Node.js and React. My AI technical interview score is 89/100.',
      notes: 'Outstanding technical score on Full Stack AI interview. Strong portfolio and ATS resume. Recommended for Round 2 technical onsite.'
    });

    await Application.create({
      job: job2._id,
      student: studentUser._id,
      recruiter: secondRecruiter._id,
      resume: studentResume._id,
      interviewSession: interviewSession._id,
      status: 'Interviewing',
      coverLetter: 'Excited about CloudNova\'s real-time analytics dashboards. Strong experience with WebSockets and React 18.',
      notes: 'Candidate scheduled for live coding session with senior frontend staff.'
    });

    await Application.create({
      job: job1._id,
      student: secondStudent._id,
      recruiter: recruiterUser._id,
      status: 'Applied',
      coverLetter: 'Applying for Full Stack position with strong background in Go and microservices.',
      notes: 'Initial resume screening pending.'
    });

    console.log('✓ Candidate Applications seeded with pipeline stages.');

    console.log('\n======================================================');
    console.log('CareerForge Database Successfully Populated!');
    console.log('Demo Credentials for Instant Login:');
    console.log('  👨‍🎓 Student:   student@careerforge.io   | password123');
    console.log('  💼 Recruiter: recruiter@careerforge.io | password123');
    console.log('  🛡️ Admin:     admin@careerforge.io     | password123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Fatal error during seeding:', err);
    process.exit(1);
  }
};

seedData();
