import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  X,
  Trash2,
  AlertTriangle,
  Loader2,
  Lock,
  Briefcase,
  CheckCircle2,
  Clock,
  Activity,
  FolderKanban,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

const STATUS_CONFIG = {
  DONE: {
    label: 'Done',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.1)',
    border: 'rgba(0,212,255,0.25)',
  },
  REVIEW: {
    label: 'Review',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
    border: 'rgba(167,139,250,0.25)',
  },
  TODO: {
    label: 'To Do',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.25)',
  },
};

const PRIORITY_CONFIG = {
  HIGH: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  LOW: { label: 'Low', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
};

export default function Team() {
  const { user: currentUser } = useAuth();
  const [members,         setMembers]         = useState([]);
  const [roles,           setRoles]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [formData,        setFormData]        = useState({ name: '', email: '', password: '', roleId: '' });
  const [inviteError,     setInviteError]     = useState('');
  const [inviteLoading,   setInviteLoading]   = useState(false);

  // Delete modal state
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [deleteLoading,   setDeleteLoading]   = useState(false);
  const [deleteError,     setDeleteError]     = useState('');

  // Work Profile modal state
  const [selectedWorkUser, setSelectedWorkUser] = useState(null);
  const [workModalTab,     setWorkModalTab]     = useState('tasks'); // 'tasks' | 'activities'

  useEffect(() => {
    fetchTeam();
    fetchRoles();

    const socket = getSocket();
    if (socket) {
      socket.on('user:created', () => fetchTeam());
      socket.on('user:deleted', ({ id }) => {
        setMembers(prev => prev.filter(m => m.id !== id));
        if (selectedWorkUser?.id === id) setSelectedWorkUser(null);
      });
      socket.on('task:created', () => fetchTeam());
      socket.on('task:updated', () => fetchTeam());
      socket.on('activity:created', () => fetchTeam());
    }

    return () => {
      if (socket) {
        socket.off('user:created');
        socket.off('user:deleted');
        socket.off('task:created');
        socket.off('task:updated');
        socket.off('activity:created');
      }
    };
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setMembers(res.data.data);
        // If a member's work modal is currently open, refresh their data live
        if (selectedWorkUser) {
          const updated = res.data.data.find(u => u.id === selectedWorkUser.id);
          if (updated) setSelectedWorkUser(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      if (res.data.success && res.data.data.length > 0) {
        setRoles(res.data.data);
        setFormData(prev => ({ ...prev, roleId: res.data.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteLoading(true);
    try {
      const res = await api.post('/users', formData);
      if (res.data.success) {
        fetchTeam();
        setShowInviteModal(false);
        setFormData({ name: '', email: '', password: '', roleId: roles[0]?.id || '' });
      }
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/users/${deleteTarget.id}`);
      if (res.data.success) {
        setMembers(prev => prev.filter(m => m.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete member');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getDeletionStatus = (targetMember) => {
    if (currentUser?.id === targetMember.id) {
      return { canDelete: false, badge: 'Current User (You)' };
    }
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'MANAGER') {
      return { canDelete: false, badge: null };
    }
    if (currentUser?.role === 'MANAGER' && targetMember.role?.name === 'ADMIN') {
      return { canDelete: false, isProtected: true, reason: 'Administrators cannot be removed by Managers' };
    }
    if (currentUser?.role === 'MANAGER' && targetMember.role?.name === 'MANAGER') {
      return { canDelete: false, isProtected: true, reason: 'Managers cannot remove other Managers' };
    }
    return { canDelete: true };
  };

  const assignableRoles = roles.filter(r => {
    if (currentUser?.role === 'MANAGER') {
      return r.name !== 'ADMIN' && r.name !== 'MANAGER';
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#e8f4ff]">Team &amp; Work Contributions</h1>
          <p className="text-xs text-[#4a6080] mt-1">
            Track who is working on what, completed tasks, and member activity history
          </p>
        </div>
        {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
          <button
            onClick={() => {
              setInviteError('');
              if (assignableRoles.length > 0 && !formData.roleId) {
                setFormData(prev => ({ ...prev, roleId: assignableRoles[0].id }));
              }
              setShowInviteModal(true);
            }}
            className="btn-vyuha flex items-center space-x-2 px-4 py-2 rounded-xl text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-[#0d2040] overflow-hidden shadow-card" style={{ background: '#080c16' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead style={{ background: '#03040a', borderBottom: '1px solid #0d2040' }}>
              <tr>
                {['Member', 'Role', 'Status', 'Work & Progress', 'Joined', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-[#4a6080] ${
                      i === 5 ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#4a6080]">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#00d4ff]" />
                      <span>Loading team members &amp; work data...</span>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#4a6080]">
                    No members found in this organization.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const isCurrent = currentUser?.id === m.id;
                  const deletionStatus = getDeletionStatus(m);
                  const stats = m.workStats || {
                    totalTasks: m._count?.assignedTasks || 0,
                    doneCount: 0,
                    inProgressCount: 0,
                    todoCount: 0,
                    completionRate: 0,
                  };

                  return (
                    <tr key={m.id} className="border-t border-[#0d2040] hover:bg-[#0d1220] transition">
                      {/* Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 cursor-pointer"
                            onClick={() => setSelectedWorkUser(m)}
                            style={{
                              background: 'rgba(0,212,255,0.08)',
                              border: '1px solid rgba(0,212,255,0.25)',
                              color: '#00d4ff',
                              boxShadow: '0 0 10px rgba(0,212,255,0.15)',
                            }}
                          >
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span
                                onClick={() => setSelectedWorkUser(m)}
                                className="font-semibold text-[#e8f4ff] hover:text-[#00d4ff] transition cursor-pointer text-xs"
                              >
                                {m.name}
                              </span>
                              {isCurrent && (
                                <span
                                  className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                                  style={{
                                    background: 'rgba(0,212,255,0.1)',
                                    color: '#00d4ff',
                                    border: '1px solid rgba(0,212,255,0.25)',
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#4a6080]">
                              {stats.totalTasks} task{stats.totalTasks !== 1 ? 's' : ''} assigned
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider"
                          style={{
                            background:
                              m.role?.name === 'ADMIN'
                                ? 'rgba(0,212,255,0.1)'
                                : m.role?.name === 'MANAGER'
                                ? 'rgba(245,158,11,0.1)'
                                : 'rgba(124,58,237,0.1)',
                            border: `1px solid ${
                              m.role?.name === 'ADMIN'
                                ? 'rgba(0,212,255,0.25)'
                                : m.role?.name === 'MANAGER'
                                ? 'rgba(245,158,11,0.25)'
                                : 'rgba(124,58,237,0.25)'
                            }`,
                            color:
                              m.role?.name === 'ADMIN'
                                ? '#00d4ff'
                                : m.role?.name === 'MANAGER'
                                ? '#f59e0b'
                                : '#a78bfa',
                          }}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{m.role?.name || 'Member'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold" style={{ color: '#00d4ff' }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" style={{ boxShadow: '0 0 6px #00d4ff' }} />
                          <span>Active</span>
                        </span>
                      </td>

                      {/* Work & Progress */}
                      <td className="py-4 px-6 min-w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2 text-[10px]">
                            {stats.doneCount > 0 && (
                              <span className="text-[#10b981] font-bold flex items-center space-x-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{stats.doneCount} Done</span>
                              </span>
                            )}
                            {stats.inProgressCount > 0 && (
                              <span className="text-[#00d4ff] font-bold flex items-center space-x-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{stats.inProgressCount} Active</span>
                              </span>
                            )}
                            {stats.todoCount > 0 && (
                              <span className="text-[#94a3b8] font-medium">
                                {stats.todoCount} To Do
                              </span>
                            )}
                            {stats.totalTasks === 0 && (
                              <span className="text-[#4a6080] italic">No active tasks</span>
                            )}
                          </div>

                          {stats.totalTasks > 0 && (
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#0d1220' }}>
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${stats.completionRate}%`,
                                    background: 'linear-gradient(90deg, #0066ff, #00d4ff)',
                                    boxShadow: '0 0 8px rgba(0,212,255,0.4)',
                                  }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-[#e8f4ff]">{stats.completionRate}%</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-[#4a6080] text-[11px]">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center space-x-2">
                          {/* View Work Button */}
                          <button
                            onClick={() => {
                              setSelectedWorkUser(m);
                              setWorkModalTab('tasks');
                            }}
                            title={`View work & activity for ${m.name}`}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#00d4ff30] text-[#00d4ff] hover:bg-[#00d4ff15] transition-all duration-200"
                            style={{ background: 'rgba(0,212,255,0.04)' }}
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-semibold">View Work</span>
                          </button>

                          {/* Delete Button */}
                          {deletionStatus.canDelete ? (
                            <button
                              onClick={() => {
                                setDeleteError('');
                                setDeleteTarget(m);
                              }}
                              title={`Remove ${m.name}`}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-[#0d2040] text-[#4a6080] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-200"
                              style={{ background: '#03040a' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : deletionStatus.isProtected ? (
                            <span
                              className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-medium border"
                              style={{
                                background: 'rgba(245,158,11,0.06)',
                                borderColor: 'rgba(245,158,11,0.2)',
                                color: '#fbbf24',
                              }}
                              title={deletionStatus.reason}
                            >
                              <Lock className="w-3 h-3" />
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Member Work & Contributions Modal ─── */}
      {selectedWorkUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,4,10,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl border border-[#00d4ff25] shadow-2xl animate-slide-in overflow-hidden"
            style={{ background: '#080c16', boxShadow: '0 0 50px rgba(0,102,255,0.15)' }}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#0d2040]">
              <div className="flex items-center space-x-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
                    color: '#03040a',
                    boxShadow: '0 0 16px rgba(0,212,255,0.4)',
                  }}
                >
                  {selectedWorkUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-[#e8f4ff]">{selectedWorkUser.name}</h2>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                      style={{
                        background:
                          selectedWorkUser.role?.name === 'ADMIN'
                            ? 'rgba(0,212,255,0.15)'
                            : selectedWorkUser.role?.name === 'MANAGER'
                            ? 'rgba(245,158,11,0.15)'
                            : 'rgba(124,58,237,0.15)',
                        color:
                          selectedWorkUser.role?.name === 'ADMIN'
                            ? '#00d4ff'
                            : selectedWorkUser.role?.name === 'MANAGER'
                            ? '#f59e0b'
                            : '#a78bfa',
                        border: '1px solid rgba(0,212,255,0.2)',
                      }}
                    >
                      {selectedWorkUser.role?.name || 'Member'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4a6080] mt-0.5">
                    Member since {new Date(selectedWorkUser.createdAt).toLocaleDateString()} · Active in organization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorkUser(null)}
                className="text-[#4a6080] hover:text-[#e8f4ff] transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Work KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div
                className="p-3.5 rounded-xl border border-[#0d2040]"
                style={{ background: '#03040a' }}
              >
                <div className="flex items-center justify-between text-[#4a6080] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total Tasks</span>
                  <Layers className="w-3.5 h-3.5 text-[#00d4ff]" />
                </div>
                <div className="text-xl font-black text-[#e8f4ff]">
                  {selectedWorkUser.workStats?.totalTasks || 0}
                </div>
                <div className="text-[10px] text-[#4a6080] mt-0.5">Assigned work</div>
              </div>

              <div
                className="p-3.5 rounded-xl border border-[#0d2040]"
                style={{ background: '#03040a' }}
              >
                <div className="flex items-center justify-between text-[#4a6080] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Done</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                </div>
                <div className="text-xl font-black text-[#10b981]">
                  {selectedWorkUser.workStats?.doneCount || 0}
                </div>
                <div className="text-[10px] text-[#10b981]/70 mt-0.5">Completed tasks</div>
              </div>

              <div
                className="p-3.5 rounded-xl border border-[#0d2040]"
                style={{ background: '#03040a' }}
              >
                <div className="flex items-center justify-between text-[#4a6080] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
                  <Clock className="w-3.5 h-3.5 text-[#00d4ff]" />
                </div>
                <div className="text-xl font-black text-[#00d4ff]">
                  {selectedWorkUser.workStats?.inProgressCount || 0}
                </div>
                <div className="text-[10px] text-[#00d4ff]/70 mt-0.5">Ongoing work</div>
              </div>

              <div
                className="p-3.5 rounded-xl border border-[#0d2040]"
                style={{ background: '#03040a' }}
              >
                <div className="flex items-center justify-between text-[#4a6080] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Completion</span>
                  <Activity className="w-3.5 h-3.5 text-[#a78bfa]" />
                </div>
                <div className="text-xl font-black text-[#a78bfa]">
                  {selectedWorkUser.workStats?.completionRate || 0}%
                </div>
                <div className="text-[10px] text-[#a78bfa]/70 mt-0.5">
                  {selectedWorkUser.workStats?.activitiesCount || 0} total actions
                </div>
              </div>
            </div>

            {/* Tabs Header */}
            <div className="flex border-b border-[#0d2040] mb-3">
              <button
                onClick={() => setWorkModalTab('tasks')}
                className="flex items-center space-x-2 px-4 py-2.5 text-xs font-bold transition border-b-2"
                style={{
                  color: workModalTab === 'tasks' ? '#00d4ff' : '#4a6080',
                  borderColor: workModalTab === 'tasks' ? '#00d4ff' : 'transparent',
                }}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Assigned Tasks ({selectedWorkUser.assignedTasks?.length || 0})</span>
              </button>
              <button
                onClick={() => setWorkModalTab('activities')}
                className="flex items-center space-x-2 px-4 py-2.5 text-xs font-bold transition border-b-2"
                style={{
                  color: workModalTab === 'activities' ? '#00d4ff' : '#4a6080',
                  borderColor: workModalTab === 'activities' ? '#00d4ff' : 'transparent',
                }}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Activity History ({selectedWorkUser.activities?.length || 0})</span>
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 text-xs">
              {/* ─── TAB 1: Assigned Tasks ─── */}
              {workModalTab === 'tasks' && (
                <>
                  {!selectedWorkUser.assignedTasks || selectedWorkUser.assignedTasks.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <Briefcase className="w-8 h-8 text-[#4a6080] mx-auto opacity-50" />
                      <p className="text-xs text-[#e8f4ff] font-medium">No tasks assigned yet</p>
                      <p className="text-[11px] text-[#4a6080]">
                        Assign tasks from the Tasks Board to allocate work to {selectedWorkUser.name}.
                      </p>
                    </div>
                  ) : (
                    selectedWorkUser.assignedTasks.map((t) => {
                      const st = STATUS_CONFIG[t.status] || STATUS_CONFIG.TODO;
                      const pr = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.MEDIUM;
                      return (
                        <div
                          key={t.id}
                          className="p-3.5 rounded-xl border border-[#0d2040] hover:border-[#00d4ff30] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          style={{ background: '#03040a' }}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-[#e8f4ff] text-xs">{t.title}</span>
                              <span
                                className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                                style={{
                                  background: st.bg,
                                  color: st.color,
                                  border: `1px solid ${st.border}`,
                                }}
                              >
                                {st.label}
                              </span>
                              <span
                                className="px-2 py-0.5 rounded text-[9px] font-black uppercase"
                                style={{ background: pr.bg, color: pr.color }}
                              >
                                {pr.label}
                              </span>
                            </div>

                            {t.description && (
                              <p className="text-[11px] text-[#4a6080] line-clamp-1">{t.description}</p>
                            )}

                            <div className="flex items-center space-x-3 text-[10px] text-[#4a6080] pt-0.5">
                              {t.project && (
                                <span className="flex items-center space-x-1 text-[#00d4ff]/80">
                                  <FolderKanban className="w-3 h-3" />
                                  <span>{t.project.name}</span>
                                </span>
                              )}
                              {t.dueDate && (
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>
                                </span>
                              )}
                              {t.estimatedHours && (
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{t.estimatedHours} hrs est.</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {/* ─── TAB 2: Activity Audit History ─── */}
              {workModalTab === 'activities' && (
                <>
                  {!selectedWorkUser.activities || selectedWorkUser.activities.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <Activity className="w-8 h-8 text-[#4a6080] mx-auto opacity-50" />
                      <p className="text-xs text-[#e8f4ff] font-medium">No activity recorded yet</p>
                      <p className="text-[11px] text-[#4a6080]">
                        Actions performed by {selectedWorkUser.name} will be logged here automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 divide-y divide-[#0d2040]">
                      {selectedWorkUser.activities.map((act) => (
                        <div key={act.id} className="pt-2.5 first:pt-0 flex items-start space-x-3">
                          <div
                            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                            style={{
                              background: '#00d4ff',
                              boxShadow: '0 0 8px #00d4ff',
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[#e8f4ff] font-medium text-xs">
                              {act.details || act.action}
                            </p>
                            <div className="flex items-center space-x-2 text-[10px] text-[#4a6080] mt-0.5">
                              <span className="uppercase font-bold tracking-wider">{act.entityType}</span>
                              <span>·</span>
                              <span>{new Date(act.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#0d2040] flex justify-end">
              <button
                onClick={() => setSelectedWorkUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#e8f4ff] hover:bg-[#0d1220] transition border border-[#0d2040]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,4,10,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl border border-red-500/30 shadow-2xl animate-slide-in"
            style={{ background: '#080c16', boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}
          >
            <div className="flex items-start space-x-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  boxShadow: '0 0 16px rgba(239,68,68,0.2)',
                }}
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-black text-[#e8f4ff] uppercase tracking-wider">Remove Member</h2>
                <p className="text-xs text-[#4a6080] mt-1 leading-relaxed">
                  Are you sure you want to remove <span className="font-bold text-[#e8f4ff]">"{deleteTarget.name}"</span> from this organization?
                </p>
              </div>
              <button
                onClick={() => !deleteLoading && setDeleteTarget(null)}
                className="text-[#4a6080] hover:text-[#e8f4ff] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="p-3 mb-4 rounded-xl border border-[#0d2040] text-[11px] text-[#4a6080] space-y-1"
              style={{ background: '#03040a' }}
            >
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="font-semibold text-[#e8f4ff]">{deleteTarget.role?.name || 'Member'}</span>
              </div>
              <div className="flex justify-between">
                <span>Assigned Tasks:</span>
                <span className="font-semibold text-[#e8f4ff]">{deleteTarget.workStats?.totalTasks || deleteTarget._count?.assignedTasks || 0}</span>
              </div>
              <p className="text-[10px] text-amber-400/80 pt-1 border-t border-[#0d2040]">
                Note: Assigned tasks will be unassigned automatically.
              </p>
            </div>

            {deleteError && (
              <div
                className="p-3 mb-4 rounded-xl border text-xs text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}
              >
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-[#4a6080] hover:text-[#e8f4ff] transition text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteMember}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  color: '#ffffff',
                  boxShadow: '0 0 16px rgba(239,68,68,0.3)',
                }}
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deleteLoading ? 'Removing...' : 'Delete Member'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,4,10,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl border border-[#00d4ff20] shadow-2xl animate-slide-in"
            style={{ background: '#080c16', boxShadow: '0 0 40px rgba(0,102,255,0.12)' }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#0d2040] mb-5">
              <h2 className="text-sm font-black text-[#e8f4ff] uppercase tracking-wider">Add Organization Member</h2>
              <button onClick={() => !inviteLoading && setShowInviteModal(false)} className="text-[#4a6080] hover:text-[#e8f4ff]">
                <X className="w-5 h-5" />
              </button>
            </div>
            {inviteError && (
              <div
                className="p-3 mb-4 rounded-xl border text-xs text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
                {inviteError}
              </div>
            )}
            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              {[
                { key: 'name',     label: 'Full Name',  type: 'text',     ph: 'Jane Doe' },
                { key: 'email',    label: 'Email',      type: 'email',    ph: 'jane@company.com' },
                { key: 'password', label: 'Password',   type: 'password', ph: 'Min 8 characters', min: 8 },
              ].map(({ key, label, type, ph, min }) => (
                <div key={key}>
                  <label className="block text-[#e8f4ff] font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                    {label} *
                  </label>
                  <input
                    type={type}
                    required
                    minLength={min}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={ph}
                    className="vyuha-input w-full rounded-xl px-3.5 py-2"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[#e8f4ff] font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                  Role *
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="vyuha-input w-full rounded-xl px-3.5 py-2"
                >
                  {assignableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.description || 'Tenant Role'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#0d2040]">
                <button
                  type="button"
                  disabled={inviteLoading}
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-[#4a6080] hover:text-[#e8f4ff] transition text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={inviteLoading} className="btn-vyuha px-5 py-2 rounded-xl text-xs flex items-center space-x-1.5">
                  {inviteLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>{inviteLoading ? 'Adding...' : 'Add Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
