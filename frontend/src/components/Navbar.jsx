import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldCheck, Building2, User, LogOut, Check } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    api.get('/notifications')
      .then(res => {
        if (res.data.success) setNotifications(res.data.data);
      })
      .catch(() => {});

    const socket = getSocket();
    if (socket) {
      socket.on('notification:new', (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });
    }

    return () => {
      if (socket) socket.off('notification:new');
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded-lg flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-sm tracking-wide">{user?.tenantName || 'Organization'}</span>
        </div>
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700/60 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-slate-300">{user?.role || 'Member'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg relative transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-700/60 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-300 uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-emerald-400 hover:underline flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-700/40">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-3 text-xs ${n.isRead ? 'opacity-60' : 'bg-slate-750'}`}>
                      <p className="font-medium text-slate-200">{n.title}</p>
                      <p className="text-slate-400 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-semibold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
              <p className="text-[10px] text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
