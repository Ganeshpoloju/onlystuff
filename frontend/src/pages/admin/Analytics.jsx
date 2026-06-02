import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Spinner from '../../components/ui/Spinner';

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => api.get('/admin/analytics').then(r => r.data),
  });

  const stats = [
    { label: 'Total Users', value: data?.userCount },
    { label: 'Active Listings', value: data?.listingCount },
    { label: 'Total Orders', value: data?.orderCount },
    { label: 'Group Buys', value: data?.groupBuyCount },
  ];

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">Analytics</h1>
        {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> :
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value }) => (
              <div key={label} className="card p-4 text-center">
                <p className="text-3xl font-bold text-brand-500">{value ?? '—'}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        }
      </main>
      <BottomNav />
    </div>
  );
}
