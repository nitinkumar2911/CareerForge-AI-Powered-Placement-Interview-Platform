import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  DollarSign,
  TrendingUp,
  Building,
  Mail,
  Send,
  X,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Analytics Request state
  const [myAnalyticsRequests, setMyAnalyticsRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [organization, setOrganization] = useState(user?.companyName || '');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestNotice, setRequestNotice] = useState('');

  const fetchRecruiterData = async () => {
    try {
      const [jobsRes, requestsRes] = await Promise.all([
        api.get('/jobs/recruiter/my-jobs'),
        api.get('/analytics/my-requests').catch(() => ({ data: { requests: [] } }))
      ]);
      setJobs(jobsRes.data.jobs || []);
      setMyAnalyticsRequests(requestsRes.data?.requests || []);
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const handleAnalyticsRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestSubmitting(true);
    try {
      await api.post('/analytics/request', {
        purpose,
        organization
      });
      setRequestNotice('Your request has been dispatched to Platform Producer (nitin2911.in@gmail.com).');
      setShowRequestModal(false);
      setPurpose('');
      fetchRecruiterData();
      setTimeout(() => setRequestNotice(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit analytics request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const totalApplicants = jobs.reduce((acc, curr) => acc + (curr.applicantsCount || 0), 0);
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
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Recruiter Talent Command Center
          </div>
          <h1 className="text-3xl font-extrabold text-white">Talent Acquisition Dashboard</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            {user?.companyName ? `${user.companyName} • ` : ''}Manage your open engineering positions, review applicant resumes, and inspect verified AI interview scorecards.
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Job Opening
        </Link>
      </div>

      {requestNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{requestNotice}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Postings</span>
            <div className="text-2xl font-bold text-white mt-1">{jobs.length}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Candidate Applications</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{totalApplicants}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">AI Screening Ratio</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">100%</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Placement Analytics Request Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            Institutional Hiring Analytics & Market Intelligence
          </div>
          <h3 className="text-base font-bold text-white">Full Placement Analytics Dossier</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Interested in aggregate salary distributions, candidate skill pools, and university hiring trends? Submit an official data request to Platform Producer (<strong>nitin2911.in@gmail.com</strong>).
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
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              View Full Placement Dossier
            </button>
          ) : (
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/50 font-bold text-xs transition-all flex items-center gap-2 shadow"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              Request Placement Analytics
            </button>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Your Posted Positions</h2>

        {jobs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No jobs posted yet</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Post your first position to begin receiving verified student applications.</p>
            <Link to="/recruiter/post-job" className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                        {job.company}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{job.title}</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {job.jobType}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</div>
                    <div className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> {job.salaryRange}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Total Applicants</span>
                    <span className="text-sm font-bold text-brand-400">{job.applicantsCount || 0} candidates</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <Link
                    to={`/recruiter/job/${job._id}/applicants`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    Review Candidates ({job.applicantsCount || 0})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
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
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Acme Corp, Tech Innovations"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-emerald-500"
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
                  placeholder="e.g. Talent benchmarking, market CTC compensation evaluation, campus hiring targets..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
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
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs mb-6">
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
                    <span className="font-mono font-bold text-emerald-400">{sec.share}</span>
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

export default RecruiterDashboard;
