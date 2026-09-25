import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Sparkles, Plus, ArrowRight, Activity as ActivityIcon, PanelLeft } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import CreateProjectModal from '../components/CreateProjectModal';
import CreateTaskModal from '../components/CreateTaskModal';
import { Link } from 'react-router-dom';

// Shared card style
const card = 'rounded-2xl border border-[#0d2040] p-5 shadow-card';
const cardBg = { background: '#080c16' };

export default function Dashboard() {
  const { user } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchOverview();
    const socket = getSocket();
    if (socket) {
      socket.on('activity:created', (a) => {
        setOverview(prev => prev ? { ...prev, recentActivities: [a, ...(prev.recentActivities || []).slice(0, 9)] } : prev);
      });
      socket.on('task:created',   () => fetchOverview());
      socket.on('task:updated',   () => fetchOverview());
      socket.on('project:created',() => fetchOverview());
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
      if (res.data.success) setOverview(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex space-x-1.5">
          {[0,1,2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-[#00d4ff] animate-bounce"
              style={{ animationDelay: `${i*0.15}s`, boxShadow: '0 0 8px #00d4ff' }} />
          ))}
        </div>
      </div>
    );
  }

  const metrics = overview?.metrics || { totalProjects: 0, totalTasks: 0, totalMembers: 1, overdueTasks: 0, completionRate: 0 };
  const status  = overview?.statusDistribution || {};

  const metricCards = [
    { label: 'Active Projects',  value: metrics.totalProjects,  icon: FolderKanban, accent: '#00d4ff', glow: 'rgba(0,212,255,0.15)' },
    { label: 'Total Tasks',      value: metrics.totalTasks,     icon: CheckSquare,  accent: '#0066ff', glow: 'rgba(0,102,255,0.15)' },
    { label: 'Completion Rate',  value: `${metrics.completionRate}%`, icon: TrendingUp, accent: '#7c3aed', glow: 'rgba(124,58,237,0.15)' },
    { label: 'Overdue Tasks',    value: metrics.overdueTasks,   icon: Clock,        accent: metrics.overdueTasks > 0 ? '#ef4444' : '#00d4ff', glow: metrics.overdueTasks > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(0,212,255,0.1)' },
  ];

  const taskBars = [
    { label: 'To Do',       count: status.TODO || 0,        color: '#4a6080' },
    { label: 'In Progress', count: status.IN_PROGRESS || 0, color: '#f59e0b' },
    { label: 'In Review',   count: status.IN_REVIEW || 0,   color: '#0066ff' },
    { label: 'Completed',   count: status.COMPLETED || 0,   color: '#00d4ff' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#e8f4ff]">
            Welcome back, <span className="text-[#00d4ff]" style={{textShadow:'0 0 12px rgba(0,212,255,0.4)'}}>{user?.name || 'Commander'}</span>
          </h1>
          <p className="text-xs text-[#4a6080] mt-1">
            Real-time intelligence for <span className="text-[#00d4ff] font-semibold">{user?.tenantName}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-[#0d2040] text-[#8fa3bf] text-xs font-semibold transition hover:border-[#00d4ff30] hover:text-[#00d4ff]"
            style={{ background: '#0d1220' }}
            title={isCollapsed ? "Slide expand sidebar" : "Slide collapse sidebar"}
          >
            <PanelLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180 text-[#00d4ff]' : ''}`} />
            <span>{isCollapsed ? 'Expand Slide' : 'Slide View'}</span>
          </button>
          <button onClick={() => setShowTaskModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-[#0d2040] text-[#e8f4ff] text-xs font-semibold transition hover:border-[#00d4ff30] hover:text-[#00d4ff]"
            style={{ background: '#0d1220' }}>
            <Plus className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>New Task</span>
          </button>
          <button onClick={() => setShowProjectModal(true)}
            className="btn-vyuha flex items-center space-x-2 px-4 py-2 rounded-xl text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map(({ label, value, icon: Icon, accent, glow }) => (
          <div key={label} className={`${card} flex items-center justify-between`} style={cardBg}>
            <div>
              <p className="text-[11px] font-bold text-[#4a6080] uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-black text-[#e8f4ff] mt-1" style={{ color: label === 'Overdue Tasks' && metrics.overdueTasks > 0 ? '#ef4444' : '#e8f4ff' }}>
                {value}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: glow, border: `1px solid ${accent}30` }}>
              <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
          </div>
        ))}
      </div>

      {/* ML Intelligence Banner */}
      <div className="p-6 rounded-2xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(8,12,22,0.9) 50%, rgba(0,102,255,0.1) 100%)', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 30px rgba(124,58,237,0.1)' }}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2" style={{ color: '#a78bfa' }}>
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="font-bold text-xs uppercase tracking-widest">ML Project Intelligence Active</span>
            </div>
            <h3 className="text-lg font-black text-[#e8f4ff]">Predictive Health & Risk Engine</h3>
            <p className="text-xs text-[#4a6080] leading-relaxed">
              Automated ML microservice calculates risk scores, schedule slippage probabilities, and team capacity bottlenecks to safeguard delivery milestones.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-3 rounded-xl border border-[#0d2040] text-center min-w-[110px]" style={{ background: '#03040a' }}>
              <span className="text-[10px] text-[#4a6080] uppercase font-bold block">Risk Category</span>
              <span className={`text-sm font-black mt-0.5 block ${metrics.overdueTasks > 2 ? 'text-amber-400' : 'text-[#00d4ff]'}`}>
                {metrics.overdueTasks > 2 ? 'ELEVATED' : 'NOMINAL'}
              </span>
            </div>
            <Link to="/analytics" className="btn-vyuha px-5 py-3 rounded-xl text-xs font-bold flex items-center space-x-2">
              <span>View AI Insights</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Task Distribution + Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task breakdown */}
        <div className={`${card} space-y-4`} style={cardBg}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#4a6080]">Task Distribution</h3>
          <div className="space-y-3">
            {taskBars.map((s) => {
              const pct = metrics.totalTasks > 0 ? Math.round((s.count / metrics.totalTasks) * 100) : 0;
              return (
                <div key={s.label} className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#e8f4ff]">
                    <span>{s.label}</span>
                    <span className="text-[#4a6080] font-semibold">{s.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#0d1220' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: s.color, boxShadow: `0 0 6px ${s.color}80` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className={`lg:col-span-2 ${card} space-y-4`} style={cardBg}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#4a6080] flex items-center space-x-2">
              <ActivityIcon className="w-4 h-4 text-[#00d4ff]" />
              <span>Real-Time Audit Stream</span>
            </h3>
            <span className="text-[10px] text-[#00d4ff] flex items-center space-x-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-ping" style={{boxShadow:'0 0 6px #00d4ff'}} />
              <span>LIVE</span>
            </span>
          </div>
          <div className="divide-y divide-[#0d2040] max-h-72 overflow-y-auto pr-1">
            {!overview?.recentActivities || overview.recentActivities.length === 0 ? (
              <p className="text-xs text-[#4a6080] py-8 text-center">No recent activities recorded</p>
            ) : (
              overview.recentActivities.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-medium text-[#e8f4ff]">{act.details || act.action}</p>
                    <p className="text-[10px] text-[#4a6080]">By {act.user?.name || 'System'}</p>
                  </div>
                  <span className="text-[10px] text-[#4a6080] shrink-0">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showProjectModal && <CreateProjectModal onClose={() => setShowProjectModal(false)} onCreated={() => fetchOverview()} />}
      {showTaskModal    && <CreateTaskModal    onClose={() => setShowTaskModal(false)}    onCreated={() => fetchOverview()} />}
    </div>
  );
}
