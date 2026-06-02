import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import { Link } from 'react-router-dom';
import { Users, Building2, Flag, BarChart2, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function AdminDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => api.get('/admin/analytics').then(r => r.data),
    staleTime: 60_000,
  });
  const { data: aadhaarQueue } = useQuery({
    queryKey: ['admin', 'aadhaar-queue'],
    queryFn: () => api.get('/admin/aadhaar-queue').then(r => r.data),
    staleTime: 30_000,
  });
  const { data: communityRequests } = useQuery({
    queryKey: ['admin', 'communityRequests'],
    queryFn: () => api.get('/admin/community-requests').then(r => r.data),
    staleTime: 30_000,
  });
  const { data: reports } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => api.get('/admin/reports').then(r => r.data),
    staleTime: 30_000,
  });

  const items = [
    {
      to: '/admin/aadhaar',
      icon: ShieldCheck,
      label: 'Aadhaar Queue',
      desc: 'Review pending verifications',
      count: aadhaarQueue?.length,
      urgent: aadhaarQueue?.length > 0,
    },
    {
      to: '/admin/communities',
      icon: Building2,
      label: 'Communities',
      desc: 'Approve community requests',
      count: communityRequests?.length,
      urgent: communityRequests?.length > 0,
    },
    {
      to: '/admin/reports',
      icon: Flag,
      label: 'Reports',
      desc: 'Review flagged content',
      count: reports?.length,
      urgent: reports?.length > 0,
    },
    {
      to: '/admin/users',
      icon: Users,
      label: 'Users',
      desc: 'Manage platform users',
      count: analytics?.userCount,
      urgent: false,
    },
    {
      to: '/admin/analytics',
      icon: BarChart2,
      label: 'Analytics',
      desc: 'Platform metrics',
      count: null,
      urgent: false,
    },
  ];

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Admin Panel</h1>
        <p className="text-sm text-gray-500 mb-6">Platform management for onlyStuff</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map(({ to, icon: Icon, label, desc, count, urgent }) => (
            <Link key={to} to={to} className="card p-4 hover:shadow-md transition-shadow relative group">
              <div className="flex items-start justify-between mb-3">
                <Icon size={22} className={urgent ? 'text-red-500' : 'text-brand-500'} />
                {count != null && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    urgent
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </div>
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              {urgent && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </Link>
          ))}
        </div>

        {/* Summary strip */}
        {analytics && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', value: analytics.userCount },
              { label: 'Active Listings', value: analytics.listingCount },
              { label: 'Total Orders', value: analytics.orderCount },
              { label: 'Group Buys', value: analytics.groupBuyCount },
            ].map(({ label, value }) => (
              <div key={label} className="card p-3 text-center">
                <p className="text-2xl font-bold text-brand-500">{value ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
