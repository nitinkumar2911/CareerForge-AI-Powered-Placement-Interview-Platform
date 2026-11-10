import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Shield,
  RotateCcw
} from 'lucide-react';

const Register = () => {
  const { initiateRegister, verifyRegisterOtp, resendRegisterOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student';

  // Step state: 'form' | 'otp'
  const [step, setStep] = useState('form');
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification state
  const [otp, setOtp] = useState('');
  const [otpInfo, setOtpInfo] = useState({
    email: '',
    targetEmailMasked: '',
    message: ''
  });
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Submit Form & Trigger Email OTP
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await initiateRegister({
        name,
        email: email.trim().toLowerCase(),
        password,
        role,
        college: role === 'student' ? college : undefined,
        companyName: role === 'recruiter' ? companyName : undefined
      });

      if (res.requireOtp) {
        setOtpInfo({
          email: res.email,
          targetEmailMasked: res.targetEmailMasked,
          message: res.message
        });
        setStep('otp');
        setResendCooldown(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize account creation
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newUser = await verifyRegisterOtp(otpInfo.email || email, otp.trim());
      if (newUser.role === 'student') navigate('/student/dashboard');
      else if (newUser.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired registration code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await resendRegisterOtp(otpInfo.email || email);
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
            {step === 'otp' ? 'Confirm Email Verification' : 'Create Your Account'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {step === 'otp'
              ? `Enter the 6-digit confirmation code dispatched to ${otpInfo.email || email}`
              : 'Join the CareerForge campus placement network'}
          </p>
        </div>

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' && (
          <>
            {/* Role Toggle Selector */}
            <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-1 mb-6">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'student'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                I am a Student
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'recruiter'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                I am a Recruiter
              </button>
            </div>

            {/* Form Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === 'student' ? 'Nitin Kumar' : 'Sarah Jenkins'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {role === 'student' ? 'Student Email Address' : 'Company / Recruiter Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={role === 'student' ? 'student@university.edu' : 'recruiter@company.com'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    An activation OTP will be dispatched to this email address.
                  </p>
                </div>

                {role === 'student' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">College / University</label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. Delhi Technological University, IIT, BITS"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Company Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Stripe, Google, FastHire"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                    role === 'student'
                      ? 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
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

              <div className="mt-6 text-center text-xs text-slate-400">
                Already registered?{' '}
                <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">
                  Sign In here
                </Link>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: REGISTRATION OTP CONFIRMATION (NO DEV CODE EXPOSURE) */}
        {step === 'otp' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
            
            {/* Notice Card */}
            <div className={`mb-5 p-3.5 rounded-xl border text-xs leading-relaxed ${
              role === 'recruiter'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-brand-500/10 border-brand-500/30 text-brand-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <KeyRound className="w-4 h-4" />
                Email Verification Code Dispatched
              </div>
              <div>
                We've sent a 6-digit code to <strong>{otpInfo.targetEmailMasked || otpInfo.email}</strong>. Please enter the code below to confirm your account and enter your workspace.
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
                  Enter 6-Digit Registration Code
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
                  role === 'recruiter'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/30'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm Code & Activate Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setOtp('');
                  setError('');
                }}
                className="hover:text-white transition-colors"
              >
                ← Edit registration details
              </button>

              <button
                type="button"
                onClick={handleResend}
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

export default Register;
