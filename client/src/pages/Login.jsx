import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Shield,
  GraduationCap,
  Briefcase,
  Zap,
  KeyRound,
  RotateCcw
} from 'lucide-react';

const Login = () => {
  const { initiateLogin, verifyOtp, resendOtp, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryRole = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState(
    queryRole === 'recruiter' ? 'recruiter' : queryRole === 'admin' ? 'admin' : 'student'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA OTP state
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [otp, setOtp] = useState('');
  const [otpInfo, setOtpInfo] = useState({
    email: '',
    targetEmailMasked: '',
    isProducerAdmin: false,
    message: ''
  });
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (queryRole === 'recruiter') {
      setSelectedRole('recruiter');
    } else if (queryRole === 'admin') {
      setSelectedRole('admin');
      setEmail('admin@careerforge.io');
      setPassword('password123');
    } else if (queryRole === 'student') {
      setSelectedRole('student');
    }
  }, [queryRole]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'admin') {
      setEmail('admin@careerforge.io');
      setPassword('password123');
    } else {
      if (email === 'admin@careerforge.io') {
        setEmail('');
        setPassword('');
      }
    }
  };

  // Step 1: Submit Credentials & trigger OTP
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await initiateLogin(email, password);
      if (res.requireOtp) {
        setOtpInfo({
          email: res.email,
          targetEmailMasked: res.targetEmailMasked,
          isProducerAdmin: res.isProducerAdmin,
          message: res.message
        });
        setStep('otp');
        setResendCooldown(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Admin Access Trigger (routes OTP to Producer nitin2911.in@gmail.com)
  const handleAdminQuickAccess = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await demoLogin('admin');
      if (res.requireOtp) {
        setEmail(res.email);
        setOtpInfo({
          email: res.email,
          targetEmailMasked: res.targetEmailMasked,
          isProducerAdmin: true,
          message: res.message
        });
        setStep('otp');
        setResendCooldown(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Admin authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await verifyOtp(otpInfo.email || email, otp.trim());
      if (loggedUser.role === 'student') navigate('/student/dashboard');
      else if (loggedUser.role === 'recruiter') navigate('/recruiter/dashboard');
      else if (loggedUser.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await resendOtp(otpInfo.email || email);
      setOtpInfo(prev => ({
        ...prev,
        targetEmailMasked: res.targetEmailMasked || prev.targetEmailMasked
      }));
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 items-center justify-center shadow-lg shadow-brand-500/20 mb-3">
            {step === 'otp' ? (
              <Shield className="w-6 h-6 text-white animate-pulse" />
            ) : (
              <Sparkles className="w-6 h-6 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {step === 'otp' ? 'Two-Factor Verification' : 'Sign In to CareerForge'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {step === 'otp'
              ? 'Enter the 6-digit security code dispatched to your email'
              : 'Select your account type and enter your credentials'}
          </p>
        </div>

        {/* STEP 1: CREDENTIALS INPUT */}
        {step === 'credentials' && (
          <>
            {/* Role Selector Tabs */}
            <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-3 gap-1 mb-6 shadow-lg">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'student'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('recruiter')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'recruiter'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Recruiter
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>

            {/* Context Notice */}
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex items-center gap-2">
              {selectedRole === 'student' && (
                <>
                  <span className="text-brand-400 font-semibold">👨‍🎓 Student Portal:</span>
                  <span className="text-slate-400">Sign in with password + email OTP to access your portfolio.</span>
                </>
              )}
              {selectedRole === 'recruiter' && (
                <>
                  <span className="text-emerald-400 font-semibold">💼 Recruiter Portal:</span>
                  <span className="text-slate-400">Sign in with password + email OTP to manage jobs and applicants.</span>
                </>
              )}
              {selectedRole === 'admin' && (
                <>
                  <span className="text-purple-400 font-semibold">🛡️ Producer Security:</span>
                  <span className="text-slate-400">Admin OTP is routed exclusively to Producer at <strong>nitin2911.in@gmail.com</strong>.</span>
                </>
              )}
            </div>

            {/* Form Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Dedicated 1-Click Trigger for CareerForge Admin */}
              {selectedRole === 'admin' && (
                <div className="mb-5 pb-5 border-b border-slate-800">
                  <button
                    type="button"
                    onClick={handleAdminQuickAccess}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    ⚡ Trigger Producer Admin 2FA (nitin2911.in@gmail.com)
                  </button>
                  <div className="text-[11px] text-slate-500 text-center mt-2">
                    Dispatches authorization code directly to Producer's inbox
                  </div>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {selectedRole === 'student'
                      ? 'Student Email Address'
                      : selectedRole === 'recruiter'
                      ? 'Recruiter / Company Email'
                      : 'Administrator Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedRole === 'student'
                          ? 'e.g. nitin2911.in@gmail.com or student@college.edu'
                          : selectedRole === 'recruiter'
                          ? 'recruiter@company.com'
                          : 'admin@careerforge.io'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">Password</label>
                    {selectedRole === 'admin' && (
                      <span className="text-[11px] text-purple-400">admin pass: password123</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                    selectedRole === 'student'
                      ? 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/30'
                      : selectedRole === 'recruiter'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  }`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Continue & Send Email OTP
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Registration Link */}
              <div className="mt-6 text-center text-xs text-slate-400">
                {selectedRole === 'student' ? (
                  <>
                    New student?{' '}
                    <Link to="/register?role=student" className="text-brand-400 hover:text-brand-300 font-semibold">
                      Create a student account
                    </Link>
                  </>
                ) : selectedRole === 'recruiter' ? (
                  <>
                    Hiring talent?{' '}
                    <Link to="/register?role=recruiter" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                      Create a recruiter account
                    </Link>
                  </>
                ) : (
                  <>
                    Platform administration reserved for authorized operators.
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* STEP 2: 2FA OTP VERIFICATION (NO DEV CODE EXPOSURE) */}
        {step === 'otp' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
            
            {/* Target Email Alert Card */}
            <div className={`mb-5 p-3.5 rounded-xl border text-xs leading-relaxed ${
              otpInfo.isProducerAdmin
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                : 'bg-brand-500/10 border-brand-500/30 text-brand-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <KeyRound className="w-4 h-4" />
                {otpInfo.isProducerAdmin ? 'Producer Authorization Required' : 'Email Security Code Sent'}
              </div>
              <div>
                {otpInfo.isProducerAdmin ? (
                  <>
                    A 6-digit verification code has been dispatched to Platform Producer (<strong>nitin2911.in@gmail.com</strong>). Only the producer can authorize administrator access.
                  </>
                ) : (
                  <>
                    A 6-digit verification code has been sent to <strong>{otpInfo.targetEmailMasked || otpInfo.email}</strong>.
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center text-2xl font-mono font-bold tracking-[10px] py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  otpInfo.isProducerAdmin
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                    : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/30'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Verify & Access Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setOtp('');
                  setError('');
                }}
                className="hover:text-white transition-colors"
              >
                ← Back to credentials
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className="hover:text-brand-400 disabled:opacity-40 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
