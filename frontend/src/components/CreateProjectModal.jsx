import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

export default function CreateProjectModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({ name: '', description: '', priority: 'MEDIUM', startDate: '', endDate: '' });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Project name is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/projects', {
        name: formData.name,
        description: formData.description || null,
        priority: formData.priority,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate:   formData.endDate   ? new Date(formData.endDate).toISOString()   : null,
      });
      if (res.data.success) { if (onCreated) onCreated(); onClose(); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to create project'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(3,4,10,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-lg p-6 rounded-2xl border border-[#00d4ff20] shadow-2xl animate-slide-in"
        style={{ background: '#080c16', boxShadow: '0 0 40px rgba(0,102,255,0.12)' }}>
        <div className="flex items-center justify-between pb-4 border-b border-[#0d2040] mb-5">
          <div>
            <h2 className="text-sm font-black text-[#e8f4ff] uppercase tracking-wider">Create New Project</h2>
            <p className="text-[10px] text-[#4a6080] mt-0.5">Configure your project delivery pipeline</p>
          </div>
          <button onClick={onClose} className="text-[#4a6080] hover:text-[#e8f4ff] transition"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="p-3 mb-4 rounded-xl border text-xs text-red-400"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">Project Name *</label>
            <input type="text" required value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Cloud Security Migration"
              className="vyuha-input w-full rounded-xl px-3.5 py-2" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="vyuha-input w-full rounded-xl px-3.5 py-2">
              {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p.charAt(0)+p.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">Start Date</label>
              <input type="date" value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="vyuha-input w-full rounded-xl px-3.5 py-2" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">Deadline</label>
              <input type="date" value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="vyuha-input w-full rounded-xl px-3.5 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">Description</label>
            <textarea rows="3" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Scope, deliverables, and milestones..."
              className="vyuha-input w-full rounded-xl px-3.5 py-2 resize-none" />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#0d2040]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[#4a6080] hover:text-[#e8f4ff] transition text-xs">Cancel</button>
            <button type="submit" disabled={loading} className="btn-vyuha px-5 py-2 rounded-xl text-xs">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
