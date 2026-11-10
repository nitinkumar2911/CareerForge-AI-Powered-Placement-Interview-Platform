import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Mail,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  X,
  Video,
  Play,
  Download
} from 'lucide-react';

const ApplicantReview = () => {
  const { jobId } = useParams();
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplications(res.data.applications || []);
      setJobTitle(res.data.jobTitle || 'Job Opening');
      setCompany(res.data.company || '');
    } catch (err) {
      console.error('Failed to load job applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplications(apps =>
        apps.map(a => (a._id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNotesChange = async (appId, notes) => {
    try {
      await api.put(`/applications/${appId}/status`, { notes });
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
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
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/recruiter/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Recruiter Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Candidates for {jobTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {company} • Total Applicants: {applications.length}
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No applicants received yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Applications will appear here once candidates submit their ATS profile.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Candidate Details */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center font-bold text-base text-brand-300 overflow-hidden flex-shrink-0">
                  {app.student?.avatar ? (
                    <img src={app.student.avatar} alt={app.student.name} className="w-full h-full object-cover" />
                  ) : (
                    app.student?.name?.charAt(0) || 'C'
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{app.student?.name}</h3>
                    {app.resume?.atsScore && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ATS: {app.resume.atsScore}/100
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span>{app.student?.email}</span>
                    <span>• {app.student?.college || 'University'}</span>
                    {app.student?.cgpa && <span>• CGPA: {app.student.cgpa}</span>}
                  </div>

                  {app.coverLetter && (
                    <p className="text-xs text-slate-300 italic max-w-xl mt-1">
                      "{app.coverLetter}"
                    </p>
                  )}
                </div>
              </div>

              {/* AI Interview Score & Stage Control */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                
                {/* AI Score Badge */}
                {app.interviewSession ? (
                  <Link
                    to={`/interview/report/${app.interviewSession._id || app.interviewSession}`}
                    className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-center flex-shrink-0"
                  >
                    <span className="text-[10px] text-purple-300 uppercase font-bold block">
                      AI Interview Score
                    </span>
                    <div className="text-lg font-black text-white mt-0.5">
                      {app.interviewSession.totalScore || 88}%
                    </div>
                    <span className="text-[10px] text-purple-400 font-semibold flex items-center justify-center gap-1">
                      View Scorecard <ExternalLink className="w-3 h-3" />
                    </span>
                  </Link>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center flex-shrink-0">
                    <span className="text-[10px] text-slate-500 block">AI Technical Interview</span>
                    <span className="text-xs text-slate-400 font-semibold">Not Completed</span>
                  </div>
                )}

                {/* Interview Video Recording Player Button */}
                {(app.interviewRecordingUrl || app.interviewSession?.recordingUrl) ? (
                  <button
                    onClick={() =>
                      setSelectedRecording({
                        studentName: app.student?.name || 'Candidate',
                        email: app.student?.email,
                        recordingUrl: app.interviewRecordingUrl || app.interviewSession?.recordingUrl,
                        session: app.interviewSession,
                        coverLetter: app.coverLetter
                      })
                    }
                    className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-500/10 transition-all flex-shrink-0"
                    title="Watch Recorded Video & Audio Technical Interview"
                  >
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <Video className="w-4 h-4" />
                    </div>
                    <span>Watch Interview Video</span>
                  </button>
                ) : null}

                {/* Resume Inspect Button */}
                {app.resume && (
                  <button
                    onClick={() => setSelectedResume(app.resume)}
                    className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex flex-col items-center justify-center gap-1"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Inspect Resume
                  </button>
                )}

                {/* Pipeline Stage Select */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Candidate Stage
                  </span>
                  <select
                    value={app.status}
                    disabled={updatingId === app._id}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold outline-none focus:border-emerald-500"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Resume View Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 relative">
            <button
              onClick={() => setSelectedResume(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">
                Resume: {selectedResume.personalInfo?.fullName || 'Candidate'}
              </h2>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ATS Score: {selectedResume.atsScore}/100
              </span>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <strong className="text-white">Summary: </strong>
                <span>{selectedResume.personalInfo?.summary}</span>
              </div>

              {selectedResume.experience?.length > 0 && (
                <div>
                  <strong className="text-white block mb-1">Experience:</strong>
                  {selectedResume.experience.map((exp, i) => (
                    <div key={i} className="mb-2 pl-2 border-l border-slate-700">
                      <div className="font-bold text-slate-200">{exp.role} @ {exp.company}</div>
                      <p className="text-slate-400 mt-0.5">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedResume.projects?.length > 0 && (
                <div>
                  <strong className="text-white block mb-1">Projects:</strong>
                  {selectedResume.projects.map((proj, i) => (
                    <div key={i} className="mb-2 pl-2 border-l border-slate-700">
                      <div className="font-bold text-slate-200">{proj.title}</div>
                      <p className="text-slate-400 mt-0.5">{proj.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Candidate Recorded Interview Video Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5 relative">
            <button
              onClick={() => setSelectedRecording(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 pr-12">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Recorded Video & Audio Interview
                  </span>
                  {selectedRecording.session?.role && (
                    <span className="text-xs text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                      {selectedRecording.session.role} ({selectedRecording.session.difficulty || 'Mid'} Level)
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1.5">
                  {selectedRecording.studentName}'s Recorded AI Interview
                </h2>
                <p className="text-xs text-slate-400">
                  Full Video & Audio Stream • Synchronized with Candidate's Technical Evaluation Scorecard
                </p>
              </div>

              {selectedRecording.session?.totalScore && (
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center flex-shrink-0">
                  <span className="text-[10px] text-purple-300 uppercase font-bold block">AI Verified Score</span>
                  <div className="text-xl font-black text-white">{selectedRecording.session.totalScore}%</div>
                </div>
              )}
            </div>

            {/* Video Player Display */}
            <div className="relative rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl aspect-video max-h-[440px] flex items-center justify-center">
              <video
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                src={selectedRecording.recordingUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Candidate Interview Rubric & Questions Summary */}
            {selectedRecording.session?.questions && selectedRecording.session.questions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  Interview Questions & Candidate Responses
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedRecording.session.questions.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-300">Question #{idx + 1}: {q.questionText}</span>
                        {q.evaluation?.score && (
                          <span className="font-bold text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Score: {q.evaluation.score}/100
                          </span>
                        )}
                      </div>
                      {q.candidateAnswer && (
                        <p className="text-slate-300 italic text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          "{q.candidateAnswer}"
                        </p>
                      )}
                      {q.evaluation?.strengths && (
                        <p className="text-emerald-400/90 text-[10px]">
                          ✓ Strengths: {q.evaluation.strengths}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <a
                href={selectedRecording.recordingUrl}
                download={`interview_${selectedRecording.studentName.replace(/\s+/g, '_')}.webm`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-brand-400" />
                Download Recording (.webm)
              </a>
              <button
                onClick={() => setSelectedRecording(null)}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all"
              >
                Close Player
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ApplicantReview;
