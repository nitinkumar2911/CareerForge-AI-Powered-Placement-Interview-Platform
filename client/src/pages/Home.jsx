import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Bot,
  FileText,
  Briefcase,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Cpu,
  BarChart3,
  Users
} from 'lucide-react';

const Home = () => {
  const { demoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async (role) => {
    if (role === 'admin') {
      try {
        await demoLogin('admin');
        navigate('/admin/dashboard');
      } catch (err) {
        console.error(err);
      }
    } else if (role === 'student') {
      if (isAuthenticated && user?.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/login?role=student');
      }
    } else if (role === 'recruiter') {
      if (isAuthenticated && user?.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/login?role=recruiter');
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-brand-600/15 via-indigo-600/10 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Gen AI Campus Placement Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Ace Your Tech Placements with <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-blue-400 to-indigo-300">Live AI Interviews</span> & Smart ATS
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Practice interactive technical rounds with an AI interviewer in real-time, generate ATS-optimized resumes that recruiters love, and apply directly to top tech companies.
        </p>

        {/* Demo Fast-Action Banner */}
        <div className="mt-10 p-4 max-w-3xl mx-auto rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Explore Platform Workspaces:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleDemoClick('student')}
              className="group flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-brand-600/20 text-white border border-slate-700/80 hover:border-brand-500/50 transition-all font-semibold text-sm shadow"
            >
              <span className="text-lg">👨‍🎓</span>
              <div className="text-left">
                <div className="text-xs text-brand-400 font-medium">Student Portal</div>
                <div className="text-sm font-bold">Candidate Sign In</div>
              </div>
            </button>

            <button
              onClick={() => handleDemoClick('recruiter')}
              className="group flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 text-white border border-slate-700/80 hover:border-emerald-500/50 transition-all font-semibold text-sm shadow"
            >
              <span className="text-lg">💼</span>
              <div className="text-left">
                <div className="text-xs text-emerald-400 font-medium">Recruiter Portal</div>
                <div className="text-sm font-bold">Hiring Sign In</div>
              </div>
            </button>

            <button
              onClick={() => handleDemoClick('admin')}
              className="group flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-purple-600/20 text-white border border-slate-700/80 hover:border-purple-500/50 transition-all font-semibold text-sm shadow"
            >
              <span className="text-lg">🛡️</span>
              <div className="text-left">
                <div className="text-xs text-purple-400 font-medium">Platform Admin</div>
                <div className="text-sm font-bold">CareerForge Admin</div>
              </div>
            </button>
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/interview/setup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
          >
            <Bot className="w-5 h-5" />
            Start AI Interview Practice
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/jobs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-base border border-slate-700 transition-all"
          >
            <Briefcase className="w-5 h-5 text-slate-400" />
            Explore Job Openings
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time WebSocket Feedback</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated ATS Resume Scorer</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Candidate Scorecard Sharing</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Role-Based Access Control</span>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Full-Spectrum Placement Architecture</h2>
          <p className="mt-2 text-slate-400 text-sm max-w-xl mx-auto">
            Engineered with modern full-stack web technologies to deliver an end-to-end recruitment lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live AI Interview Room</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Real-time Socket.io powered technical interview simulator. Evaluates candidate depth, accuracy, clarity, and code scratchpad in real time.
            </p>
            <Link to="/interview/setup" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300">
              Launch Simulator <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">ATS Resume Builder</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Dynamic multi-section builder with live template rendering, automated ATS keyword scoring (0-100), and PDF export.
            </p>
            <Link to="/student/resume" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
              Build ATS Resume <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Placement Pipeline</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Search top job openings, apply with 1-click attaching your ATS resume & verified AI interview scores, and track stages in real time.
            </p>
            <Link to="/jobs" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              Browse Jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Recruiter & Admin Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Recruiters manage listings and evaluate applicants with interview scorecards. Admins oversee platform analytics and user accounts.
            </p>
            <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300">
              View Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800 p-8 sm:p-12 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">88%</div>
              <div className="text-xs text-slate-400 mt-1">Average AI Interview Score</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-400">95+</div>
              <div className="text-xs text-slate-400 mt-1">Target ATS Resume Score</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">&lt; 350ms</div>
              <div className="text-xs text-slate-400 mt-1">Socket.io Live Latency</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-400">3 Roles</div>
              <div className="text-xs text-slate-400 mt-1">RBAC Security Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
