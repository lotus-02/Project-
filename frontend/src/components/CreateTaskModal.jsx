import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

export default function CreateTaskModal({ onClose, onCreated, defaultProjectId }) {
  const [projects,  setProjects]  = useState([]);
  const [members,   setMembers]   = useState([]);
  const [formData,  setFormData]  = useState({
    title: '', description: '', projectId: defaultProjectId || '',
    assigneeId: '', priority: 'MEDIUM', dueDate: '', estimatedHours: ''
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/projects').then(res => {
      if (res.data.success) {
        setProjects(res.data.data);
        if (!formData.projectId && res.data.data.length > 0)
          setFormData(prev => ({ ...prev, projectId: res.data.data[0].id }));
      }
    }).catch(() => {});
    api.get('/users').then(res => { if (res.data.success) setMembers(res.data.data); }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) { setError('Title and Project are required'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/tasks', {
        title: formData.title,
        description: formData.description || null,
        projectId:   formData.projectId,
        assigneeId:  formData.assigneeId || null,
        priority:    formData.priority,
        dueDate:     formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : null,
      });
      if (res.data.success) { if (onCreated) onCreated(); onClose(); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to create task'); }
    finally { setLoading(false); }
  };

  const label = (text) => (
    <label className="block text-[10px] font-bold text-[#4a6080] mb-1.5 uppercase tracking-widest">{text}</label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(3,4,10,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-lg p-6 rounded-2xl border border-[#00d4ff20] shadow-2xl animate-slide-in"
        style={{ background: '#080c16', boxShadow: '0 0 40px rgba(0,102,255,0.12)' }}>
        <div className="flex items-center justify-between pb-4 border-b border-[#0d2040] mb-5">
          <div>
            <h2 className="text-sm font-black text-[#e8f4ff] uppercase tracking-wider">Create New Task</h2>
            <p className="text-[10px] text-[#4a6080] mt-0.5">Assign and track a delivery item</p>
          </div>
          <button onClick={onClose} className="text-[#4a6080] hover:text-[#e8f4ff] transition"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="p-3 mb-4 rounded-xl border text-xs text-red-400"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            {label('Title *')}
            <input type="text" required value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement Multi-Tenant Isolation"
              className="vyuha-input w-full rounded-xl px-3.5 py-2" />
          </div>
          <div>
            {label('Project *')}
            <select value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="vyuha-input w-full rounded-xl px-3.5 py-2">
              <option value="">Select a Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              {label('Priority')}
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="vyuha-input w-full rounded-xl px-3.5 py-2">
                {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p.charAt(0)+p.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              {label('Assignee')}
              <select value={formData.assigneeId} onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="vyuha-input w-full rounded-xl px-3.5 py-2">
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              {label('Due Date')}
              <input type="date" value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="vyuha-input w-full rounded-xl px-3.5 py-2" />
            </div>
            <div>
              {label('Est. Hours')}
              <input type="number" min="0" step="0.5" value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="e.g. 4"
                className="vyuha-input w-full rounded-xl px-3.5 py-2" />
            </div>
          </div>
          <div>
            {label('Description')}
            <textarea rows="3" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task details and acceptance criteria..."
              className="vyuha-input w-full rounded-xl px-3.5 py-2 resize-none" />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#0d2040]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[#4a6080] hover:text-[#e8f4ff] transition text-xs">Cancel</button>
            <button type="submit" disabled={loading} className="btn-vyuha px-5 py-2 rounded-xl text-xs">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
