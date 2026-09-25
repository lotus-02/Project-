import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const navItems = [
  { name: 'Dashboard',       path: '/',          icon: LayoutDashboard },
  { name: 'Projects',        path: '/projects',  icon: FolderKanban },
  { name: 'Tasks Board',     path: '/tasks',     icon: CheckSquare },
  { name: 'Team Members',    path: '/team',      icon: Users },
  { name: 'ML Intelligence', path: '/analytics', icon: Sparkles },
];

export default function Sidebar() {
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();

  const renderNavLinks = (isCompact = false) => (
    <div className={`space-y-1 ${isCompact ? 'p-2' : 'p-4'}`}>
      {!isCompact && (
        <p className="px-3 text-[10px] font-bold text-[#4a6080] uppercase tracking-widest mb-3">
          Workspace
        </p>
      )}
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => closeMobileSidebar()}
            title={isCompact ? item.name : undefined}
            className={({ isActive }) =>
              `relative flex items-center ${
                isCompact ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
              } rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#00d4ff12] text-[#00d4ff] border border-[#00d4ff30]'
                  : 'text-[#4a6080] hover:text-[#e8f4ff] hover:bg-[#0d1220]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className={`absolute ${
                      isCompact ? 'left-1 top-1/2 -translate-y-1/2 w-1 h-6' : 'left-0 top-1/2 -translate-y-1/2 w-0.5 h-5'
                    } bg-[#00d4ff] rounded-full`}
                    style={{ boxShadow: '0 0 8px #00d4ff' }}
                  />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00d4ff]' : ''}`} />
                {!isCompact && <span>{item.name}</span>}
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Slide Drawer (< md) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between w-64 border-r border-[#0d2040] bg-[#080c16] transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#0d2040]">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066ff] to-[#00d4ff] flex items-center justify-center shadow-lg"
                style={{ boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}
              >
                <span className="text-[#03040a] font-black text-sm">V</span>
              </div>
              <div>
                <h1 className="font-black text-sm tracking-widest text-[#e8f4ff]">
                  VY<span className="text-[#00d4ff]">Ū</span>HA
                </h1>
                <p className="text-[10px] text-[#4a6080] font-medium tracking-wider">
                  ENTERPRISE PM · AI
                </p>
              </div>
            </div>
            <button
              onClick={closeMobileSidebar}
              className="p-1.5 rounded-lg text-[#4a6080] hover:text-[#00d4ff] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {renderNavLinks(false)}
        </div>

        {/* Security Badge */}
        <div className="p-4 m-4 rounded-xl border border-[#0d2040] bg-[#03040a] text-xs">
          <div className="flex items-center space-x-2 mb-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-neon-pulse"
              style={{ boxShadow: '0 0 6px #00d4ff' }}
            />
            <ShieldCheck className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span className="font-bold text-[#00d4ff] text-[11px] tracking-wider">TENANT ISOLATED</span>
          </div>
          <p className="text-[#4a6080] leading-relaxed text-[10px]">
            Strict JWT &amp; PBAC access enforcement.
          </p>
        </div>
      </aside>

      {/* Desktop Sliding Collapsible Sidebar (>= md) */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 border-r border-[#0d2040] bg-[#080c16] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Header with slide toggle button */}
          <div
            className={`h-16 flex items-center border-b border-[#0d2040] transition-all duration-300 ${
              isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066ff] to-[#00d4ff] flex items-center justify-center shadow-lg shrink-0 cursor-pointer"
                style={{ boxShadow: '0 0 16px rgba(0,212,255,0.4)' }}
                onClick={toggleSidebar}
                title={isCollapsed ? 'Click to expand sidebar' : undefined}
              >
                <span className="text-[#03040a] font-black text-sm">V</span>
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden whitespace-nowrap animate-fade-in">
                  <h1 className="font-black text-sm tracking-widest text-[#e8f4ff]">
                    VY<span className="text-[#00d4ff]">Ū</span>HA
                  </h1>
                  <p className="text-[10px] text-[#4a6080] font-medium tracking-wider">
                    ENTERPRISE PM · AI
                  </p>
                </div>
              )}
            </div>

            {/* Slide Toggle Button */}
            {!isCollapsed && (
              <button
                onClick={toggleSidebar}
                title="Collapse sidebar (Slide in)"
                className="p-1.5 rounded-lg border border-[#0d2040] text-[#4a6080] hover:text-[#00d4ff] hover:border-[#00d4ff30] hover:bg-[#00d4ff08] transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle button when collapsed */}
          {isCollapsed && (
            <div className="flex justify-center pt-3 pb-1">
              <button
                onClick={toggleSidebar}
                title="Expand sidebar (Slide out)"
                className="p-1.5 rounded-lg border border-[#0d2040] text-[#4a6080] hover:text-[#00d4ff] hover:border-[#00d4ff30] hover:bg-[#00d4ff08] transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Nav Links */}
          {renderNavLinks(isCollapsed)}
        </div>

        {/* Security Badge */}
        {isCollapsed ? (
          <div className="p-3 m-2 rounded-xl border border-[#0d2040] bg-[#03040a] flex items-center justify-center" title="Tenant Isolated: Strict PBAC enforcement">
            <ShieldCheck className="w-4 h-4 text-[#00d4ff]" />
          </div>
        ) : (
          <div className="p-4 m-4 rounded-xl border border-[#0d2040] bg-[#03040a] text-xs transition-opacity duration-300">
            <div className="flex items-center space-x-2 mb-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-neon-pulse"
                style={{ boxShadow: '0 0 6px #00d4ff' }}
              />
              <ShieldCheck className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span className="font-bold text-[#00d4ff] text-[11px] tracking-wider">
                TENANT ISOLATED
              </span>
            </div>
            <p className="text-[#4a6080] leading-relaxed text-[10px]">
              Zero cross-tenant leakage. Strict JWT &amp; PBAC access enforcement.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
