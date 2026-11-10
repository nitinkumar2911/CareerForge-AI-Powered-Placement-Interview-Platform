import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Bot,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Code,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  Server,
  Smartphone,
  Database,
  Cpu,
  HardDrive,
  Palette,
  Box,
  Radio,
  Search,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  Video
} from 'lucide-react';

const DOMAINS = [
  {
    id: 'Full Stack Developer',
    title: 'Full Stack Developer',
    category: 'Software Engineering',
    desc: 'MERN & Next.js, API Architecture, Full-Stack Auth, SSR vs CSR, System Design',
    icon: Zap,
    color: 'from-brand-500 to-indigo-500'
  },
  {
    id: 'Frontend Developer',
    title: 'Frontend Developer',
    category: 'Software Engineering',
    desc: 'React 18 internals, Virtual DOM, Core Web Vitals, CSS Architecture, State Management',
    icon: Code,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'Backend Engineer',
    title: 'Backend Engineer',
    category: 'Software Engineering',
    desc: 'Node.js/Express, Libuv Event Loop, Redis Caching, DB Indexing, Microservices & Sagas',
    icon: Layers,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'AI / LLM Engineer',
    title: 'AI / LLM Engineer',
    category: 'AI & Data Science',
    desc: 'Generative AI, Self-Attention Transformers, Enterprise RAG, Vector DBs, LoRA Fine-Tuning',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'Data Scientist & Machine Learning',
    title: 'Data Scientist & ML',
    category: 'AI & Data Science',
    desc: 'Bias-Variance Tradeoff, Feature Engineering, Classification Metrics, Deep Learning, MLOps',
    icon: Bot,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'Data Engineer',
    title: 'Data Engineer',
    category: 'AI & Data Science',
    desc: 'Apache Spark, Distributed Compute, Kafka Streaming, Star Schemas, Airflow Pipelines',
    icon: Database,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'DevOps & Cloud Engineer',
    title: 'DevOps & Cloud Engineer',
    category: 'Cloud & Security',
    desc: 'Docker internals, Kubernetes Orchestration, CI/CD, Terraform IaC, Prometheus Observability',
    icon: Server,
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'Cybersecurity Analyst & Engineer',
    title: 'Cybersecurity & Security',
    category: 'Cloud & Security',
    desc: 'OWASP Top 10, SSRF/Access Control, TLS 1.3 PKI, Zero Trust Architecture, Penetration Testing',
    icon: Shield,
    color: 'from-rose-500 to-red-600'
  },
  {
    id: 'System Design & Cloud Architect',
    title: 'System Design & Architect',
    category: 'Architecture & Systems',
    desc: 'CAP Theorem, Consistent Hashing, Sharding, WhatsApp Scale Messaging, Multi-Region HA',
    icon: Cpu,
    color: 'from-indigo-500 to-blue-700'
  },
  {
    id: 'Database Administrator (DBA)',
    title: 'Database Admin (DBA)',
    category: 'Architecture & Systems',
    desc: 'ACID & MVCC Isolation, EXPLAIN Plans, Index Tuning, Patroni HA Replication, Disaster Recovery',
    icon: HardDrive,
    color: 'from-teal-500 to-emerald-600'
  },
  {
    id: 'Mobile App Developer',
    title: 'Mobile App Developer',
    category: 'Mobile & QA',
    desc: 'React Native JSI/Fabric, Offline-First SQLite Sync, 60fps Optimization, Keychain Security',
    icon: Smartphone,
    color: 'from-sky-500 to-indigo-500'
  },
  {
    id: 'QA & Test Automation Engineer',
    title: 'QA & Test Automation',
    category: 'Mobile & QA',
    desc: 'Test Pyramid, Cypress vs Playwright CDP, Page Object Model, k6 Performance, Flaky Tests',
    icon: CheckCircle2,
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'UI/UX & Product Designer',
    title: 'UI/UX & Product Design',
    category: 'Design & Product',
    desc: 'Enterprise Figma Design Systems, Tokens, Double Diamond, WCAG Accessibility, Usability Heuristics',
    icon: Palette,
    color: 'from-fuchsia-500 to-pink-600'
  },
  {
    id: 'Blockchain & Web3 Developer',
    title: 'Blockchain & Web3',
    category: 'Architecture & Systems',
    desc: 'Solidity Gas Optimization, Reentrancy Attacks, ERC Standards, Upgradable Proxies, ZK-Rollups',
    icon: Box,
    color: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'Embedded Systems & IoT Engineer',
    title: 'Embedded Systems & IoT',
    category: 'Architecture & Systems',
    desc: 'ARM Cortex-M Architecture, ISR Concurrency, UART/SPI/I2C/CAN, FreeRTOS, Low-Power MQTT',
    icon: Radio,
    color: 'from-orange-500 to-red-500'
  }
];

const CATEGORIES = [
  'All',
  'Software Engineering',
  'AI & Data Science',
  'Cloud & Security',
  'Architecture & Systems',
  'Mobile & QA',
  'Design & Product'
];

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [useCustomRole, setUseCustomRole] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState('Mid');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter domains based on category and search query
  const filteredDomains = useMemo(() => {
    return DOMAINS.filter((d) => {
      const matchesCategory =
        selectedCategory === 'All' || d.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        d.title.toLowerCase().includes(query) ||
        d.desc.toLowerCase().includes(query) ||
        d.id.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeRoleName = useCustomRole
    ? customRole.trim() || 'Custom Role'
    : selectedRole;

  const handleLaunchInterview = async () => {
    const finalRole = useCustomRole ? customRole.trim() : selectedRole;
    if (!finalRole) {
      setError('Please select or specify an interview domain.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/interviews', {
        role: finalRole,
        difficulty
      });
      const sessionId = res.data.session._id;
      localStorage.setItem('careerforge_speech_enabled', speechEnabled ? 'true' : 'false');
      navigate(`/interview/room/${sessionId}`);
    } catch (err) {
      console.error('Failed to create interview session:', err);
      setError('Unable to launch interview session. Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          5-Question Real-Time Technical Simulator
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Configure Your Technical AI Interview
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Simulate an authentic industry technical round across 15+ specialized domains. Evaluates exactly 5 in-depth domain questions with live AI feedback and video recording for recruiters.
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-brand-400" />
            Exactly 5 Questions
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            100% Domain-Tailored
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Video + Audio Recorded for Recruiter
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-semibold">
          {error}
        </div>
      )}

      {/* Step 1: Select Domain */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              1. Choose Your Target Domain & Specialization ({DOMAINS.length} Domains Available)
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any engineering domain. All 5 questions will strictly test concepts from this discipline.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter domains (e.g. AI, React, Cloud)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-brand-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Domains Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDomains.map((domain) => {
            const Icon = domain.icon;
            const isSelected = !useCustomRole && selectedRole === domain.id;

            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => {
                  setSelectedRole(domain.id);
                  setUseCustomRole(false);
                }}
                className={`p-5 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-slate-800/95 border-brand-500 ring-2 ring-brand-500/30 shadow-xl'
                    : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${domain.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-brand-400" />
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
                        {domain.category.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                    {domain.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {domain.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>5 Tailored Questions</span>
                  <span className={`${isSelected ? 'text-brand-400 font-semibold' : ''}`}>
                    {isSelected ? 'Selected' : 'Select Domain →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Role Input Box */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">Looking for another specialized role?</span>
              <span className="text-[11px] text-slate-400">
                Enter any niche engineering role (e.g., Robotics Engineer, Game Developer, SRE).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={customRole}
              onChange={(e) => {
                setCustomRole(e.target.value);
                setUseCustomRole(true);
              }}
              placeholder="e.g. SRE / Systems Engineer"
              className={`px-3 py-2 rounded-xl bg-slate-800 border text-white text-xs outline-none w-full sm:w-60 ${
                useCustomRole ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-slate-700'
              }`}
            />
            {customRole && (
              <button
                type="button"
                onClick={() => setUseCustomRole(true)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  useCustomRole ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Use Custom
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Difficulty & Preferences */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
            2. Select Evaluation Rigor & Experience Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Junior', label: 'Junior / Intern', sub: 'Foundations & Core Principles' },
              { id: 'Mid', label: 'Mid-Level', sub: 'Practical Architecture & Trade-offs' },
              { id: 'Senior', label: 'Senior Staff', sub: 'Enterprise Scale & High Availability' }
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setDifficulty(lvl.id)}
                className={`p-3.5 rounded-xl text-center border transition-all ${
                  difficulty === lvl.id
                    ? 'bg-brand-600/20 border-brand-500 text-white font-bold ring-1 ring-brand-500/40'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{lvl.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{lvl.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-brand-400">
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white">AI Voice Narration (Text-to-Speech)</div>
              <div className="text-[11px] text-slate-400">The AI interviewer speaks each question aloud in natural voice</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              speechEnabled ? 'bg-brand-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                speechEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Launch Action */}
      <div className="text-center pt-2 space-y-3">
        <button
          onClick={handleLaunchInterview}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-xl shadow-brand-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Bot className="w-5 h-5" />
          {loading ? 'Initializing Interview Room...' : `Begin ${activeRoleName} Interview (5 Questions)`}
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] text-slate-500">
          Selected Domain: <strong className="text-slate-300">{activeRoleName}</strong> • Rigor: <strong className="text-slate-300">{difficulty}</strong> • Audio & Video recording automatically attached to recruiter applications.
        </p>
      </div>

    </div>
  );
};

export default InterviewSetup;
