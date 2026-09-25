import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Sparkles, CheckSquare, Users, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const [project,      setProject]      = useState(null);
  const [tasks,        setTasks]        = useState([]);
  const [activeTab,    setActiveTab]    = useState('kanban');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [analyzingML,  setAnalyzingML]  = useState(false);

  useEffect(() => {
    fetchProject();
    const socket = getSocket();
    if (socket) {
      socket.emit('project:join', projectId);
      socket.on('task:created', (t) => { if (t.projectId === projectId) setTasks(prev => [t, ...prev.filter(x => x.id !== t.id)]); });
      socket.on('task:updated', (t) => { if (t.projectId === projectId) setTasks(prev => prev.map(x => x.id === t.id ? t : x)); });
      socket.on('task:deleted', ({ id }) => setTasks(prev => prev.filter(t => t.id !== id)));
    }
    return () => {
      if (socket) {
        socket.emit('project:leave', projectId);
        socket.off('task:created'); socket.off('task:updated'); socket.off('task:deleted');
      }
    };
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      if (res.data.success) { setProject(res.data.data); setTasks(res.data.data.tasks || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) { console.error(err); }
  };

  const triggerML = async () => {
    setAnalyzingML(true);
    try {
      const res = await api.post(`/analytics/project/${projectId}/ml-analyze`);
      if (res.data.success) fetchProject();
    } catch (err) { console.error(err); }
    finally { setAnalyzingML(false); }
  };

  if (loading || !project) {
    return <div className="p-8 text-center text-xs text-[#4a6080] py-32">Loading project details...</div>;
  }

  const latestML = project.mlAnalyses?.[0];

  const tabs = [
    { id: 'kanban', label: `Task Board (${tasks.length})`, icon: CheckSquare },
    { id: 'team',   label: `Members (${project.members?.length || 1})`, icon: Users },
    { id: 'ml',     label: 'ML Intelligence', icon: Sparkles },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Back + Header */}
      <div className="space-y-3">
        <Link to="/projects" className="inline-flex items-center space-x-1.5 text-xs text-[#4a6080] hover:text-[#00d4ff] transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-[#e8f4ff]">{project.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}>
                {project.status}
              </span>
            </div>
            {project.description && <p className="text-xs text-[#4a6080] mt-1 max-w-2xl">{project.description}</p>}
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={triggerML} disabled={analyzingML}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-[#7c3aed30] text-xs font-semibold transition hover:border-[#7c3aed60]"
              style={{ background: 'rgba(124,58,237,0.08)', color: '#a78bfa' }}>
              <Sparkles className={`w-3.5 h-3.5 ${analyzingML ? 'animate-spin' : ''}`} />
              <span>{analyzingML ? 'Analyzing...' : 'Run ML Analysis'}</span>
            </button>
            <button onClick={() => setShowCreateTask(true)} className="btn-vyuha flex items-center space-x-2 px-4 py-2 rounded-xl text-xs">
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#0d2040] space-x-6 text-xs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`pb-3 font-semibold transition border-b-2 flex items-center space-x-2 ${
              activeTab === id
                ? 'border-[#00d4ff] text-[#00d4ff]'
                : 'border-transparent text-[#4a6080] hover:text-[#e8f4ff]'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Kanban */}
      {activeTab === 'kanban' && (
        <KanbanBoard tasks={tasks} onTaskClick={(t) => setSelectedTaskId(t.id)} onStatusChange={handleStatusChange} />
      )}

      {/* Tab: Team */}
      {activeTab === 'team' && (
        <div className="rounded-2xl border border-[#0d2040] p-6 space-y-4" style={{ background: '#080c16' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#4a6080]">Project Members</h3>
          <div className="divide-y divide-[#0d2040]">
            {project.members?.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}>
                    {m.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#e8f4ff]">{m.user?.name}</p>
                    <p className="text-[11px] text-[#4a6080]">{m.user?.email}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: ML */}
      {activeTab === 'ml' && (
        <div className="space-y-6">
          {!latestML ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-[#0d2040] space-y-4" style={{ background: '#080c16' }}>
              <Sparkles className="w-10 h-10 mx-auto animate-pulse" style={{ color: '#a78bfa' }} />
              <h3 className="text-sm font-black text-[#e8f4ff]">No ML Analysis Generated Yet</h3>
              <p className="text-xs text-[#4a6080] max-w-md mx-auto">
                Trigger the ML Intelligence engine to extract features from project tasks, calculate risk vectors, and receive predictive advice.
              </p>
              <button onClick={triggerML} disabled={analyzingML}
                className="btn-vyuha px-5 py-2.5 rounded-xl text-xs inline-flex items-center space-x-2">
                <RefreshCw className={`w-3.5 h-3.5 ${analyzingML ? 'animate-spin' : ''}`} />
                <span>{analyzingML ? 'Analyzing...' : 'Generate ML Intelligence'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Risk Score', value: latestML.riskScore, unit: '/ 100', badge: `${latestML.riskLevel} RISK`,
                    badgeColor: latestML.riskLevel === 'HIGH' ? '#ef4444' : latestML.riskLevel === 'MEDIUM' ? '#f59e0b' : '#00d4ff' },
                  { label: 'Delay Probability', value: `${Math.round(latestML.delayProbability * 100)}%`, sub: 'Statistical chance of milestone delay', badgeColor: '#4a6080' },
                  { label: 'Workload Index',    value: latestML.workloadIndex, unit: 'tasks/dev', sub: 'Task distribution ratio', badgeColor: '#4a6080' },
                ].map(({ label, value, unit, badge, sub, badgeColor }) => (
                  <div key={label} className="p-6 rounded-2xl border border-[#0d2040] space-y-2" style={{ background: '#080c16' }}>
                    <span className="text-[10px] uppercase font-bold text-[#4a6080]">{label}</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-black" style={{ color: badge ? badgeColor : '#e8f4ff' }}>{value}</span>
                      {unit && <span className="text-xs text-[#4a6080]">{unit}</span>}
                    </div>
                    {badge && <span className="text-[10px] font-bold" style={{ color: badgeColor }}>{badge}</span>}
                    {sub   && <p className="text-[11px] text-[#4a6080]">{sub}</p>}
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-2xl border border-[#0d2040] space-y-3" style={{ background: '#080c16' }}>
                <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-widest" style={{ color: '#a78bfa' }}>
                  <Sparkles className="w-4 h-4" />
                  <span>AI Recommendations</span>
                </div>
                <div className="space-y-2">
                  {latestML.recommendations.split(';').map((rec, i) => (
                    <p key={i} className="flex items-start space-x-2 text-xs">
                      <span style={{ color: '#00d4ff' }} className="font-bold">•</span>
                      <span className="text-[#e8f4ff] leading-relaxed">{rec.trim()}</span>
                    </p>
                  ))}
                </div>
                <span className="text-[10px] text-[#4a6080] block">
                  Last computed: {new Date(latestML.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTaskId && <TaskModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onUpdated={() => fetchProject()} />}
      {showCreateTask  && <CreateTaskModal defaultProjectId={projectId} onClose={() => setShowCreateTask(false)} onCreated={() => fetchProject()} />}
    </div>
  );
}
