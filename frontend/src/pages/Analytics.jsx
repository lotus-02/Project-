import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Users } from 'lucide-react';
import api from '../services/api';

export default function Analytics() {
  const [projects,          setProjects]          = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [analytics,         setAnalytics]         = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [analyzing,         setAnalyzing]         = useState(false);

  useEffect(() => {
    api.get('/projects').then(res => {
      if (res.data.success && res.data.data.length > 0) {
        setProjects(res.data.data);
        setSelectedProjectId(res.data.data[0].id);
        fetchAnalytics(res.data.data[0].id);
      } else { setLoading(false); }
    }).catch(() => setLoading(false));
  }, []);

  const fetchAnalytics = async (projId) => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/project/${projId}`);
      if (res.data.success) setAnalytics(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRunAnalysis = async () => {
    if (!selectedProjectId) return;
    setAnalyzing(true);
    try {
      const res = await api.post(`/analytics/project/${selectedProjectId}/ml-analyze`);
      if (res.data.success) fetchAnalytics(selectedProjectId);
    } catch (err) { console.error(err); }
    finally { setAnalyzing(false); }
  };

  const ml    = analytics?.latestMLAnalysis;
  const stats = analytics?.stats || { totalTasks: 0, completed: 0, inProgress: 0, overdue: 0, completionRate: 0 };
  const team  = analytics?.teamWorkload || [];

  const gauges = [
    {
      label: 'Risk Score',
      value: ml ? ml.riskScore : '--',
      sub: ml ? `${ml.riskLevel} RISK` : 'PENDING',
      subColor: !ml ? '#4a6080' : ml.riskLevel === 'HIGH' ? '#ef4444' : ml.riskLevel === 'MEDIUM' ? '#f59e0b' : '#00d4ff',
      unit: ml ? '/ 100' : '',
    },
    { label: 'Delay Probability',   value: ml ? `${Math.round(ml.delayProbability * 100)}%` : '--', sub: 'Chance of slippage', subColor: '#4a6080' },
    { label: 'Completion Velocity', value: `${stats.completionRate}%`, sub: `${stats.completed} of ${stats.totalTasks} done`, subColor: '#4a6080' },
    { label: 'Workload Density',    value: ml ? ml.workloadIndex : '--', sub: 'tasks/dev', subColor: '#4a6080', unit: '' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2" style={{ color: '#a78bfa' }}>
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest">Machine Learning Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-[#e8f4ff]">Project Risk & Capacity Analytics</h1>
          <p className="text-xs text-[#4a6080] mt-1">Multi-factor forecasting powered by Python ML microservice</p>
        </div>
        <div className="flex items-center space-x-3">
          <select value={selectedProjectId}
            onChange={(e) => { setSelectedProjectId(e.target.value); fetchAnalytics(e.target.value); }}
            className="vyuha-input rounded-xl px-4 py-2 text-xs">
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={handleRunAnalysis} disabled={analyzing}
            className="btn-vyuha flex items-center space-x-2 px-4 py-2 rounded-xl text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Processing ML...' : 'Compute Predictions'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#4a6080]">Loading intelligence models...</div>
      ) : !analytics ? (
        <div className="py-20 text-center text-xs text-[#4a6080]">No project data available</div>
      ) : (
        <div className="space-y-6">
          {/* Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {gauges.map(({ label, value, sub, subColor, unit }) => (
              <div key={label} className="p-6 rounded-2xl border border-[#0d2040] space-y-2"
                style={{ background: '#080c16', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
                <span className="text-[10px] uppercase font-bold text-[#4a6080]">{label}</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-[#e8f4ff]" style={{ color: subColor !== '#4a6080' ? subColor : '#e8f4ff' }}>{value}</span>
                  {unit && <span className="text-xs text-[#4a6080]">{unit}</span>}
                </div>
                <span className="text-[11px] font-bold" style={{ color: subColor }}>{sub}</span>
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          {ml && (
            <div className="p-6 rounded-2xl space-y-4"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(8,12,22,0.9) 100%)', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 30px rgba(124,58,237,0.1)' }}>
              <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-widest" style={{ color: '#a78bfa' }}>
                <Sparkles className="w-4 h-4" />
                <span>AI Automated Delivery Recommendations</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ml.recommendations.split(';').map((rec, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-[#0d2040] text-xs text-[#e8f4ff] flex items-start space-x-2.5"
                    style={{ background: '#03040a' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{rec.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Workload */}
          <div className="p-6 rounded-2xl border border-[#0d2040] space-y-4" style={{ background: '#080c16' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#4a6080] flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#00d4ff]" />
              <span>Team Workload & Capacity Breakdown</span>
            </h3>
            {team.length === 0 ? (
              <p className="text-xs text-[#4a6080] py-6 text-center">No assigned task distribution found</p>
            ) : (
              <div className="space-y-4">
                {team.map((m) => {
                  const pct = Math.min(100, Math.round((m.taskCount / Math.max(stats.totalTasks, 1)) * 100));
                  const barColor = m.pendingTasks > 5 ? '#f59e0b' : '#00d4ff';
                  return (
                    <div key={m.user.id} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[#e8f4ff]">
                        <span className="font-semibold">{m.user.name}</span>
                        <span className="text-[#4a6080] text-[11px]">
                          {m.taskCount} tasks ({m.completedTasks} done, {m.pendingTasks} pending) · {m.estimatedHours} hrs
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden border border-[#0d2040]" style={{ background: '#03040a' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${barColor}80` }} />
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
