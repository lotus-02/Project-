import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock, 
  RefreshCw,
  CheckCircle,
  BarChart2
} from 'lucide-react';
import api from '../services/api';

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          setProjects(res.data.data);
          setSelectedProjectId(res.data.data[0].id);
          fetchAnalytics(res.data.data[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchAnalytics = async (projId) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/project/${projId}`);
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedProjectId) return;
    setAnalyzing(true);
    try {
      const res = await api.post(`/analytics/project/${selectedProjectId}/ml-analyze`);
      if (res.data.success) {
        fetchAnalytics(selectedProjectId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const ml = analytics?.latestMLAnalysis;
  const stats = analytics?.stats || { totalTasks: 0, completed: 0, inProgress: 0, overdue: 0, completionRate: 0 };
  const team = analytics?.teamWorkload || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Machine Learning Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100">Project Risk & Capacity Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-factor project forecasting powered by Python ML microservice</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              fetchAnalytics(e.target.value);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Processing ML...' : 'Compute Predictions'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Loading intelligence models...</div>
      ) : !analytics ? (
        <div className="py-20 text-center text-xs text-slate-500">No project data available</div>
      ) : (
        <div className="space-y-6">
          {/* Top Predictive Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Risk Gauge */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Risk Score</span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-4xl font-black ${!ml ? 'text-slate-500' : ml.riskLevel === 'HIGH' ? 'text-red-400' : ml.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {ml ? ml.riskScore : '--'}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${!ml ? 'bg-slate-800 text-slate-500' : ml.riskLevel === 'HIGH' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {ml ? `${ml.riskLevel} RISK` : 'PENDING'}
              </span>
            </div>

            {/* Delay Probability */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Delay Probability</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-slate-100">
                  {ml ? `${Math.round(ml.delayProbability * 100)}%` : '--'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Chance of milestone slippage</p>
            </div>

            {/* Completion Rate */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Completion Velocity</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-slate-100">
                  {stats.completionRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{stats.completed} of {stats.totalTasks} completed</p>
            </div>

            {/* Workload Index */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Workload Density</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-slate-100">
                  {ml ? ml.workloadIndex : '--'}
                </span>
                <span className="text-xs text-slate-500">tasks/dev</span>
              </div>
              <p className="text-[11px] text-slate-400">Capacity distribution metric</p>
            </div>
          </div>

          {/* AI Recommendations Panel */}
          {ml && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-2xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Automated Delivery Recommendations</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {ml.recommendations.split(';').map((rec, i) => (
                  <div key={i} className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-200 flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{rec.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Workload Distribution */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Team Workload & Capacity Breakdown</span>
            </h3>

            {team.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No assigned task distribution found</p>
            ) : (
              <div className="space-y-4">
                {team.map((m) => {
                  const pct = Math.min(100, Math.round((m.taskCount / Math.max(stats.totalTasks, 1)) * 100));
                  return (
                    <div key={m.user.id} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-200">
                        <span className="font-semibold">{m.user.name}</span>
                        <span className="text-slate-400 text-[11px]">
                          {m.taskCount} tasks ({m.completedTasks} done, {m.pendingTasks} pending) • {m.estimatedHours} hrs est.
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${m.pendingTasks > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
