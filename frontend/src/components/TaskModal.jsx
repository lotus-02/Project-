import React, { useState, useEffect } from 'react';
import { X, Clock, User, Calendar, MessageSquare, Send } from 'lucide-react';
import api from '../services/api';

export default function TaskModal({ taskId, onClose, onUpdated }) {
  const [task,        setTask]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments,    setComments]    = useState([]);

  useEffect(() => { if (taskId) fetchTask(); }, [taskId]);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}`);
      if (res.data.success) { setTask(res.data.data); setComments(res.data.data.comments || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateField = async (field, value) => {
    try {
      const res = await api.patch(`/tasks/${taskId}`, { [field]: value });
      if (res.data.success) { setTask(res.data.data); if (onUpdated) onUpdated(); }
    } catch (err) { console.error(err); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/comments/task/${taskId}`, { content: commentText });
      if (res.data.success) { setComments(prev => [...prev, res.data.data]); setCommentText(''); if (onUpdated) onUpdated(); }
    } catch (err) { console.error(err); }
  };

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(3,4,10,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="rounded-2xl p-6 text-center text-xs text-[#4a6080] border border-[#0d2040]" style={{ background: '#080c16' }}>
        Loading task details...
      </div>
    </div>
  );

  if (loading || !task) return overlay;

  const STATUS_COLORS = {
    TODO:        { color: '#4a6080', label: 'To Do' },
    IN_PROGRESS: { color: '#f59e0b', label: 'In Progress' },
    IN_REVIEW:   { color: '#0066ff', label: 'In Review' },
    COMPLETED:   { color: '#00d4ff', label: 'Completed' },
  };
  const sc = STATUS_COLORS[task.status] || STATUS_COLORS.TODO;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(3,4,10,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-[#00d4ff20] shadow-2xl animate-slide-in"
        style={{ background: '#080c16', boxShadow: '0 0 50px rgba(0,102,255,0.12)' }}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#0d2040] flex items-center justify-between"
          style={{ background: '#03040a' }}>
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#00d4ff' }}>
              {task.project?.name || 'Task Details'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
              style={{ color: sc.color, background: `${sc.color}15`, border: `1px solid ${sc.color}40` }}>
              {sc.label}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#4a6080] hover:text-[#e8f4ff] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title & Description */}
          <div>
            <h2 className="text-base font-black text-[#e8f4ff]">{task.title}</h2>
            {task.description ? (
              <p className="text-xs text-[#4a6080] mt-2 leading-relaxed">{task.description}</p>
            ) : (
              <p className="text-xs text-[#0d2040] mt-2 italic">No description provided</p>
            )}
          </div>

          {/* Properties */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-[#0d2040] text-xs"
            style={{ background: '#03040a' }}>
            <div>
              <label className="text-[10px] text-[#4a6080] block mb-1.5 font-bold uppercase tracking-wider">Status</label>
              <select value={task.status} onChange={(e) => updateField('status', e.target.value)}
                className="vyuha-input w-full rounded-lg px-2 py-1.5">
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#4a6080] block mb-1.5 font-bold uppercase tracking-wider">Priority</label>
              <select value={task.priority} onChange={(e) => updateField('priority', e.target.value)}
                className="vyuha-input w-full rounded-lg px-2 py-1.5">
                {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p.charAt(0)+p.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#4a6080] block mb-1.5 font-bold uppercase tracking-wider">Assignee</label>
              <div className="flex items-center space-x-1.5 py-1.5 text-[#e8f4ff]">
                <User className="w-3.5 h-3.5 text-[#4a6080]" />
                <span className="truncate">{task.assignee?.name || 'Unassigned'}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#4a6080] block mb-1.5 font-bold uppercase tracking-wider">Due Date</label>
              <div className="flex items-center space-x-1.5 py-1.5 text-[#e8f4ff]">
                <Calendar className="w-3.5 h-3.5 text-[#4a6080]" />
                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-[#e8f4ff] flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#00d4ff]" />
              <span>Discussion <span className="text-[#4a6080]">({comments.length})</span></span>
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-[#4a6080] italic">No comments yet. Start the conversation.</p>
              ) : comments.map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-[#0d2040] text-xs" style={{ background: '#03040a' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold" style={{ color: '#00d4ff' }}>{c.user?.name || 'User'}</span>
                    <span className="text-[10px] text-[#4a6080]">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[#e8f4ff] leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="flex items-center space-x-2">
              <input type="text" placeholder="Write a comment..."
                value={commentText} onChange={(e) => setCommentText(e.target.value)}
                className="vyuha-input flex-1 rounded-xl px-3.5 py-2 text-xs" />
              <button type="submit"
                className="btn-vyuha px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
