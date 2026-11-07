import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobListings from './pages/student/JobListings';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ResumeBuilder from './pages/student/ResumeBuilder';
import MyApplications from './pages/student/MyApplications';

// Interview Suite
import InterviewSetup from './pages/interview/InterviewSetup';
import LiveInterview from './pages/interview/LiveInterview';
import InterviewReport from './pages/interview/InterviewReport';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJob from './pages/recruiter/PostJob';
import ApplicantReview from './pages/recruiter/ApplicantReview';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobListings />} />

              {/* Student Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/resume" element={<ResumeBuilder />} />
                <Route path="/student/applications" element={<MyApplications />} />
                <Route path="/interview/setup" element={<InterviewSetup />} />
                <Route path="/interview/room/:sessionId" element={<LiveInterview />} />
              </Route>

              {/* Interview Report (Student, Recruiter, Admin) */}
              <Route element={<ProtectedRoute allowedRoles={['student', 'recruiter', 'admin']} />}>
                <Route path="/interview/report/:id" element={<InterviewReport />} />
              </Route>

              {/* Recruiter Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/post-job" element={<PostJob />} />
                <Route path="/recruiter/job/:jobId/applicants" element={<ApplicantReview />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
