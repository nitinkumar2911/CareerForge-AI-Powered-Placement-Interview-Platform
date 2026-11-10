import React from 'react';
import { Sparkles, Heart, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">CareerForge</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Powered Placement & Technical Interview Platform. Empowering students with real-time AI interview practice, ATS-optimized resumes, and seamless recruiter hiring workflows.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">For Students</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/jobs" className="hover:text-brand-400 transition-colors">Placement Job Board</a></li>
              <li><a href="/student/resume" className="hover:text-brand-400 transition-colors">ATS Resume Builder</a></li>
              <li><a href="/interview/setup" className="hover:text-brand-400 transition-colors">Live AI Mock Interview</a></li>
              <li><a href="/student/applications" className="hover:text-brand-400 transition-colors">Application Tracker</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">For Recruiters</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/recruiter/dashboard" className="hover:text-brand-400 transition-colors">Recruiter Talent Hub</a></li>
              <li><a href="/recruiter/post-job" className="hover:text-brand-400 transition-colors">Post Tech Jobs</a></li>
              <li><a href="/recruiter/dashboard" className="hover:text-brand-400 transition-colors">Applicant AI Scorecards</a></li>
              <li><a href="/admin/dashboard" className="hover:text-brand-400 transition-colors">Hiring Pipeline</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Technology Stack</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">React 18</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Node.js</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Express.js</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">MongoDB</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Socket.io</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">JWT & RBAC</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Gemini AI</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Tailwind CSS</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CareerForge Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Built with modern MERN + Socket.io + AI Architecture
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
