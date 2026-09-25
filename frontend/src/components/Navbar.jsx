import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldCheck, Building2, LogOut, Check } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  return (
    <header
      className="h-16 sticky top-0 z-30 px-6 flex items-center justify-between border-b border-[#0d2040]"
      style={{ background: 'rgba(8,12,22,0.92)', backdropFilter: 'blur(16px)' }}
    >
      {/* Left: org + role */}
      <div className="flex items-center space-x-3">
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
      </div>

      {/* Right: bell + user */}
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
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[#03040a] font-black text-[10px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#0066ff,#00d4ff)', boxShadow:'0 0 8px rgba(0,212,255,0.6)' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl py-2 z-50 border border-[#0d2040]"
              style={{ background: '#080c16' }}>
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

        {/* User + Logout */}
        <div className="flex items-center space-x-3 pl-4 border-l border-[#0d2040]">
          <div className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-[#00d4ff] border border-[#00d4ff30]"
              style={{ background: 'rgba(0,212,255,0.08)', boxShadow:'0 0 8px rgba(0,212,255,0.15)' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-[#e8f4ff]">{user?.name}</p>
              <p className="text-[10px] text-[#4a6080]">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-lg transition text-[#4a6080] hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
