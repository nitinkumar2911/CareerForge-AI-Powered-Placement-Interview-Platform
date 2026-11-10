import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Briefcase,
  Clock,
  Building,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const STAGES = ['Applied', 'Reviewed', 'Shortlisted', 'Interviewing', 'Offered'];

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications/my-applications');
        setApplications(res.data.applications || []);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStageIndex = (status) => {
    const idx = STAGES.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Application Pipeline Tracker</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your application lifecycle stages, recruiter feedback, and AI scorecard links.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No active applications yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Apply to open roles and track your recruitment status here in real time.
          </p>
          <Link
            to="/jobs"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
          >
            Explore Available Positions
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isRejected = app.status === 'Rejected';

            return (
              <div
                key={app._id}
                className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                      {app.job?.company}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-0.5">{app.job?.title}</h2>
                    <div className="text-xs text-slate-400 mt-1">
                      {app.job?.location} • {app.job?.jobType} • Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                        isRejected
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : app.status === 'Offered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                          : app.status === 'Shortlisted'
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      Current Status: {app.status}
                    </span>
                  </div>
                </div>

                {/* Visual Pipeline Stepper */}
                {!isRejected && (
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-2 relative">
                      {STAGES.map((stage, sIdx) => {
                        const isCompleted = sIdx <= currentStageIdx;
                        const isCurrent = sIdx === currentStageIdx;

                        return (
                          <div key={stage} className="flex flex-col items-center text-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-2 ${
                                isCurrent
                                  ? 'bg-brand-500 text-white ring-4 ring-brand-500/20 shadow-lg shadow-brand-500/40'
                                  : isCompleted
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {isCompleted && !isCurrent ? '✓' : sIdx + 1}
                            </div>
                            <span
                              className={`text-[11px] font-semibold ${
                                isCurrent
                                  ? 'text-white font-bold'
                                  : isCompleted
                                  ? 'text-emerald-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recruiter Notes or Linked AI Interview */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {app.notes ? (
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 flex items-start gap-2 flex-1">
                      <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">Recruiter Feedback Note: </span>
                        <span>{app.notes}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      Application under active consideration by hiring team.
                    </div>
                  )}

                  {app.interviewSession && (
                    <Link
                      to={`/interview/report/${app.interviewSession._id || app.interviewSession}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold hover:bg-purple-500/20 transition-all whitespace-nowrap"
                    >
                      <Award className="w-4 h-4 text-purple-400" />
                      Attached AI Scorecard ({app.interviewSession.totalScore || 88}%)
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MyApplications;
