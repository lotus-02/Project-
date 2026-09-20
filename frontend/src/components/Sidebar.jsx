import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Tasks (Kanban)', path: '/tasks', icon: CheckSquare },
  { name: 'Team Members', path: '/team', icon: Users },
  { name: 'ML Intelligence', path: '/analytics', icon: Sparkles },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldAlert className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-100">SecureTenant</h1>
            <p className="text-[10px] text-emerald-400 font-medium">Enterprise PM & AI</p>
          </div>
        </div>

        {/* Nav list */}
        <div className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Security Info Card */}
      <div className="p-4 m-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-emerald-400 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-[11px]">Tenant Isolated</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Zero cross-tenant leakage. Strict JWT & PBAC access enforcement.
        </p>
      </div>
    </aside>
  );
}
