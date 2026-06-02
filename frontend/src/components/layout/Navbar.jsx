import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Tag, Shield, Bell, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNotifications } from '../../hooks/useNotifications';
import Avatar from '../ui/Avatar';
import logo from '../../assets/logo.svg';

function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markRead } = useNotifications();

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-sm text-gray-900">Notifications {unreadCount > 0 && <span className="ml-1 bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">All caught up!</p>
        )}
        {notifications.map(n => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${!n.readAt ? 'bg-brand-50/40' : ''}`}
          >
            <div className="flex items-start gap-3">
              {!n.readAt && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />}
              <div className={!n.readAt ? '' : 'ml-5'}>
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user } = useAuthStore();
  const { unreadCount } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="hidden sm:flex sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-3 items-center justify-between shadow-sm">
      <Link to="/">
        <img src={logo} alt="onlyStuff" className="h-8" />
      </Link>

      <nav className="flex items-center gap-1">
        <NavLink to="/" end className={({ isActive }) =>
          `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100'}`
        }>
          <ShoppingBag size={16} /> Buy
        </NavLink>
        <NavLink to="/sell" className={({ isActive }) =>
          `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100'}`
        }>
          <Tag size={16} /> Sell
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100'}`
          }>
            <Shield size={16} /> Admin
          </NavLink>
        )}
      </nav>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && <NotificationDropdown onClose={() => setShowNotifs(false)} />}
        </div>

        {/* Profile page — coming soon */}
        <Avatar src={user?.avatarUrl} name={user?.name} size="sm" className="cursor-pointer" />
      </div>
    </header>
  );
}
