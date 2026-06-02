import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import OrderCard from '../../components/order/OrderCard';
import Spinner from '../../components/ui/Spinner';
import { ShoppingBag } from 'lucide-react';

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', 'buyer'],
    queryFn: () => api.get('/orders?role=buyer').then(r => r.data),
  });

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">My Orders</h1>
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Browse listings to place your first order</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => <OrderCard key={o.id} order={o} role="buyer" />)}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
