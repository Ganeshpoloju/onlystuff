import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from '../../store/uiStore';
import { MapPin, Building2 } from 'lucide-react';

export default function CommunityRequests() {
  const qc = useQueryClient();
  const [rejectReasons, setRejectReasons] = useState({});

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin', 'communityRequests'],
    queryFn: () => api.get('/admin/community-requests').then(r => r.data),
  });

  const approve = useMutation({
    mutationFn: (id) => api.patch(`/admin/communities/${id}/approve`),
    onSuccess: () => { qc.invalidateQueries(['admin', 'communityRequests']); toast.success('Community approved'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => api.patch(`/admin/communities/${id}/reject`, { reason }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'communityRequests']); toast.info('Community request rejected'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Community Requests</h1>
        <p className="text-sm text-gray-500 mb-4">{requests.length} pending</p>
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No pending community requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r.id} className="card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-brand-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{r.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={12} />{r.address}</p>
                    {r.lat && <p className="text-xs text-gray-400 mt-0.5">Coordinates: {r.lat.toFixed(4)}, {r.lng.toFixed(4)}</p>}
                    {r.householdCount && <p className="text-xs text-gray-400">~{r.householdCount} households</p>}
                  </div>
                </div>
                {r.requestedBy && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-50 pt-2">
                    <Avatar src={r.requestedBy.avatarUrl} name={r.requestedBy.name} size="sm" />
                    Requested by {r.requestedBy.name} · {r.requestedBy.email}
                  </div>
                )}
                <input
                  className="input text-sm"
                  placeholder="Rejection reason (if rejecting)…"
                  value={rejectReasons[r.id] || ''}
                  onChange={e => setRejectReasons(p => ({ ...p, [r.id]: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button className="flex-1 justify-center text-sm" loading={approve.isPending} onClick={() => approve.mutate(r.id)}>Approve</Button>
                  <Button variant="danger" className="flex-1 justify-center text-sm" loading={reject.isPending} onClick={() => reject.mutate({ id: r.id, reason: rejectReasons[r.id] || 'Does not meet requirements' })}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
