import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Briefcase,
  Search,
  MapPin,
  Building,
  DollarSign,
  Calendar,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

const JobListings = () => {
  const { isAuthenticated, isStudent } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  // Selected job for detail modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Application submission state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (jobType) params.append('jobType', jobType);
      if (experienceLevel) params.append('experienceLevel', experienceLevel);
      params.append('status', 'active');

      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [jobType, experienceLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    setApplyError('');
    setApplySuccess('');
    try {
      await api.post(`/applications/apply/${selectedJob._id}`, {
        coverLetter: coverNote
      });
      setApplySuccess('Application submitted successfully with your ATS resume & recorded technical interview video!');
      setTimeout(() => {
        setApplyModalOpen(false);
        setSelectedJob(null);
        setApplySuccess('');
        setCoverNote('');
        fetchJobs();
      }, 2500);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Campus & Tech Placement Openings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover verified software engineering and tech roles with 1-click ATS application.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          Showing <span className="font-bold text-white">{jobs.length}</span> active positions
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, tech stack (React, Node, Go) or company..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs outline-none focus:border-brand-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs outline-none focus:border-brand-500"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
            </select>

            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs outline-none focus:border-brand-500"
            >
              <option value="">All Experience</option>
              <option value="Internship">Internship</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Job Cards Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No job openings found</h3>
          <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
                      {job.company}
                    </span>
                    <h2 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors mt-0.5">
                      {job.title}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 whitespace-nowrap">
                    {job.jobType}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-slate-500" /> {job.salaryRange || 'Competitive'}</span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(job.skills || []).slice(0, 4).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-medium text-slate-300 border border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {job.applicantsCount || 0} applicants
                </span>
                <button
                  onClick={() => setSelectedJob(job)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
                >
                  View Position <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 relative">
            
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block">
                {selectedJob.company}
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">{selectedJob.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-500" /> {selectedJob.location}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-slate-500" /> {selectedJob.salaryRange}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{selectedJob.jobType}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{selectedJob.experienceLevel}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">About the Role</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedJob.description}</p>
            </div>

            {/* Requirements */}
            {selectedJob.requirements?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Key Requirements</h3>
                <ul className="space-y-1.5">
                  {selectedJob.requirements.map((req, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {selectedJob.responsibilities?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Responsibilities</h3>
                <ul className="space-y-1.5">
                  {selectedJob.responsibilities.map((resp, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Bottom Action */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                Posted by {selectedJob.recruiter?.name || 'Recruiter'}
              </div>
              <button
                onClick={() => setApplyModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
              >
                1-Click Apply
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Apply Confirmation Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">Apply for {selectedJob?.title}</h3>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {applySuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                ✓ {applySuccess}
              </div>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-white">Your Application will automatically attach:</div>
                  <div>• Your saved ATS Resume with verified keyword score</div>
                  <div>• Your highest AI Technical Interview Scorecard</div>
                  <div>• Your recorded Technical Interview Video & Audio (viewable by recruiter)</div>
                </div>

                {applyError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {applyError}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Optional Note / Pitch to Recruiter</label>
                  <textarea
                    rows={3}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Briefly state why your technical background is a great fit..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
                  >
                    {applying ? 'Submitting...' : 'Confirm & Submit Application'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default JobListings;
