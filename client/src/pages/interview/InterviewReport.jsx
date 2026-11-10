import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import confetti from 'canvas-confetti';
import {
  Award,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Code,
  BookOpen,
  RotateCcw,
  Video,
  Download
} from 'lucide-react';

const InterviewReport = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        setSession(res.data.session);

        // Fire victory confetti if high score
        if (res.data.session?.totalScore >= 75) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.error('Failed to load session report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        Interview session not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print-area">
      
      {/* Top Banner */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block">
            Technical Evaluation Scorecard
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-0.5">
            {session.role} Interview Report
          </h1>
          <div className="text-xs text-slate-400 mt-1">
            Difficulty: {session.difficulty} • Candidate: {session.student?.name || 'Student'} • Completed on {new Date(session.updatedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Print Scorecard
          </button>
          <Link
            to="/interview/setup"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Practice Another Round
          </Link>
        </div>
      </div>

      {/* Score Summary Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/40 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8">
        
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Rubric Verified
          </div>
          <h2 className="text-2xl font-bold text-white">Overall Performance Rating</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {session.overallFeedback || 'Comprehensive evaluation completed across core architectural concepts, implementation clarity, and algorithmic depth.'}
          </p>
        </div>

        <div className="flex-shrink-0 text-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
            Composite Score
          </span>
          <div className="text-5xl font-black text-white">
            {session.totalScore}<span className="text-2xl text-slate-500 font-normal">/100</span>
          </div>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
              session.totalScore >= 80
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
            }`}
          >
            {session.totalScore >= 80 ? 'Placement Ready' : 'Solid Baseline'}
          </span>
        </div>

      </div>

      {/* Recorded Video Interview Player */}
      {session.recordingUrl && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Your Interview Recording
                </span>
                <span className="text-xs text-slate-400">Attached to recruiter job applications</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">Video & Audio Playback</h3>
            </div>
            <a
              href={session.recordingUrl}
              download="my_interview_recording.webm"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-all self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-brand-400" />
              Download Video
            </a>
          </div>

          <div className="relative rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl aspect-video max-h-[460px] flex items-center justify-center">
            <video
              controls
              playsInline
              className="w-full h-full object-contain"
              src={session.recordingUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Strengths & Recommendations Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Top Observed Strengths
          </h3>
          <ul className="space-y-2">
            {(session.topStrengths || []).map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Key Recommendations
          </h3>
          <ul className="space-y-2">
            {(session.keyRecommendations || []).map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <span className="text-amber-400 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Detailed Question By Question Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-400" />
          Question-by-Question Rubric Breakdown
        </h3>

        <div className="space-y-4">
          {(session.questions || []).map((q, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
                    Question #{idx + 1} • {q.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">{q.questionText}</h4>
                </div>
                <span className="px-3 py-1 rounded-xl bg-slate-800 text-xs font-bold text-white border border-slate-700 whitespace-nowrap">
                  {q.evaluation?.score || 0}/100
                </span>
              </div>

              {/* Candidate Answer */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Your Answer:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {q.candidateAnswer || 'No response recorded.'}
                </p>
                {q.codeSnippet && (
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 text-xs font-mono overflow-x-auto mt-2 border border-slate-800">
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}
              </div>

              {/* AI Evaluation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-300">
                  <strong className="text-emerald-400 block mb-1">Observed Strengths:</strong>
                  {q.evaluation?.strengths}
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-300">
                  <strong className="text-amber-400 block mb-1">Growth Opportunity:</strong>
                  {q.evaluation?.improvements}
                </div>
              </div>

              {/* Model Answer */}
              {q.evaluation?.modelAnswer && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-brand-400" /> Ideal Architectural Response:
                  </div>
                  <p className="italic text-slate-300 leading-relaxed">{q.evaluation.modelAnswer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default InterviewReport;
