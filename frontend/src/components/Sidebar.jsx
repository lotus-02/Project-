import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard',       path: '/',          icon: LayoutDashboard },
  { name: 'Projects',        path: '/projects',  icon: FolderKanban },
  { name: 'Tasks Board',     path: '/tasks',     icon: CheckSquare },
  { name: 'Team Members',    path: '/team',      icon: Users },
  { name: 'ML Intelligence', path: '/analytics', icon: Sparkles },
];

export default function Sidebar() {
  return (
    <aside className="w-64 flex flex-col justify-between shrink-0 border-r border-[#0d2040] bg-[#080c16]">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-[#0d2040]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066ff] to-[#00d4ff] flex items-center justify-center shadow-lg" style={{boxShadow:'0 0 16px rgba(0,212,255,0.4)'}}>
              <span className="text-[#03040a] font-black text-sm">V</span>
            </div>
            <div>
              <h1 className="font-black text-sm tracking-widest text-[#e8f4ff]">VY<span className="text-[#00d4ff]">Ū</span>HA</h1>
              <p className="text-[10px] text-[#4a6080] font-medium tracking-wider">ENTERPRISE PM · AI</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="p-4 space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#4a6080] uppercase tracking-widest mb-3">Workspace</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#00d4ff12] text-[#00d4ff] border border-[#00d4ff30]'
                      : 'text-[#4a6080] hover:text-[#e8f4ff] hover:bg-[#0d1220]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#00d4ff] rounded-full" style={{boxShadow:'0 0 8px #00d4ff'}} />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00d4ff]' : ''}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Security Badge */}
      <div className="p-4 m-4 rounded-xl border border-[#0d2040] bg-[#03040a] text-xs">
        <div className="flex items-center space-x-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-neon-pulse" style={{boxShadow:'0 0 6px #00d4ff'}} />
          <ShieldCheck className="w-3.5 h-3.5 text-[#00d4ff]" />
          <span className="font-bold text-[#00d4ff] text-[11px] tracking-wider">TENANT ISOLATED</span>
        </div>
        <p className="text-[#4a6080] leading-relaxed text-[10px]">
          Zero cross-tenant leakage. Strict JWT & PBAC access enforcement.
        </p>
      </div>
    </aside>
  );
}
