import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Briefcase,
  FileText,
  Bot,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, demoLogin, isStudent, isRecruiter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickDemo = async (role) => {
    setDemoDropdownOpen(false);
    if (role === 'admin') {
      try {
        await demoLogin('admin');
        navigate('/admin/dashboard');
      } catch (err) {
        console.error('Admin login failed:', err);
      }
    } else if (role === 'student') {
      if (isAuthenticated && isStudent) {
        navigate('/student/dashboard');
      } else {
        navigate('/login?role=student');
      }
    } else if (role === 'recruiter') {
      if (isAuthenticated && isRecruiter) {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/login?role=recruiter');
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-brand-300">
                Career<span className="text-brand-400">Forge</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                AI Placement Hub
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/jobs"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/jobs') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Jobs
            </Link>

            {isStudent && (
              <>
                <Link
                  to="/student/resume"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/student/resume') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  ATS Resume Builder
                </Link>
                <Link
                  to="/interview/setup"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/interview/setup') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Bot className="w-4 h-4 text-brand-400 animate-pulse" />
                  AI Interview Room
                </Link>
                <Link
                  to="/student/applications"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/student/applications') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Applications
                </Link>
              </>
            )}

            {isRecruiter && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/recruiter/dashboard') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Recruiter Hub
                </Link>
                <Link
                  to="/recruiter/post-job"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/recruiter/post-job') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Post a Job
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin/dashboard') ? 'bg-slate-800 text-purple-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                Admin Console
              </Link>
            )}
          </div>

          {/* Right Action / Auth & Demo Switcher */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Professional Portal Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 text-slate-200 hover:text-white hover:bg-slate-700/80 border border-slate-700 transition-all shadow-sm"
                title="Switch between platform role workspaces"
              >
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                Switch Portal
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    Select Workspace:
                  </div>
                  <button
                    onClick={() => handleQuickDemo('student')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>👨‍🎓 Student Portal</span>
                    <span className="text-[10px] text-brand-400 font-semibold">Candidate</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemo('recruiter')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>💼 Recruiter Portal</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Hiring</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemo('admin')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>🛡️ Platform Admin</span>
                    <span className="text-[10px] text-purple-400 font-semibold">System</span>
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={isStudent ? '/student/dashboard' : isRecruiter ? '/recruiter/dashboard' : '/admin/dashboard'}
                  className="flex items-center gap-2 text-sm text-slate-200 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center font-bold text-xs text-white uppercase overflow-hidden border border-brand-400/50">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-xs leading-none">{user?.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{user?.role}</span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            Job Board
          </Link>
          {isStudent && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/student/resume"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
              >
                ATS Resume Builder
              </Link>
              <Link
                to="/interview/setup"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-brand-400 hover:bg-slate-800"
              >
                AI Interview Room
              </Link>
            </>
          )}
          {isRecruiter && (
            <Link
              to="/recruiter/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
            >
              Recruiter Hub
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-400 hover:bg-slate-800"
            >
              Admin Console
            </Link>
          )}

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-semibold px-3 uppercase tracking-wider text-[10px]">Switch Workspace:</div>
            <div className="grid grid-cols-3 gap-2 px-3">
              <button
                onClick={() => { handleQuickDemo('student'); setMobileMenuOpen(false); }}
                className="px-2 py-1.5 rounded bg-slate-800 text-xs text-brand-400 border border-brand-500/30 font-semibold"
              >
                Student
              </button>
              <button
                onClick={() => { handleQuickDemo('recruiter'); setMobileMenuOpen(false); }}
                className="px-2 py-1.5 rounded bg-slate-800 text-xs text-emerald-400 border border-emerald-500/30 font-semibold"
              >
                Recruiter
              </button>
              <button
                onClick={() => { handleQuickDemo('admin'); setMobileMenuOpen(false); }}
                className="px-2 py-1.5 rounded bg-slate-800 text-xs text-purple-400 border border-purple-500/30 font-semibold"
              >
                Admin
              </button>
            </div>
            {isAuthenticated ? (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full mt-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-slate-800 text-left"
              >
                Sign Out ({user?.name})
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg bg-slate-800 text-slate-200 text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg bg-brand-600 text-white text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
