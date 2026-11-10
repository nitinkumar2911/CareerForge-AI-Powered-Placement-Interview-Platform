import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  FileText,
  Save,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink,
  Code,
  GraduationCap,
  Briefcase,
  User,
  Layers,
  ChevronRight
} from 'lucide-react';

const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      summary: ''
    },
    education: [],
    experience: [],
    projects: [],
    skills: {
      technical: [],
      frameworks: [],
      tools: [],
      softSkills: []
    },
    certifications: [],
    template: 'modern',
    atsScore: 0,
    atsFeedback: []
  });

  // String helpers for skills editing
  const [techSkillsStr, setTechSkillsStr] = useState('');
  const [frameworksStr, setFrameworksStr] = useState('');
  const [toolsStr, setToolsStr] = useState('');
  const [softSkillsStr, setSoftSkillsStr] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.get('/resume/my-resume');
        const data = res.data.resume;
        setResumeData(data);
        setTechSkillsStr((data.skills?.technical || []).join(', '));
        setFrameworksStr((data.skills?.frameworks || []).join(', '));
        setToolsStr((data.skills?.tools || []).join(', '));
        setSoftSkillsStr((data.skills?.softSkills || []).join(', '));
      } catch (err) {
        console.error('Failed to load resume:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const payload = {
        ...resumeData,
        skills: {
          technical: techSkillsStr.split(',').map(s => s.trim()).filter(Boolean),
          frameworks: frameworksStr.split(',').map(s => s.trim()).filter(Boolean),
          tools: toolsStr.split(',').map(s => s.trim()).filter(Boolean),
          softSkills: softSkillsStr.split(',').map(s => s.trim()).filter(Boolean)
        }
      };

      const res = await api.put('/resume', payload);
      setResumeData(res.data.resume);
      setSaveMessage('Resume and ATS Score updated successfully!');
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveMessage('Failed to save resume changes.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Education Helpers
  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '' }
      ]
    });
  };

  const removeEducation = (index) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== index)
    });
  };

  // Experience Helpers
  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        { company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '' }
      ]
    });
  };

  const removeExperience = (index) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== index)
    });
  };

  // Project Helpers
  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        { title: '', techStack: [], description: '', liveLink: '', githubLink: '' }
      ]
    });
  };

  const removeProject = (index) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Action Bar */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live ATS Optimization
          </div>
          <h1 className="text-2xl font-bold text-white">Smart Resume Builder</h1>
          <p className="text-xs text-slate-400">
            Build ATS-compliant resumes with real-time keyword scoring and professional formatting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-xs text-emerald-400 font-medium animate-pulse">{saveMessage}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Scoring ATS...' : 'Save & Calculate ATS'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor & Right ATS Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Editor Form (7 Cols) */}
        <div className="no-print lg:col-span-7 space-y-6">
          
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            {[
              { id: 'personal', label: 'Contact', icon: User },
              { id: 'education', label: 'Education', icon: GraduationCap },
              { id: 'experience', label: 'Experience', icon: Briefcase },
              { id: 'projects', label: 'Projects', icon: Code },
              { id: 'skills', label: 'Skills', icon: Layers }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Tab 1: Personal & Contact */}
          {activeTab === 'personal' && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Personal Contact & Professional Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, fullName: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Location (City, Country)</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">GitHub / Portfolio URL</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, github: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Executive Summary (2-3 Impactful Sentences)</label>
                <textarea
                  rows={3}
                  value={resumeData.personalInfo.summary}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, summary: e.target.value }
                  })}
                  placeholder="Software Engineer specialized in high-performance web applications and distributed architectures..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {/* Form Tab 2: Education */}
          {activeTab === 'education' && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white">Education Details</h3>
                <button
                  onClick={addEducation}
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Degree
                </button>
              </div>

              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative">
                  <button
                    onClick={() => removeEducation(idx)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Institution / University</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[idx].institution = e.target.value;
                          setResumeData({ ...resumeData, education: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Degree & Major</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[idx].degree = e.target.value;
                          setResumeData({ ...resumeData, education: updated });
                        }}
                        placeholder="B.S. in Computer Science"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Timeline (e.g. 2022 - 2026)</label>
                      <input
                        type="text"
                        value={`${edu.startYear} - ${edu.endYear}`}
                        onChange={(e) => {
                          const parts = e.target.value.split('-');
                          const updated = [...resumeData.education];
                          updated[idx].startYear = parts[0]?.trim() || '';
                          updated[idx].endYear = parts[1]?.trim() || '';
                          setResumeData({ ...resumeData, education: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">CGPA / Honors</label>
                      <input
                        type="text"
                        value={edu.grade}
                        onChange={(e) => {
                          const updated = [...resumeData.education];
                          updated[idx].grade = e.target.value;
                          setResumeData({ ...resumeData, education: updated });
                        }}
                        placeholder="CGPA: 9.2 / 10.0"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Tab 3: Experience */}
          {activeTab === 'experience' && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white">Experience & Internships</h3>
                <button
                  onClick={addExperience}
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative">
                  <button
                    onClick={() => removeExperience(idx)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[idx].company = e.target.value;
                          setResumeData({ ...resumeData, experience: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Role Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[idx].role = e.target.value;
                          setResumeData({ ...resumeData, experience: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Duration (e.g. May 2025 - Aug 2025)</label>
                      <input
                        type="text"
                        value={`${exp.startDate} - ${exp.endDate}`}
                        onChange={(e) => {
                          const parts = e.target.value.split('-');
                          const updated = [...resumeData.experience];
                          updated[idx].startDate = parts[0]?.trim() || '';
                          updated[idx].endDate = parts[1]?.trim() || '';
                          setResumeData({ ...resumeData, experience: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[idx].location = e.target.value;
                          setResumeData({ ...resumeData, experience: updated });
                        }}
                        placeholder="Remote / City"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Bullet Point Description (Include Quantifiable Metrics!)</label>
                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...resumeData.experience];
                        updated[idx].description = e.target.value;
                        setResumeData({ ...resumeData, experience: updated });
                      }}
                      placeholder="Reduced latency by 32% using Node.js caching..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Tab 4: Projects */}
          {activeTab === 'projects' && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white">Technical Projects</h3>
                <button
                  onClick={addProject}
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3 relative">
                  <button
                    onClick={() => removeProject(idx)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[idx].title = e.target.value;
                          setResumeData({ ...resumeData, projects: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Tech Stack (comma-separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[idx].techStack = e.target.value.split(',').map(s => s.trim());
                          setResumeData({ ...resumeData, projects: updated });
                        }}
                        placeholder="React, Node.js, Socket.io, MongoDB"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Live URL</label>
                      <input
                        type="text"
                        value={proj.liveLink}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[idx].liveLink = e.target.value;
                          setResumeData({ ...resumeData, projects: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">GitHub Repo URL</label>
                      <input
                        type="text"
                        value={proj.githubLink}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[idx].githubLink = e.target.value;
                          setResumeData({ ...resumeData, projects: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Key Description & Architectural Impact</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...resumeData.projects];
                        updated[idx].description = e.target.value;
                        setResumeData({ ...resumeData, projects: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Tab 5: Skills */}
          {activeTab === 'skills' && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Skills Classification</h3>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1">Languages & Core Technical (comma separated)</label>
                <input
                  type="text"
                  value={techSkillsStr}
                  onChange={(e) => setTechSkillsStr(e.target.value)}
                  placeholder="JavaScript, TypeScript, Python, Go, C++, SQL"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Frameworks & Libraries</label>
                <input
                  type="text"
                  value={frameworksStr}
                  onChange={(e) => setFrameworksStr(e.target.value)}
                  placeholder="React 18, Node.js, Express, Next.js, Tailwind CSS"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Developer Tools & Infrastructure</label>
                <input
                  type="text"
                  value={toolsStr}
                  onChange={(e) => setToolsStr(e.target.value)}
                  placeholder="Docker, Git, MongoDB, PostgreSQL, Redis, AWS"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Soft & Collaborative Skills</label>
                <input
                  type="text"
                  value={softSkillsStr}
                  onChange={(e) => setSoftSkillsStr(e.target.value)}
                  placeholder="System Design, Agile Scrum, Problem Solving"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Side: ATS Score Meter & Real-Time Resume Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ATS Score Card */}
          <div className="no-print p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                ATS Compatibility Index
              </span>
              <span className="text-2xl font-extrabold text-white">
                {resumeData.atsScore}<span className="text-sm text-slate-500 font-normal">/100</span>
              </span>
            </div>

            {/* Score Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  resumeData.atsScore >= 85
                    ? 'bg-emerald-500'
                    : resumeData.atsScore >= 70
                    ? 'bg-brand-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${resumeData.atsScore}%` }}
              />
            </div>

            {/* Recommendations */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                ATS Feedback & Checklist:
              </span>
              {(resumeData.atsFeedback || []).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Document Preview Container */}
          <div className="print-area bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 font-serif leading-relaxed border border-slate-200">
            
            {/* Resume Header */}
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <h1 className="text-2xl font-black tracking-tight text-slate-950 font-sans uppercase">
                {resumeData.personalInfo?.fullName || 'Alex Rivera'}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 font-sans mt-1">
                {resumeData.personalInfo?.email && <span>{resumeData.personalInfo.email}</span>}
                {resumeData.personalInfo?.phone && <span>• {resumeData.personalInfo.phone}</span>}
                {resumeData.personalInfo?.location && <span>• {resumeData.personalInfo.location}</span>}
                {resumeData.personalInfo?.linkedin && <span>• LinkedIn</span>}
                {resumeData.personalInfo?.github && <span>• GitHub</span>}
              </div>
            </div>

            {/* Summary */}
            {resumeData.personalInfo?.summary && (
              <div className="mt-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-0.5 mb-1.5">
                  Professional Summary
                </h2>
                <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
                  {resumeData.personalInfo.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {resumeData.experience?.length > 0 && (
              <div className="mt-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-0.5 mb-2">
                  Experience
                </h2>
                <div className="space-y-2.5 font-sans">
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{exp.role} – {exp.company}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed mt-0.5">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education?.length > 0 && (
              <div className="mt-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-0.5 mb-2">
                  Education
                </h2>
                <div className="space-y-1.5 font-sans">
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{edu.institution}</span>
                        <span className="text-slate-600"> – {edu.degree} ({edu.grade})</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{edu.startYear} - {edu.endYear}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resumeData.projects?.length > 0 && (
              <div className="mt-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-0.5 mb-2">
                  Technical Projects
                </h2>
                <div className="space-y-2 font-sans">
                  {resumeData.projects.map((proj, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{proj.title}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed mt-0.5">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-0.5 mb-1.5">
                Technical Skills
              </h2>
              <div className="text-[10.5px] text-slate-700 font-sans space-y-0.5">
                {techSkillsStr && <div><strong className="text-slate-900">Languages:</strong> {techSkillsStr}</div>}
                {frameworksStr && <div><strong className="text-slate-900">Frameworks:</strong> {frameworksStr}</div>}
                {toolsStr && <div><strong className="text-slate-900">Tools & DB:</strong> {toolsStr}</div>}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ResumeBuilder;
