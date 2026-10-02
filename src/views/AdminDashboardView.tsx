import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Dumbbell,
  MessageSquare,
  BarChart3,
  Plus,
  Trash2,
  Star,
  X,
  RefreshCw,
  Database,
  UserX,
  UserCheck,
  Shield,
  Activity,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { Exercise, UserFeedback, UserProfile } from '../types';
import { SupabaseService, isSupabaseConfigured } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardView: React.FC = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'exercises' | 'feedback' | 'users' | 'aiLogs' | 'auditLogs'>('analytics');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [aiUsageLogs, setAiUsageLogs] = useState<any[]>([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Feedback filter & status state
  const [feedbackFilter, setFeedbackFilter] = useState<string>('All');
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<string, 'New' | 'Reviewed' | 'Resolved'>>({});

  // Load real Supabase data on mount
  useEffect(() => {
    loadAdminData();
  }, [session]);

  const loadAdminData = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const [profilesData, exercisesData, feedbackData] = await Promise.all([
          SupabaseService.fetchAllProfiles(),
          SupabaseService.fetchExercises(true),
          SupabaseService.fetchAllFeedback()
        ]);

        setUserProfiles(profilesData || []);
        setExercises(exercisesData || []);
        setFeedbackList(feedbackData || []);

        // Also fetch backend AI usage & audit logs if admin session token available
        if (session?.access_token) {
          fetchBackendLogs(session.access_token);
        }
      } catch (e) {
        console.error('Error fetching Supabase admin data:', e);
      }
    }
    setIsLoading(false);
  };

  const fetchBackendLogs = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [aiRes, logsRes] = await Promise.all([
        fetch('/api/admin/ai-usage', { headers }).then(r => r.json()).catch(() => ({ logs: [] })),
        fetch('/api/admin/logs', { headers }).then(r => r.json()).catch(() => ({ logs: [] }))
      ]);

      if (aiRes.success && aiRes.logs) setAiUsageLogs(aiRes.logs);
      if (logsRes.success && logsRes.logs) setAdminAuditLogs(logsRes.logs);
    } catch (err) {
      console.error('Error loading backend admin logs:', err);
    }
  };

  const handleStatusChange = async (id: string, status: 'New' | 'Reviewed' | 'Resolved', isApproved?: boolean) => {
    setFeedbackStatuses(prev => ({ ...prev, [id]: status }));
    if (isSupabaseConfigured()) {
      try {
        await SupabaseService.updateFeedbackStatus(id, status, undefined, isApproved);
        setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, status, isApproved: isApproved ?? f.isApproved } : f));
      } catch (err) {
        console.error('Error updating feedback status:', err);
      }
    }
  };

  const handleToggleApproveFeedback = async (fb: UserFeedback) => {
    const nextApproved = !fb.isApproved;
    if (isSupabaseConfigured()) {
      try {
        await SupabaseService.updateFeedbackStatus(fb.id, fb.status || 'Reviewed', undefined, nextApproved);
        setFeedbackList(prev => prev.map(f => f.id === fb.id ? { ...f, isApproved: nextApproved } : f));
      } catch (err) {
        console.error('Error approving feedback:', err);
      }
    }
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    if (!session?.access_token) return;
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    setActionLoadingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUserProfiles(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleUserRole = async (user: UserProfile) => {
    if (!session?.access_token) return;
    const nextAdmin = !user.isAdmin;
    setActionLoadingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ isAdmin: nextAdmin })
      });
      const data = await res.json();
      if (data.success) {
        setUserProfiles(prev => prev.map(u => u.id === user.id ? { ...u, isAdmin: nextAdmin, role: nextAdmin ? 'admin' : 'user' } : u));
      }
    } catch (err) {
      console.error('Error toggling user role:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredFeedback = feedbackList.filter(fb => {
    if (feedbackFilter === 'All') return true;
    return fb.category === feedbackFilter;
  });

  // New Exercise Form State
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [exName, setExName] = useState('');
  const [exCategory, setExCategory] = useState<Exercise['category']>('Strength');
  const [exDifficulty, setExDifficulty] = useState<Exercise['difficulty']>('Beginner');
  const [exTarget, setExTarget] = useState('');
  const [exEquipment, setExEquipment] = useState('None (Bodyweight)');
  const [exInstructions, setExInstructions] = useState('');
  const [exSafety, setExSafety] = useState('');

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName.trim()) return;

    const exercisePayload: Omit<Exercise, 'id'> = {
      name: exName.trim(),
      category: exCategory,
      difficulty: exDifficulty,
      targetArea: exTarget || 'Full Body',
      instructions: exInstructions.split('\n').filter(Boolean),
      defaultReps: '12 reps',
      defaultSets: 3,
      defaultRestSeconds: 45,
      safetyGuidance: exSafety || 'Maintain proper posture.',
      equipmentNeeded: exEquipment,
      iconType: 'generic'
    };

    try {
      let created: Exercise | null = null;
      if (isSupabaseConfigured()) {
        created = await SupabaseService.addExercise(exercisePayload);
      }

      if (!created) {
        created = { id: 'ex_' + Date.now(), ...exercisePayload };
      }

      setExercises([created, ...exercises]);
      setShowAddExModal(false);
      setExName('');
      setExInstructions('');
      setExSafety('');
    } catch (err) {
      console.error('Error adding exercise:', err);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    try {
      if (isSupabaseConfigured()) {
        await SupabaseService.deleteExercise(id);
      }
      setExercises(exercises.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting exercise:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 border border-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30 shadow-xs">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-heading">FitMate Admin Portal</h1>
              <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Master Control
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-0.5">Real-time platform analytics, user monitoring, exercise CRUD, and audit logs.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-blue-950/80 p-1.5 rounded-2xl border border-blue-800/80 text-xs">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'users', label: `Users (${userProfiles.length})`, icon: Users },
            { id: 'exercises', label: `Catalog (${exercises.length})`, icon: Dumbbell },
            { id: 'feedback', label: `Feedback (${feedbackList.length})`, icon: MessageSquare },
            { id: 'aiLogs', label: `AI Usage (${aiUsageLogs.length})`, icon: Activity },
            { id: 'auditLogs', label: `Audit Trail (${adminAuditLogs.length})`, icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-blue-200 hover:text-white'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Database Connection Notice */}
      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-700 shadow-2xs">
        <div className="flex items-center gap-2 font-medium">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Supabase Cloud Integration: <strong>{isSupabaseConfigured() ? 'Active Database Connected' : 'Local Standalone Mode'}</strong></span>
        </div>
        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Total Users</span>
              <span className="text-3xl font-black text-slate-900 font-mono">{userProfiles.length}</span>
              <span className="text-[11px] text-emerald-600 font-bold block">Registered Profiles</span>
            </div>
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">AI Operations</span>
              <span className="text-3xl font-black text-slate-900 font-mono">{aiUsageLogs.length}</span>
              <span className="text-[11px] text-blue-600 font-bold block">Gemini API Invocations</span>
            </div>
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Exercise Catalog</span>
              <span className="text-3xl font-black text-slate-900 font-mono">{exercises.length}</span>
              <span className="text-[11px] text-blue-600 font-bold block">Active Database Rows</span>
            </div>
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Feedback Items</span>
              <span className="text-3xl font-black text-slate-900 font-mono">{feedbackList.length}</span>
              <span className="text-[11px] text-amber-600 font-bold block">Approved: {feedbackList.filter(f => f.isApproved).length}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 font-heading">Registered Platform Users</h3>
            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {userProfiles.length} Total Registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">User Profile</th>
                  <th className="p-3.5">Experience</th>
                  <th className="p-3.5">Target Days</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {userProfiles.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      {u.name}
                      <span className="block text-[10px] text-slate-500 font-normal font-mono">{u.email}</span>
                    </td>
                    <td className="p-3.5">{u.experience}</td>
                    <td className="p-3.5 font-mono text-blue-600 font-bold">{u.availableDays} Days / Wk</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${u.status === 'suspended'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                        {u.status === 'suspended' ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${u.isAdmin
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {u.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        disabled={actionLoadingId === u.id}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${u.status === 'suspended'
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                            : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
                          }`}
                      >
                        {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                      </button>
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        disabled={actionLoadingId === u.id}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-[10px] font-bold transition-colors"
                      >
                        {u.isAdmin ? 'Demote' : 'Promote Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. EXERCISES MANAGEMENT TAB */}
      {activeTab === 'exercises' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-heading">Exercise Catalog Management</h3>
            <button
              onClick={() => setShowAddExModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> Add New Exercise
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exercises.map((ex) => (
              <div key={ex.id} className="bg-white border border-slate-200/90 p-4.5 rounded-2xl flex items-start justify-between gap-3 shadow-xs hover:border-blue-200 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {ex.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">{ex.difficulty}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{ex.name}</h4>
                  <p className="text-[11px] text-slate-500">Target: {ex.targetArea} • Equipment: {ex.equipmentNeeded}</p>
                </div>

                <button
                  onClick={() => handleDeleteExercise(ex.id)}
                  className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors"
                  title="Delete exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 font-heading">User Feedback & Support Triage</h3>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Category:</span>
              <select
                value={feedbackFilter}
                onChange={(e) => setFeedbackFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="All">All Categories ({feedbackList.length})</option>
                <option value="General Feedback">General Feedback</option>
                <option value="AI Assistant">AI Assistant</option>
                <option value="Workout">Workout</option>
                <option value="Exercise">Exercise</option>
                <option value="Progress Tracking">Progress Tracking</option>
                <option value="Recommendations">Recommendations</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFeedback.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-slate-500 text-xs">
                No feedback items found for this category.
              </div>
            ) : (
              filteredFeedback.map((fb) => (
                <div key={fb.id} className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{fb.userName || 'User'}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                        {fb.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(fb.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        ))}
                      </div>

                      <select
                        value={feedbackStatuses[fb.id] || 'New'}
                        onChange={(e) => handleStatusChange(fb.id, e.target.value as any)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border focus:outline-none ${(feedbackStatuses[fb.id] || 'New') === 'New'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : (feedbackStatuses[fb.id] || 'New') === 'Reviewed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                      >
                        <option value="New">Status: New</option>
                        <option value="Reviewed">Status: Reviewed</option>
                        <option value="Resolved">Status: Resolved</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    "{fb.message}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>User ID: {fb.userId}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleApproveFeedback(fb)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${fb.isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                      >
                        {fb.isApproved ? '✓ Featured on Landing Page' : '+ Feature on Landing Page'}
                      </button>
                      <span>Submitted: {new Date(fb.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. AI USAGE LOGS TAB */}
      {activeTab === 'aiLogs' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 font-heading">AI Usage & Gemini API Monitor</h3>
            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {aiUsageLogs.length} Total Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Tokens Prompt/Resp</th>
                  <th className="p-3.5">Model</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {aiUsageLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-sans text-xs">
                      No AI usage logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  aiUsageLogs.map((log: any, idx: number) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50">
                      <td className="p-3.5 text-slate-500">{new Date(log.created_at || Date.now()).toLocaleString()}</td>
                      <td className="p-3.5 font-sans font-bold text-slate-900">{log.action || 'generate_content'}</td>
                      <td className="p-3.5 text-blue-600">{log.prompt_tokens || 0} / {log.completion_tokens || 0}</td>
                      <td className="p-3.5 text-slate-600">{log.model_name || 'gemini-2.5-flash'}</td>
                      <td className="p-3.5">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-extrabold border border-emerald-200 font-sans">
                          {log.status || 'success'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ADMIN AUDIT TRAIL TAB */}
      {activeTab === 'auditLogs' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 font-heading">Admin Audit Trail Logs</h3>
            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {adminAuditLogs.length} Security Actions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5">Admin ID</th>
                  <th className="p-3.5">Action Executed</th>
                  <th className="p-3.5">Target Type</th>
                  <th className="p-3.5">Target ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {adminAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-sans text-xs">
                      No admin security actions recorded in current session.
                    </td>
                  </tr>
                ) : (
                  adminAuditLogs.map((log: any, idx: number) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50">
                      <td className="p-3.5 text-slate-500">{new Date(log.created_at || Date.now()).toLocaleString()}</td>
                      <td className="p-3.5 text-amber-600 font-bold">{log.admin?.name || log.admin_id || 'Admin'}</td>
                      <td className="p-3.5 font-sans font-bold text-slate-900">{log.action}</td>
                      <td className="p-3.5 text-slate-600">{log.target_type || '-'}</td>
                      <td className="p-3.5 text-slate-400">{log.target_id || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD EXERCISE MODAL */}
      {showAddExModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">Add New Exercise to Catalog</h3>
              <button onClick={() => setShowAddExModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExercise} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Incline Dumbbell Bench Press"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Category</label>
                  <select
                    value={exCategory}
                    onChange={(e) => setExCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Core">Core</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Mobility">Mobility</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Difficulty</label>
                  <select
                    value={exDifficulty}
                    onChange={(e) => setExDifficulty(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Target Muscle Group</label>
                <input
                  type="text"
                  placeholder="e.g. Upper Chest & Shoulders"
                  value={exTarget}
                  onChange={(e) => setExTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Instructions (1 step per line)</label>
                <textarea
                  rows={3}
                  placeholder="Step 1...&#10;Step 2..."
                  value={exInstructions}
                  onChange={(e) => setExInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all mt-2"
              >
                Save Exercise to Database
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
