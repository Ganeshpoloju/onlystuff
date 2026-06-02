import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from '../../store/uiStore';
import { Search, Users } from 'lucide-react';

export default function UserManagement() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [reasons, setReasons] = useState({});

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users', submitted],
    queryFn: () => api.get(`/admin/users?q=${submitted}`).then(r => r.data),
  });

  const userAction = useMutation({
    mutationFn: ({ id, action, reason }) => api.patch(`/admin/users/${id}/action`, { action, reason }),
    onSuccess: (_, vars) => { qc.invalidateQueries(['admin', 'users']); toast.success(`User ${vars.action} successful`); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const AADHAAR_VARIANT = { approved: 'success', pending: 'warning', rejected: 'danger' };
  const ROLE_VARIANT = { admin: 'brand', member: 'default', outsider_seller: 'info' };

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">User Management</h1>
        <form className="flex gap-2 mb-4" onSubmit={e => { e.preventDefault(); setSubmitted(q); }}>
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Search by name or email…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary px-4 rounded-xl text-sm font-semibold">Search</button>
        </form>
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16"><Users size={40} className="text-gray-200 mx-auto mb-3" /><p className="text-gray-400">No users found</p></div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatarUrl} name={u.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm text-gray-900">{u.name}</p>
                      <Badge variant={ROLE_VARIANT[u.role] ?? 'default'}>{u.role}</Badge>
                      <Badge variant={AADHAAR_VARIANT[u.aadhaarStatus] ?? 'default'}>{u.aadhaarStatus}</Badge>
                      {u.bannedAt && <Badge variant="danger">Banned</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{u.email}</p>
                    {u.community && <p className="text-xs text-gray-400">{u.community.name}</p>}
                  </div>
                </div>
                {!u.bannedAt && (
                  <>
                    <input
                      className="input text-sm"
                      placeholder="Reason (for warn/ban/suspend)…"
                      value={reasons[u.id] || ''}
                      onChange={e => setReasons(p => ({ ...p, [u.id]: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => userAction.mutate({ id: u.id, action: 'warn', reason: reasons[u.id] })}
                        className="text-xs px-3 py-1.5 rounded-lg border border-yellow-200 text-yellow-700 hover:bg-yellow-50">Warn</button>
                      <button onClick={() => userAction.mutate({ id: u.id, action: 'suspend', reason: reasons[u.id], suspendUntil: new Date(Date.now() + 7*24*60*60*1000).toISOString() })}
                        className="text-xs px-3 py-1.5 rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50">Suspend 7d</button>
                      <button onClick={() => { if (window.confirm(`Ban ${u.name}?`)) userAction.mutate({ id: u.id, action: 'ban', reason: reasons[u.id] }); }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Ban</button>
                    </div>
                  </>
                )}
                {u.bannedAt && (
                  <button onClick={() => userAction.mutate({ id: u.id, action: 'unban' })}
                    className="text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50">Unban</button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
