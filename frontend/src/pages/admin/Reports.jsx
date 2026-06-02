import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from '../../store/uiStore';
import { Flag } from 'lucide-react';
import { Link } from 'react-router-dom';

const ACTIONS = [
  { value: 'dismiss',        label: 'Dismiss' },
  { value: 'warn_user',      label: 'Warn User' },
  { value: 'remove_listing', label: 'Remove Listing' },
  { value: 'ban_user',       label: 'Ban User' },
];

export default function Reports() {
  const qc = useQueryClient();
  const [reasons, setReasons] = useState({});

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => api.get('/admin/reports').then(r => r.data),
  });

  const action = useMutation({
    mutationFn: ({ id, act }) => api.patch(`/admin/reports/${id}/action`, { action: act, reason: reasons[id] }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'reports']); toast.success('Action taken'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Reports Queue</h1>
        <p className="text-sm text-gray-500 mb-4">{reports.length} open</p>
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <Flag size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No open reports</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(r => (
              <div key={r.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="danger">{r.reason}</Badge>
                      {r.listing && <Link to={`/listings/${r.listing.id}`} className="text-sm font-semibold text-brand-500 hover:underline">{r.listing.title}</Link>}
                      {r.reportedUser && <span className="text-sm font-semibold text-gray-900">{r.reportedUser.name}</span>}
                    </div>
                    {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">Reported by {r.reporter?.name}</p>
                  </div>
                </div>
                <input
                  className="input text-sm"
                  placeholder="Admin note / reason (for warn/ban)…"
                  value={reasons[r.id] || ''}
                  onChange={e => setReasons(p => ({ ...p, [r.id]: e.target.value }))}
                />
                <div className="flex flex-wrap gap-2">
                  {ACTIONS.map(a => (
                    <button key={a.value} onClick={() => action.mutate({ id: r.id, act: a.value })}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${a.value === 'ban_user' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >{a.label}</button>
                  ))}
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
