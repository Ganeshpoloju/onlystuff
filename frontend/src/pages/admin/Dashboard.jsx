import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import { Link } from 'react-router-dom';
import { Users, Building2, Flag, BarChart2, ShieldCheck } from 'lucide-react';

const items = [
  { to: '/admin/aadhaar', icon: ShieldCheck, label: 'Aadhaar Queue', desc: 'Review pending verifications' },
  { to: '/admin/communities', icon: Building2, label: 'Communities', desc: 'Approve community requests' },
  { to: '/admin/reports', icon: Flag, label: 'Reports', desc: 'Review flagged content' },
  { to: '/admin/users', icon: Users, label: 'Users', desc: 'Manage platform users' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics', desc: 'Platform metrics' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Admin Panel</h1>
        <p className="text-sm text-gray-500 mb-6">Platform management for onlyStuff</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="card p-4 hover:shadow-md transition-shadow">
              <Icon size={22} className="text-brand-500 mb-3" />
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
