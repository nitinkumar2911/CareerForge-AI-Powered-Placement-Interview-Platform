const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');
const registerInterviewSocket = require('./sockets/interviewSocket');

// Route files
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Models for auto-seed check
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with permissive CORS for development
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Ensure uploads/interviews directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'interviews');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: '*',
  credentials: true
}));

// Serve uploaded files (e.g. interview recordings)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'CareerForge Backend API & Socket Service',
    version: '1.0.0'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Register real-time Socket.io namespace & events
registerInterviewSocket(io);

// Central error handler
app.use(errorHandler);

// Serve static frontend assets in production (Railway or cloud hosting)
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  // Client-side single page app fallback for React Router
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Auto-seed helper to ensure CareerForge Admin and primary accounts exist and have valid credentials
const autoSeedIfEmpty = async () => {
  try {
    const bcrypt = require('bcryptjs');

    // 1. Ensure Admin Account exists & has working password
    let admin = await User.findOne({ email: 'admin@careerforge.io' }).select('+password');
    if (!admin) {
      console.log('Ensuring CareerForge Admin account exists...');
      await User.create({
        name: 'CareerForge Admin',
        email: 'admin@careerforge.io',
        password: 'password123',
        role: 'admin',
        title: 'Platform System Administrator',
        bio: 'Superadmin overseeing placement pipeline integrity and platform analytics.'
      });
      console.log('✓ CareerForge Admin created');
    } else {
      const match = await admin.matchPassword('password123');
      if (!match) {
        console.log('Synchronizing CareerForge Admin password to password123...');
        admin.password = 'password123';
        await admin.save();
        console.log('✓ CareerForge Admin password updated to password123');
      }
    }

    // 2. Ensure Student account (nitin.kumar_cs24@gla.ac.in) has working password
    const student = await User.findOne({ email: 'nitin.kumar_cs24@gla.ac.in' }).select('+password');
    if (student) {
      const match6 = await student.matchPassword('123456');
      const matchPass = await student.matchPassword('password123');
      if (!match6 && !matchPass) {
        console.log('Synchronizing Student (nitin.kumar_cs24@gla.ac.in) password to 123456...');
        student.password = '123456';
        await student.save();
        console.log('✓ Student password synchronized');
      }
    }

    // 3. Ensure Recruiter account (recruiter@careerforge.io) has working password
    const recruiter = await User.findOne({ email: 'recruiter@careerforge.io' }).select('+password');
    if (recruiter) {
      const matchRecruiter = await recruiter.matchPassword('password123');
      if (!matchRecruiter) {
        recruiter.password = 'password123';
        await recruiter.save();
      }
    }
  } catch (err) {
    console.warn('Credential sync notice:', err.message);
  }
};

// Start Server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();
    await autoSeedIfEmpty();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 CareerForge Server active on port ${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   Client Origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
