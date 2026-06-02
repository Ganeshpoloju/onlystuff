import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Tag, Shield, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import logo from '../../assets/logo.svg';

export default function Navbar() {
  const { user } = useAuthStore();

  return (
    <header className="hidden sm:flex sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-3 items-center justify-between shadow-sm">
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
        <button className="relative text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100">
          <Bell size={20} />
        </button>
        <Link to="/profile">
          <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
        </Link>
      </div>
    </header>
  );
}
