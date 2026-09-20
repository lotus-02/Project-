import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  ArrowRight,
  Activity as ActivityIcon
} from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import CreateProjectModal from '../components/CreateProjectModal';
import CreateTaskModal from '../components/CreateTaskModal';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchOverview();

    const socket = getSocket();
    if (socket) {
      socket.on('activity:created', (newActivity) => {
        setOverview(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            recentActivities: [newActivity, ...(prev.recentActivities || []).slice(0, 9)]
          };
        });
      });
      socket.on('task:created', () => fetchOverview());
      socket.on('task:updated', () => fetchOverview());
      socket.on('project:created', () => fetchOverview());
    }

    return () => {
      if (socket) {
        socket.off('activity:created');
        socket.off('task:created');
        socket.off('task:updated');
        socket.off('project:created');
      }
    };
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await api.get('/analytics/overview');
      if (res.data.success) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-slate-500 text-xs">
        Loading organizational workspace...
      </div>
    );
  }

  const metrics = overview?.metrics || {
    totalProjects: 0,
    totalTasks: 0,
    totalMembers: 1,
    overdueTasks: 0,
    completionRate: 0
  };

  const status = overview?.statusDistribution || {};

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100">
            Welcome back, {user?.name || 'Commander'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time project intelligence and secure tenant isolation for <span className="text-emerald-400 font-semibold">{user?.tenantName}</span>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => setShowProjectModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Projects</p>
            <p className="text-2xl font-black text-slate-100 mt-1">{metrics.totalProjects}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
            <p className="text-2xl font-black text-slate-100 mt-1">{metrics.totalTasks}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</p>
            <p className="text-2xl font-black text-slate-100 mt-1">{metrics.completionRate}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overdue Tasks</p>
            <p className={`text-2xl font-black mt-1 ${metrics.overdueTasks > 0 ? 'text-red-400' : 'text-slate-100'}`}>
              {metrics.overdueTasks}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metrics.overdueTasks > 0 ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ML Intelligence Alert Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/30 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span className="font-bold text-xs uppercase tracking-wider">ML Project Intelligence Active</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-100">
              Predictive Health & Risk Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our automated ML microservice calculates risk scores, schedule slippage probabilities, and team capacity bottlenecks to safeguard delivery milestones.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Risk Category</span>
              <span className={`text-sm font-black mt-0.5 block ${metrics.overdueTasks > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {metrics.overdueTasks > 2 ? 'ELEVATED' : 'NOMINAL'}
              </span>
            </div>

            <Link
              to="/analytics"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-500/20"
            >
              <span>View AI Insights</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Task Status + Live Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Task Status Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'To Do', count: status.TODO || 0, color: 'bg-slate-700' },
              { label: 'In Progress', count: status.IN_PROGRESS || 0, color: 'bg-amber-500' },
              { label: 'In Review', count: status.IN_REVIEW || 0, color: 'bg-blue-500' },
              { label: 'Completed', count: status.COMPLETED || 0, color: 'bg-emerald-500' },
            ].map((s) => {
              const pct = metrics.totalTasks > 0 ? Math.round((s.count / metrics.totalTasks) * 100) : 0;
              return (
                <div key={s.label} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>{s.label}</span>
                    <span className="font-semibold text-slate-400">{s.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <ActivityIcon className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Audit Stream</span>
            </h3>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Socket</span>
            </span>
          </div>

          <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto pr-1">
            {!overview?.recentActivities || overview.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recent activities recorded</p>
            ) : (
              overview.recentActivities.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-200">{act.details || act.action}</p>
                    <p className="text-[10px] text-slate-500">By {act.user?.name || 'System'}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showProjectModal && (
        <CreateProjectModal
          onClose={() => setShowProjectModal(false)}
          onCreated={() => fetchOverview()}
        />
      )}

      {showTaskModal && (
        <CreateTaskModal
          onClose={() => setShowTaskModal(false)}
          onCreated={() => fetchOverview()}
        />
      )}
    </div>
  );
}
