import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Bot,
  FileText,
  Briefcase,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Building,
  Mail,
  Send,
  X,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applicationsCount: 0,
    atsScore: 0,
    interviewsCount: 0,
    highestScore: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Analytics Request state
  const [myAnalyticsRequests, setMyAnalyticsRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [organization, setOrganization] = useState(user?.college || '');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestNotice, setRequestNotice] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [appsRes, resumeRes, interviewsRes, jobsRes, analyticsReqRes] = await Promise.all([
        api.get('/applications/my-applications'),
        api.get('/resume/my-resume').catch(() => ({ data: { resume: null } })),
        api.get('/interviews/my-sessions').catch(() => ({ data: { sessions: [] } })),
        api.get('/jobs?status=active'),
        api.get('/analytics/my-requests').catch(() => ({ data: { requests: [] } }))
      ]);

      const apps = appsRes.data.applications || [];
      const resume = resumeRes.data?.resume;
      const sessions = interviewsRes.data?.sessions || [];
      const jobs = jobsRes.data?.jobs || [];

      const completed = sessions.filter(s => s.status === 'completed');
      const bestScore = completed.length > 0 ? Math.max(...completed.map(s => s.totalScore || 0)) : 0;

      setStats({
        applicationsCount: apps.length,
        atsScore: resume?.atsScore || 0,
        interviewsCount: completed.length,
        highestScore: bestScore
      });

      setRecentApplications(apps.slice(0, 4));
      setRecommendedJobs(jobs.slice(0, 3));
      setMyAnalyticsRequests(analyticsReqRes.data?.requests || []);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAnalyticsRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestSubmitting(true);
    try {
      const res = await api.post('/analytics/request', {
        purpose,
        organization
      });
      setRequestNotice('Your request has been dispatched to Platform Producer (nitin2911.in@gmail.com).');
      setShowRequestModal(false);
      setPurpose('');
      fetchDashboardData();
      setTimeout(() => setRequestNotice(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit analytics request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const latestAnalyticsRequest = myAnalyticsRequests[0];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Candidate Career Suite
          </div>
          <h1 className="text-3xl font-extrabold text-white">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            {user?.college ? `${user.college} • ` : ''}Your tech placement pipeline, real-time AI interview practice, and resume ATS score are active.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/interview/setup"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Start AI Interview
          </Link>
          <Link
            to="/student/resume"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Edit Resume
          </Link>
        </div>
      </div>

      {requestNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{requestNotice}</span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Applied Jobs</span>
            <div className="text-2xl font-bold text-white mt-0.5">{stats.applicationsCount}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">ATS Resume Score</span>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">
              {stats.atsScore > 0 ? `${stats.atsScore}/100` : 'Draft'}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">AI Mock Rounds</span>
            <div className="text-2xl font-bold text-indigo-400 mt-0.5">{stats.interviewsCount}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Best Interview Score</span>
            <div className="text-2xl font-bold text-purple-400 mt-0.5">
              {stats.highestScore > 0 ? `${stats.highestScore}%` : 'N/A'}
            </div>
          </div>
        </div>

      </div>


      {/* Institutional Placement Analytics Dossier Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            Institutional Placement Analytics & Salary Benchmarks
          </div>
          <h3 className="text-base font-bold text-white">Official Placement Dossier Access</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Institutional placement statistics, salary distributions (Average & Highest CTC), and recruiter demand index are managed securely. To obtain the whole dataset, send an official access request to Platform Producer (<strong>nitin2911.in@gmail.com</strong>).
          </p>

          {latestAnalyticsRequest && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              {latestAnalyticsRequest.status === 'shared' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Dossier Shared by Producer ({new Date(latestAnalyticsRequest.sharedAt).toLocaleDateString()})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  Request Pending Producer Authorization (nitin2911.in@gmail.com)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {latestAnalyticsRequest?.status === 'shared' ? (
            <button
              onClick={() => {
                setSelectedDossier(latestAnalyticsRequest);
                setShowDossierModal(true);
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              View Full Placement Dossier
            </button>
          ) : (
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-purple-500/50 font-bold text-xs transition-all flex items-center gap-2 shadow"
            >
              <Mail className="w-4 h-4 text-purple-400" />
              Request Placement Analytics
            </button>
          )}
        </div>
      </div>

      {/* Main Split Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Recent Applications
            </h2>
            <Link to="/student/applications" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
              View All ({stats.applicationsCount})
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">You haven't submitted any job applications yet.</p>
              <Link
                to="/jobs"
                className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
              >
                Browse Job Listings
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">{app.job?.title || 'Software Role'}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {app.job?.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {app.job?.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        app.status === 'Shortlisted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : app.status === 'Interviewing'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : app.status === 'Offered'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recommended Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Recommended For You
            </h2>
            <Link to="/jobs" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
              Explore More
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedJobs.map((job) => (
              <div
                key={job._id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                      {job.title}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">{job.company} • {job.location}</div>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                    {job.jobType}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {(job.skills || []).slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{job.salaryRange || 'Competitive'}</span>
                  <Link
                    to="/jobs"
                    className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL: Request Placement Analytics */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Request Placement Analytics</h3>
                <p className="text-xs text-slate-400">Dispatched directly to Producer (nitin2911.in@gmail.com)</p>
              </div>
            </div>

            <form onSubmit={handleAnalyticsRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  College / Academic Affiliation
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering, Tech University"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Intended Purpose for Access
                </label>
                <textarea
                  required
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Researching target compensation packages, preparing for campus interviews, and understanding recruiter tech stack trends..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] leading-relaxed">
                ℹ️ The Platform Producer reviews requests centrally. Once approved, the complete official placement dossier will be emailed to <strong>{user?.email}</strong> and made accessible in your portal.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {requestSubmitting ? 'Transmitting...' : 'Send Request to Producer'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Shared Placement Dossier */}
      {showDossierModal && selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDossierModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Official Placement Analytics Dossier</h3>
                <p className="text-xs text-slate-400">
                  Authorized & Shared by Platform Producer (Nitin Kumar) on {new Date(selectedDossier.sharedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedDossier.producerNotes && (
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-6">
                <strong>Producer Note:</strong> {selectedDossier.producerNotes}
              </div>
            )}

            {/* Dossier Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Placement Rate</span>
                <div className="text-xl font-extrabold text-emerald-400 mt-1">
                  {selectedDossier.snapshotData?.placementRate || '0%'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Average Package</span>
                <div className="text-xl font-extrabold text-brand-400 mt-1">
                  {selectedDossier.snapshotData?.avgSalary || 'Not Disclosed'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Highest Package</span>
                <div className="text-xl font-extrabold text-purple-400 mt-1">
                  {selectedDossier.snapshotData?.highestSalary || 'Not Disclosed'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Active Jobs</span>
                <div className="text-xl font-extrabold text-amber-400 mt-1">
                  {selectedDossier.snapshotData?.activeJobs ?? selectedDossier.snapshotData?.totalJobs ?? 0} Openings
                </div>
              </div>
            </div>

            {/* In-Demand Sectors */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3 mb-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Top In-Demand Hiring Sectors
              </h4>
              <div className="space-y-2">
                {(selectedDossier.snapshotData?.topRecruitingSectors || [
                  { domain: 'Open Technical Positions', share: '100%' }
                ]).map((sec, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{sec.domain}</span>
                    <span className="font-mono font-bold text-brand-400">{sec.share}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDossierModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
