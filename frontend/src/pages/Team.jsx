import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldCheck, X } from 'lucide-react';
import api from '../services/api';

export default function Team() {
  const [members,         setMembers]         = useState([]);
  const [roles,           setRoles]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [formData,        setFormData]        = useState({ name: '', email: '', password: '', roleId: '' });
  const [error,           setError]           = useState('');

  useEffect(() => {
    fetchTeam();
    api.get('/roles').then(res => {
      if (res.data.success) {
        setRoles(res.data.data);
        if (res.data.data.length > 0) setFormData(prev => ({ ...prev, roleId: res.data.data[0].id }));
      }
    }).catch(() => {});
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) setMembers(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/users', formData);
      if (res.data.success) {
        fetchTeam();
        setShowInviteModal(false);
        setFormData({ name: '', email: '', password: '', roleId: roles[0]?.id || '' });
      }
    } catch (err) { setError(err.response?.data?.message || 'Failed to add member'); }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#e8f4ff]">Team & Organization Members</h1>
          <p className="text-xs text-[#4a6080] mt-1">Manage user access, roles, and organizational security</p>
        </div>
        <button onClick={() => setShowInviteModal(true)}
          className="btn-vyuha flex items-center space-x-2 px-4 py-2 rounded-xl text-xs">
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
                {['Member', 'Role', 'Status', 'Tasks Assigned', 'Joined'].map(h => (
                  <th key={h} className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-[#4a6080]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center text-[#4a6080]">Loading team members...</td></tr>
              ) : members.map((m) => (
                <tr key={m.id} className="border-t border-[#0d2040] hover:bg-[#0d1220] transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs"
                        style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', boxShadow: '0 0 8px rgba(0,212,255,0.15)' }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#e8f4ff]">{m.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider"
                      style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}>
                      <ShieldCheck className="w-3 h-3" />
                      <span>{m.role?.name || 'Member'}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold" style={{ color: '#00d4ff' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" style={{boxShadow:'0 0 6px #00d4ff'}} />
                      <span>Active</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[#4a6080]">{m._count?.assignedTasks || 0} tasks</td>
                  <td className="py-4 px-6 text-[#4a6080] text-[11px]">{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(3,4,10,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-md p-6 rounded-2xl border border-[#00d4ff20] shadow-2xl animate-slide-in"
            style={{ background: '#080c16', boxShadow: '0 0 40px rgba(0,102,255,0.12)' }}>
            <div className="flex items-center justify-between pb-4 border-b border-[#0d2040] mb-5">
              <h2 className="text-sm font-black text-[#e8f4ff] uppercase tracking-wider">Add Organization Member</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-[#4a6080] hover:text-[#e8f4ff]">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && <div className="p-3 mb-4 rounded-xl border text-xs text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>{error}</div>}
            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              {[
                { key: 'name',     label: 'Full Name',  type: 'text',     ph: 'Jane Doe' },
                { key: 'email',    label: 'Email',      type: 'email',    ph: 'jane@company.com' },
                { key: 'password', label: 'Password',   type: 'password', ph: 'Min 8 characters', min: 8 },
              ].map(({ key, label, type, ph, min }) => (
                <div key={key}>
                  <label className="block text-[#e8f4ff] font-semibold mb-1.5 uppercase tracking-wider text-[10px]">{label} *</label>
                  <input type={type} required minLength={min} value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={ph} className="vyuha-input w-full rounded-xl px-3.5 py-2" />
                </div>
              ))}
              <div>
                <label className="block text-[#e8f4ff] font-semibold mb-1.5 uppercase tracking-wider text-[10px]">Role *</label>
                <select value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="vyuha-input w-full rounded-xl px-3.5 py-2">
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name} — {r.description || 'Tenant Role'}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#0d2040]">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-[#4a6080] hover:text-[#e8f4ff] transition text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-vyuha px-5 py-2 rounded-xl text-xs">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
