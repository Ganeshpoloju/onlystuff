import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Users, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

function GroupBuyCard({ gb }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const pct = Math.min((gb.committedQty / gb.targetQty) * 100, 100);
  const isMine = gb.initiator?.id === user?.id;
  const isMember = gb._count?.members > 0;

  const extend = useMutation({
    mutationFn: () => api.post(`/group-buys/${gb.id}/extend`),
    onSuccess: () => { qc.invalidateQueries(['myGroupBuys']); toast.success('Extended by 24 hours'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link to={`/listings/${gb.listingId}`} className="font-semibold text-sm text-gray-900 hover:text-brand-500 line-clamp-1">{gb.listing?.title}</Link>
          <p className="text-xs text-gray-500 mt-0.5">₹{gb.targetPricePerUnit?.toLocaleString('en-IN')}/unit · Target: {gb.targetQty} units</p>
        </div>
        <Badge variant={gb.status === 'locked' ? 'success' : 'brand'}>{gb.status}</Badge>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="flex items-center gap-1"><Users size={11} /> {gb.committedQty} / {gb.targetQty} units</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {formatDistanceToNow(new Date(gb.expiresAt), { addSuffix: true })}</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-orange-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <Link to={`/listings/${gb.listingId}`} className="flex-1 btn-secondary text-xs px-3 py-2 rounded-xl text-center">View Listing</Link>
        {isMine && gb.status === 'open' && !gb.extendedAt && (
          <Button variant="secondary" className="text-xs px-3 py-2 rounded-xl" loading={extend.isPending} onClick={() => extend.mutate()}>
            Extend 24h
          </Button>
        )}
      </div>
    </div>
  );
}

export default function GroupBuys() {
  const { data: groupBuys = [], isLoading } = useQuery({
    queryKey: ['myGroupBuys'],
    queryFn: () => api.get('/group-buys').then(r => r.data),
  });

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Group Buys</h1>
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : groupBuys.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">No active group buys</p>
            <p className="text-sm text-gray-400 mt-1">Browse listings to find or start a group buy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupBuys.map(gb => <GroupBuyCard key={gb.id} gb={gb} />)}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
