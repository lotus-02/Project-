import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  Bell,
  ShieldCheck,
  Building2,
  LogOut,
  Check,
  KeyRound,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Menu,
  PanelLeft,
  User as UserIcon
} from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import ChangePasswordModal from './ChangePasswordModal';
import EmailVerificationModal from './EmailVerificationModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications')
      .then(res => { if (res.data.success) setNotifications(res.data.data); })
      .catch(() => {});
    const socket = getSocket();
    if (socket) {
      socket.on('notification:new', (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });
    }
    return () => { if (socket) socket.off('notification:new'); };
  }, [user]);

  // Click outside listener for profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  return (
    <>
      <header
        className="h-16 sticky top-0 z-30 px-6 flex items-center justify-between border-b border-[#0d2040]"
        style={{ background: 'rgba(8,12,22,0.92)', backdropFilter: 'blur(16px)' }}
      >
        {/* Left: slide toggle + org + role */}
        <div className="flex items-center space-x-3">
          {/* Mobile slide drawer toggle */}
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 rounded-lg border border-[#0d2040] text-[#4a6080] hover:text-[#00d4ff] hover:border-[#00d4ff30] hover:bg-[#00d4ff08] transition"
            title="Toggle navigation drawer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop slide toggle button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center p-2 rounded-lg border border-[#0d2040] text-[#4a6080] hover:text-[#00d4ff] hover:border-[#00d4ff30] hover:bg-[#00d4ff08] transition"
            title={isCollapsed ? "Slide expand sidebar (Full menu)" : "Slide collapse sidebar (More screen space)"}
          >
            <PanelLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180 text-[#00d4ff]' : ''}`} />
          </button>

          <div
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[#0066ff30] text-[#00d4ff] text-xs font-semibold tracking-wide"
            style={{ background: 'rgba(0,102,255,0.08)' }}
          >
            <Building2 className="w-4 h-4 text-[#0066ff]" />
            <span>{user?.tenantName || 'Organization'}</span>
          </div>
          <div
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md border border-[#7c3aed30] text-[11px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(124,58,237,0.08)', color: '#a78bfa' }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{user?.role || 'Member'}</span>
          </div>

          {/* Email Verification status badge */}
          {user?.isEmailVerified ? (
            <div
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md border border-emerald-500/30 text-[11px] font-bold text-emerald-400"
              style={{ background: 'rgba(16,185,129,0.08)' }}
              title="Your email is verified"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
          ) : (
            <button
              onClick={() => setShowEmailVerification(true)}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md border border-amber-500/40 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition animate-pulse"
              style={{ background: 'rgba(245,158,11,0.1)' }}
              title="Click to verify your email"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Verify Email</span>
            </button>
          )}
        </div>

        {/* Right: bell + user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg transition relative"
              style={{ color: '#4a6080' }}
              onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
              onMouseLeave={e => e.currentTarget.style.color = '#4a6080'}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 w-4 h-4 rounded-full text-[#03040a] font-black text-[10px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#0066ff,#00d4ff)', boxShadow:'0 0 8px rgba(0,212,255,0.6)' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl py-2 z-50 border border-[#0d2040]"
                style={{ background: '#080c16' }}
              >
                <div className="px-4 py-2 border-b border-[#0d2040] flex items-center justify-between">
                  <span className="font-bold text-[11px] text-[#e8f4ff] uppercase tracking-wider">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[11px] text-[#00d4ff] hover:underline flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#0d2040]">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#4a6080] p-4 text-center">No notifications yet</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 text-xs ${n.isRead ? 'opacity-50' : ''}`}>
                        <p className="font-semibold text-[#e8f4ff]">{n.title}</p>
                        <p className="text-[#4a6080] mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-[#4a6080] block mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative pl-4 border-l border-[#0d2040]" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-[#00d4ff08] transition text-left"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-[#00d4ff] border border-[#00d4ff30]"
                style={{ background: 'rgba(0,212,255,0.08)', boxShadow:'0 0 8px rgba(0,212,255,0.15)' }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-[#e8f4ff]">{user?.name}</p>
                <p className="text-[10px] text-[#4a6080] leading-none">{user?.email}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#4a6080]" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl py-2 z-50 border border-[#0d2040]"
                style={{ background: '#080c16', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-[#0d2040]">
                  <p className="text-xs font-bold text-[#e8f4ff]">{user?.name}</p>
                  <p className="text-[11px] text-[#4a6080] truncate">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#00d4ff10] text-[#00d4ff] border border-[#00d4ff30]">
                      {user?.role}
                    </span>
                    {user?.isEmailVerified ? (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Unverified
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1">
                  {!user?.isEmailVerified && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowEmailVerification(true);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-amber-400 hover:bg-amber-500/10 flex items-center space-x-2.5 transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Verify Email Address</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowChangePassword(true);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-[#8fa3bf] hover:text-[#00d4ff] hover:bg-[#00d4ff08] flex items-center space-x-2.5 transition"
                  >
                    <KeyRound className="w-4 h-4 text-[#0066ff]" />
                    <span>Change Password</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#0d2040]">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center space-x-2.5 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
      />
    </>
  );
}
