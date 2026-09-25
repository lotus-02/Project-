import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Search, Users, CheckSquare, ChevronRight } from 'lucide-react';
import api from '../services/api';
import CreateProjectModal from '../components/CreateProjectModal';

const PRIORITY_COLORS = {
  LOW:    { color: '#4a6080', bg: 'rgba(74,96,128,0.15)', border: 'rgba(74,96,128,0.3)' },
  MEDIUM: { color: '#00d4ff', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)' },
  HIGH:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  URGENT: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)' },
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.data.success) setProjects(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#e8f4ff]">Projects</h1>
          <p className="text-xs text-[#4a6080] mt-1">Manage your organization's delivery pipelines</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="btn-vyuha flex items-center space-x-2 px-4 py-2 rounded-xl text-xs">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#4a6080] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="vyuha-input w-full pl-10 pr-4 py-2 rounded-xl text-xs"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#4a6080]">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-[#0d2040] space-y-3">
          <FolderKanban className="w-10 h-10 text-[#0d2040] mx-auto" />
          <p className="text-xs text-[#4a6080]">No projects found</p>
          <button onClick={() => setShowModal(true)} className="text-xs text-[#00d4ff] hover:underline">Create your first project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => {
            const pc = PRIORITY_COLORS[proj.priority] || PRIORITY_COLORS.MEDIUM;
            return (
              <Link
                key={proj.id}
                to={`/projects/${proj.id}`}
                className="group flex flex-col justify-between space-y-4 p-5 rounded-2xl border border-[#0d2040] transition-all duration-200 hover:border-[#00d4ff30]"
                style={{ background: '#080c16', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(0,212,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{ color: pc.color, background: pc.bg, border: `1px solid ${pc.border}` }}>
                      {proj.priority || 'MEDIUM'}
                    </span>
                    <span className={`text-[10px] font-semibold ${proj.status === 'active' ? 'text-[#00d4ff]' : 'text-[#4a6080]'}`}>
                      ● {proj.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#e8f4ff] group-hover:text-[#00d4ff] transition line-clamp-1">{proj.name}</h3>
                  <p className="text-xs text-[#4a6080] mt-1 line-clamp-2 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#0d2040] flex items-center justify-between text-xs text-[#4a6080]">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{proj._count?.tasks || 0} tasks</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{proj._count?.members || 1}</span>
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0d2040] group-hover:text-[#00d4ff] group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreated={() => fetchProjects()} />}
    </div>
  );
}
