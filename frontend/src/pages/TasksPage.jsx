import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';

export default function TasksPage() {
  const [tasks,             setTasks]             = useState([]);
  const [projects,          setProjects]          = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [search,            setSearch]            = useState('');
  const [selectedTaskId,    setSelectedTaskId]    = useState(null);
  const [showCreateTask,    setShowCreateTask]    = useState(false);
  const [loading,           setLoading]           = useState(true);

  useEffect(() => {
    fetchTasks();
    api.get('/projects').then(res => { if (res.data.success) setProjects(res.data.data); }).catch(() => {});
    const socket = getSocket();
    if (socket) {
      socket.on('task:created', (t) => setTasks(prev => [t, ...prev]));
      socket.on('task:updated', (u) => setTasks(prev => prev.map(t => t.id === u.id ? u : t)));
      socket.on('task:deleted', ({ id }) => setTasks(prev => prev.filter(t => t.id !== id)));
    }
    return () => {
      if (socket) { socket.off('task:created'); socket.off('task:updated'); socket.off('task:deleted'); }
    };
  }, []);

  const fetchTasks = async (projId = '') => {
    try {
      const res = await api.get(projId ? `/tasks?projectId=${projId}` : '/tasks');
      if (res.data.success) setTasks(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) { console.error(err); }
  };

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#e8f4ff]">Tasks Board</h1>
          <p className="text-xs text-[#4a6080] mt-1">Kanban workflow with live Socket updates</p>
        </div>
        <button onClick={() => setShowCreateTask(true)}
          className="btn-vyuha flex items-center space-x-2 px-4 py-2 rounded-xl text-xs">
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-[#0d2040]" style={{ background: '#080c16' }}>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#4a6080] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="vyuha-input w-full pl-10 pr-4 py-2 rounded-xl text-xs"
          />
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#4a6080]" />
          <select
            value={selectedProjectId}
            onChange={(e) => { setSelectedProjectId(e.target.value); fetchTasks(e.target.value); }}
            className="vyuha-input rounded-xl px-3.5 py-2 text-xs"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#4a6080]">Loading tasks...</div>
      ) : (
        <KanbanBoard tasks={filtered} onTaskClick={(t) => setSelectedTaskId(t.id)} onStatusChange={handleStatusChange} />
      )}

      {selectedTaskId && <TaskModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onUpdated={() => fetchTasks(selectedProjectId)} />}
      {showCreateTask  && <CreateTaskModal onClose={() => setShowCreateTask(false)} onCreated={() => fetchTasks(selectedProjectId)} />}
    </div>
  );
}
