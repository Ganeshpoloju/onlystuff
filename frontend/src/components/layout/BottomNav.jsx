import { NavLink } from 'react-router-dom';
import { ShoppingBag, Tag, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function BottomNav() {
  const { user } = useAuthStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-40 sm:hidden">
      <div className="flex">
        <NavLink to="/" end className={({ isActive }) =>
          `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${isActive ? 'text-brand-500' : 'text-gray-500'}`
        }>
          <ShoppingBag size={20} />
          <span>Buy</span>
        </NavLink>
        <NavLink to="/sell" className={({ isActive }) =>
          `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${isActive ? 'text-brand-500' : 'text-gray-500'}`
        }>
          <Tag size={20} />
          <span>Sell</span>
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${isActive ? 'text-brand-500' : 'text-gray-500'}`
          }>
            <Shield size={20} />
            <span>Admin</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
