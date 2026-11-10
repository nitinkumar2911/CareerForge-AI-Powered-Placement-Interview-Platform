import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Shield,
  Users,
  Briefcase,
  FileText,
  Bot,
  Award,
  TrendingUp,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Mail,
  Send,
  Clock,
  ExternalLink,
  DollarSign
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [analyticsRequests, setAnalyticsRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'requests'
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [sharingLoading, setSharingLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes, requestsRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/users'),
        api.get('/analytics/requests').catch(() => ({ data: { requests: [] } }))
      ]);

      setStats(analyticsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setAnalyticsRequests(requestsRes.data.requests || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setActionMsg(`User role updated to ${newRole}`);
      setTimeout(() => setActionMsg(''), 3000);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setActionMsg('User removed successfully');
      setTimeout(() => setActionMsg(''), 3000);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleShareAnalytics = async (requestId, requesterEmail) => {
    setSharingLoading(true);
    try {
      const res = await api.post(`/analytics/share/${requestId}`, {
        producerNotes: 'Full institutional placement analytics dossier authorized and transmitted by Platform Producer (Nitin Kumar).'
      });
      setActionMsg(`Placement analytics dossier successfully emailed to ${requesterEmail}`);
      setTimeout(() => setActionMsg(''), 4000);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch analytics dossier.');
    } finally {
      setSharingLoading(false);
    }
  };

  const pendingRequestsCount = analyticsRequests.filter(r => r.status === 'pending').length;

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            System Administration Console • Producer Authorization Control
          </div>
          <h1 className="text-3xl font-extrabold text-white">Platform Health & Analytics Command</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Real-time control over university placements, recruiter pipelines, verified AI evaluations, and producer data-sharing requests.
          </p>
        </div>

        {actionMsg && (
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl animate-pulse">
            ✓ {actionMsg}
          </span>
        )}
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Students</span>
          <div className="text-2xl font-bold text-white mt-1">{stats?.totalStudents || 0}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Recruiters</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats?.totalRecruiters || 0}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Active Jobs</span>
          <div className="text-2xl font-bold text-brand-400 mt-1">{stats?.activeJobs || 0}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Avg Package</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{stats?.avgSalary || 'Not Disclosed'}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Placement Rate</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{stats?.placementRate || '0%'}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Data Requests</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{analyticsRequests.length}</div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Market Insights & Pipeline
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <span>📬 Analytics Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px]">
              {pendingRequestsCount} new
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Manage Users ({users.length})
        </button>
      </div>

      {/* Tab 1: Analytics & Market */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Top In-Demand Tech Skills */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Most In-Demand Skills in Active Jobs
            </h3>
            <div className="space-y-2.5">
              {(stats?.topSkills || []).map((skillObj, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{skillObj.skill}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, skillObj.count * 30)}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">{skillObj.count} jobs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Pipeline Distribution */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Platform Application Stages Breakdown
            </h3>
            <div className="space-y-3">
              {['Applied', 'Shortlisted', 'Interviewing', 'Offered'].map((stage) => {
                const count = stats?.applicationBreakdown?.[stage] || 0;
                return (
                  <div key={stage} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{stage}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 font-mono text-[11px] font-bold">
                      {count} candidates
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Analytics Requests & Sharing (PRODUCER CONTROL) */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  Placement Analytics Requests & Dispatches
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Students and recruiters request comprehensive institutional placement data. As Platform Producer, you can authorize and email the entire analytics dossier directly.
                </p>
              </div>
              <div className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold">
                Producer Email: nitin2911.in@gmail.com
              </div>
            </div>

            {analyticsRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                No placement analytics requests received yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Requester</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Organization</th>
                      <th className="p-3">Purpose stated</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Producer Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {analyticsRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-white">
                          <div>{req.requesterName}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{req.requesterEmail}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.requesterRole === 'student'
                              ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {req.requesterRole}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{req.organization || 'Campus'}</td>
                        <td className="p-3 text-slate-300 max-w-xs truncate" title={req.purpose}>
                          {req.purpose}
                        </td>
                        <td className="p-3">
                          {req.status === 'shared' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Shared
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleShareAnalytics(req._id, req.requesterEmail)}
                            disabled={sharingLoading}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow ${
                              req.status === 'shared'
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            {req.status === 'shared' ? 'Resend Whole Dossier' : 'Share Whole Analytics'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Manage Users */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-white">Platform Users Directory</h3>
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Filter by name or email..."
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-purple-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Affiliation / College</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{u.email}</div>
                    </td>
                    <td className="p-3 text-slate-400">
                      {u.college || u.companyName || 'General'}
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-[11px] font-semibold outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
