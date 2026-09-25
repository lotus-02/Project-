import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldCheck, X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

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
  const [deleteTarget,    setDeleteTarget]    = useState(null); // member object to delete
  const [deleteLoading,   setDeleteLoading]   = useState(false);
  const [deleteError,     setDeleteError]     = useState('');

  useEffect(() => {
    fetchTeam();
    fetchRoles();

    const socket = getSocket();
    if (socket) {
      socket.on('user:created', (newUser) => {
        setMembers(prev => {
          if (prev.some(m => m.id === newUser.id)) return prev;
          return [newUser, ...prev];
        });
      });
      socket.on('user:deleted', ({ id }) => {
        setMembers(prev => prev.filter(m => m.id !== id));
      });
    }

    return () => {
      if (socket) {
        socket.off('user:created');
        socket.off('user:deleted');
      }
    };
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) setMembers(res.data.data);
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

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#e8f4ff]">Team &amp; Organization Members</h1>
          <p className="text-xs text-[#4a6080] mt-1">Manage user access, roles, and organizational security</p>
        </div>
        <button
          onClick={() => {
            setInviteError('');
            setShowInviteModal(true);
          }}
          className="btn-vyuha flex items-center space-x-2 px-4 py-2 rounded-xl text-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#0d2040] overflow-hidden shadow-card" style={{ background: '#080c16' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead style={{ background: '#03040a', borderBottom: '1px solid #0d2040' }}>
              <tr>
                {['Member', 'Role', 'Status', 'Tasks Assigned', 'Joined', 'Actions'].map((h, i) => (
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
                      <span>Loading team members...</span>
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
                  return (
                    <tr key={m.id} className="border-t border-[#0d2040] hover:bg-[#0d1220] transition">
                      {/* Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                            style={{
                              background: 'rgba(0,212,255,0.08)',
                              border: '1px solid rgba(0,212,255,0.25)',
                              color: '#00d4ff',
                              boxShadow: '0 0 8px rgba(0,212,255,0.15)',
                            }}
                          >
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-[#e8f4ff]">{m.name}</span>
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

                      {/* Tasks */}
                      <td className="py-4 px-6 text-[#4a6080]">{m._count?.assignedTasks || 0} tasks</td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-[#4a6080] text-[11px]">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions (Delete button) */}
                      <td className="py-4 px-6 text-right">
                        {isCurrent ? (
                          <span className="text-[10px] text-[#4a6080] italic px-2 py-1">Current User</span>
                        ) : (
                          <button
                            onClick={() => {
                              setDeleteError('');
                              setDeleteTarget(m);
                            }}
                            title={`Remove ${m.name}`}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#0d2040] text-[#4a6080] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-200"
                            style={{ background: '#03040a' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">Delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                <span className="font-semibold text-[#e8f4ff]">{deleteTarget._count?.assignedTasks || 0}</span>
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
                  {roles.map((r) => (
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
