import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  CheckSquare, 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'team', 'ml'
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzingML, setAnalyzingML] = useState(false);

  useEffect(() => {
    fetchProject();

    const socket = getSocket();
    if (socket) {
      socket.emit('project:join', projectId);

      socket.on('task:created', (task) => {
        if (task.projectId === projectId) {
          setTasks(prev => [task, ...prev.filter(t => t.id !== task.id)]);
        }
      });

      socket.on('task:updated', (task) => {
        if (task.projectId === projectId) {
          setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        }
      });

      socket.on('task:deleted', ({ id }) => {
        setTasks(prev => prev.filter(t => t.id !== id));
      });
    }

    return () => {
      if (socket) {
        socket.emit('project:leave', projectId);
        socket.off('task:created');
        socket.off('task:updated');
        socket.off('task:deleted');
      }
    };
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      if (res.data.success) {
        setProject(res.data.data);
        setTasks(res.data.data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const triggerML = async () => {
    setAnalyzingML(true);
    try {
      const res = await api.post(`/analytics/project/${projectId}/ml-analyze`);
      if (res.data.success) {
        fetchProject();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingML(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 py-32">
        Loading project details...
      </div>
    );
  }

  const latestML = project.mlAnalyses?.[0];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back button & Header */}
      <div className="space-y-3">
        <Link to="/projects" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-100">{project.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">{project.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={triggerML}
              disabled={analyzingML}
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <Sparkles className={`w-3.5 h-3.5 ${analyzingML ? 'animate-spin' : ''}`} />
              <span>{analyzingML ? 'Analyzing...' : 'Run ML Analysis'}</span>
            </button>

            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`pb-3 font-semibold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'kanban'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Task Board ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 font-semibold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'team'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members ({project.members?.length || 1})</span>
        </button>

        <button
          onClick={() => setActiveTab('ml')}
          className={`pb-3 font-semibold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'ml'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>ML Intelligence</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'kanban' && (
        <KanbanBoard
          tasks={tasks}
          onTaskClick={(task) => setSelectedTaskId(task.id)}
          onStatusChange={handleStatusChange}
        />
      )}

      {activeTab === 'team' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Project Members</h3>
          <div className="divide-y divide-slate-800">
            {project.members?.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-200 font-bold">
                    {m.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">{m.user?.name}</p>
                    <p className="text-[11px] text-slate-500">{m.user?.email}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ml' && (
        <div className="space-y-6">
          {!latestML ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <Sparkles className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-slate-100">No ML Analysis Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Trigger the ML Intelligence engine to extract features from project tasks, calculate risk vectors, and receive predictive advice.
              </p>
              <button
                onClick={triggerML}
                disabled={analyzingML}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              >
                {analyzingML ? 'Analyzing...' : 'Generate Project ML Intelligence'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Risk Score</span>
                  <div className="flex items-baseline space-x-2">
                    <span className={`text-3xl font-black ${latestML.riskLevel === 'HIGH' ? 'text-red-400' : latestML.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {latestML.riskScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${latestML.riskLevel === 'HIGH' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {latestML.riskLevel} RISK
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Delay Probability</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-100">
                      {Math.round(latestML.delayProbability * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Statistical chance of milestone delay</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Workload Index</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-100">
                      {latestML.workloadIndex}
                    </span>
                    <span className="text-xs text-slate-500">tasks/dev</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Task distribution ratio</p>
                </div>
              </div>

              {/* Recommendations Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Recommendations</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
                  {latestML.recommendations.split(';').map((rec, i) => (
                    <p key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{rec.trim()}</span>
                    </p>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Last computed: {new Date(latestML.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdated={() => fetchProject()}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          defaultProjectId={projectId}
          onClose={() => setShowCreateTask(false)}
          onCreated={() => fetchProject()}
        />
      )}
    </div>
  );
}
