import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import OrderCard from '../../components/order/OrderCard';
import Spinner from '../../components/ui/Spinner';
import { Package } from 'lucide-react';

export default function OrdersReceived() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', 'seller'],
    queryFn: () => api.get('/orders?role=seller').then(r => r.data),
  });

  const pending = orders.filter(o => o.status === 'placed');
  const active  = orders.filter(o => ['confirmed','in_progress'].includes(o.status));
  const past    = orders.filter(o => ['closed','disputed','fully_closed','cancelled'].includes(o.status));

  function Section({ title, items }) {
    if (!items.length) return null;
    return (
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title} ({items.length})</h2>
        <div className="space-y-3">{items.map(o => <OrderCard key={o.id} order={o} role="seller" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Orders Received</h1>
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Share your listings to start receiving orders</p>
          </div>
        ) : (
          <>
            <Section title="Awaiting confirmation" items={pending} />
            <Section title="Active" items={active} />
            <Section title="Past" items={past} />
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
