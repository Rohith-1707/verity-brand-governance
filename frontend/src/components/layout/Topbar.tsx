import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  LogOut,
  Building,
  UserCheck,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, NotificationItem } from '../../api';

interface TopbarProps {
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { user, theme, toggleTheme, logout, demoLogin } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const list = await api.getNotifications();
        setNotifications(list);
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleRoleSwitch = async (newRole: 'admin' | 'creator' | 'reviewer') => {
    if (newRole === user?.role) return;
    setSwitchingRole(true);
    try {
      await demoLogin(newRole);
    } finally {
      setSwitchingRole(false);
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile trigger & Organization */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-slate-800 text-slate-300">
            <Building className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200">
              {user?.org_name || 'Acme Global Technologies'}
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-emerald-400 font-medium">Enterprise Governance Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Quick Role Switcher, Notifications, Theme, Logout */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Quick Role Switcher for Hackathon Testing */}
        <div className="hidden sm:flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center space-x-1">
            <UserCheck className="w-3 h-3 text-cyan-400 inline" />
            <span>Role:</span>
          </span>
          {(['admin', 'reviewer', 'creator'] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleSwitch(r)}
              disabled={switchingRole}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all capitalize ${
                user?.role === r
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* In-App Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 relative transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    In-App Notifications ({notifications.length})
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No new notifications.
                  </div>
                ) : (
                  notifications.slice(0, 15).map((n) => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-slate-800/40 rounded transition">
                      <p className="text-xs text-slate-200 leading-snug">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500 inline" />
                        <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 transition"
          title="Toggle light / dark mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Sign Out */}
        <button
          onClick={logout}
          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
