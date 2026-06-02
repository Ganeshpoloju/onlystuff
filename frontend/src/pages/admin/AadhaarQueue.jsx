import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useState } from 'react';

// Convert a Drive view URL to a direct thumbnail URL that loads in <img> tags
function driveThumb(url) {
  if (!url) return '';
  // Extract file ID from both formats:
  // https://drive.google.com/uc?export=view&id=FILE_ID
  // https://drive.google.com/file/d/FILE_ID/view
  const match = url.match(/[?&]id=([^&]+)/) || url.match(/\/d\/([^/]+)\//);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
  return url;
}

export default function AadhaarQueue() {
  const qc = useQueryClient();
  const [rejectReason, setRejectReason] = useState({});

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'aadhaar-queue'],
    queryFn: () => api.get('/admin/aadhaar-queue').then(r => r.data),
  });

  const approve = useMutation({
    mutationFn: (id) => api.patch(`/admin/aadhaar/${id}/approve`),
    onSuccess: () => qc.invalidateQueries(['admin', 'aadhaar-queue']),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => api.patch(`/admin/aadhaar/${id}/reject`, { reason }),
    onSuccess: () => qc.invalidateQueries(['admin', 'aadhaar-queue']),
  });

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-1">Aadhaar Verification Queue</h1>
        <p className="text-sm text-gray-500 mb-6">{users?.length ?? 0} pending</p>
        {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> :
          users?.length === 0 ? <p className="text-center text-gray-400 py-16">All clear — no pending verifications</p> :
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="card p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={u.avatarUrl} name={u.name} size="md" />
                  <div><p className="font-semibold text-sm">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[['Front', u.aadhaarFrontUrl], ['Back', u.aadhaarBackUrl]].map(([label, url]) => (
                    <a key={label} href={url} target="_blank" rel="noreferrer" className="block">
                      <div className="rounded-lg border border-gray-200 w-full h-32 bg-gray-50 overflow-hidden relative group">
                        <img
                          src={driveThumb(url)}
                          alt={label}
                          className="w-full h-full object-cover"
                          onError={e => {
                            // Fallback: show a placeholder with open-in-new-tab link
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden absolute inset-0 flex-col items-center justify-center gap-1 text-gray-400 text-xs">
                          <span className="text-2xl">🪪</span>
                          <span>{label} — click to open</span>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">{label}</div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">Open full size ↗</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <input className="input mb-3 text-sm" placeholder="Rejection reason (if rejecting)..." value={rejectReason[u.id] || ''} onChange={e => setRejectReason(p => ({ ...p, [u.id]: e.target.value }))} />
                <div className="flex gap-2">
                  <Button variant="primary" className="flex-1 justify-center text-sm" loading={approve.isPending} onClick={() => approve.mutate(u.id)}>Approve</Button>
                  <Button variant="danger" className="flex-1 justify-center text-sm" loading={reject.isPending} onClick={() => reject.mutate({ id: u.id, reason: rejectReason[u.id] || 'Document unclear' })}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        }
      </main>
      <BottomNav />
    </div>
  );
}
