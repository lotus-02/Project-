import React, { useState, useEffect } from 'react';
import { X, Clock, User, Calendar, MessageSquare, Send, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function TaskModal({ taskId, onClose, onUpdated }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!taskId) return;
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}`);
      if (res.data.success) {
        setTask(res.data.data);
        setComments(res.data.data.comments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (field, value) => {
    try {
      const res = await api.patch(`/tasks/${taskId}`, { [field]: value });
      if (res.data.success) {
        setTask(res.data.data);
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/comments/task/${taskId}`, { content: commentText });
      if (res.data.success) {
        setComments(prev => [...prev, res.data.data]);
        setCommentText('');
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !task) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
          Loading task details...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              {task.project?.name || 'Task Details'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <h2 className="text-base font-bold text-slate-100">{task.title}</h2>
            {task.description ? (
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{task.description}</p>
            ) : (
              <p className="text-xs text-slate-600 mt-2 italic">No description provided</p>
            )}
          </div>

          {/* Quick Properties */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
            {/* Status */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Status</label>
              <select
                value={task.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Priority</label>
              <select
                value={task.priority}
                onChange={(e) => updateField('priority', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Assignee</label>
              <div className="flex items-center space-x-1.5 py-1 text-slate-300">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{task.assignee?.name || 'Unassigned'}</span>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Due Date</label>
              <div className="flex items-center space-x-1.5 py-1 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-2">
            <h3 className="font-semibold text-xs text-slate-300 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Discussion ({comments.length})</span>
            </h3>

            {/* Comments List */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No comments yet. Start the conversation.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-300">{c.user?.name || 'User'}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition"
              >
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
