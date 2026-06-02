import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from '../../store/uiStore';
import { Plus, Pencil, Pause, Play, Trash2, Tag } from 'lucide-react';

const STATUS_VARIANT = { active: 'success', paused: 'warning', out_of_stock: 'danger', pending_review: 'warning', removed: 'default', expired: 'default', draft: 'default' };

function ListingRow({ listing }) {
  const qc = useQueryClient();

  const update = useMutation({
    mutationFn: (data) => api.patch(`/listings/${listing.id}`, data),
    onSuccess: () => qc.invalidateQueries(['myListings']),
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const del = useMutation({
    mutationFn: () => api.delete(`/listings/${listing.id}`),
    onSuccess: () => { qc.invalidateQueries(['myListings']); toast.success('Listing removed'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const isPaused = listing.status === 'paused';
  const canEdit = !['removed','expired'].includes(listing.status);

  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          {listing.photos?.[0]
            ? <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">{listing.type === 'service' ? '🔧' : '📦'}</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/listings/${listing.id}`} className="font-semibold text-sm text-gray-900 hover:text-brand-500 line-clamp-1">{listing.title}</Link>
            <Badge variant={STATUS_VARIANT[listing.status] ?? 'default'} className="shrink-0">{listing.status.replace('_',' ')}</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{listing.category}</p>
          <p className="text-sm font-semibold text-brand-500 mt-1">
            {listing.pricingModel === 'fixed' ? `₹${listing.fixedPrice?.toLocaleString('en-IN')}` : `From ₹${listing.priceSlabs?.[0]?.pricePerUnit?.toLocaleString('en-IN')}`}
            {listing.moq && <span className="text-xs text-gray-400 font-normal ml-1">MOQ: {listing.moq}</span>}
          </p>
        </div>
      </div>
      {canEdit && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
          <Link to={`/sell/listings/${listing.id}/edit`} className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Pencil size={12} /> Edit
          </Link>
          <button
            onClick={() => update.mutate({ status: isPaused ? 'active' : 'paused' })}
            className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            {isPaused ? <><Play size={12} /> Reactivate</> : <><Pause size={12} /> Pause</>}
          </button>
          <button
            onClick={() => { if (window.confirm('Remove this listing?')) del.mutate(); }}
            className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-red-500 hover:border-red-300"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyListings() {
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['myListings'],
    queryFn: () => api.get('/listings?sellerId=me').then(r => r.data.listings),
  });

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
          <Link to="/sell/new" className="btn-primary text-sm px-4 py-2 rounded-xl flex items-center gap-1.5">
            <Plus size={16} /> New Listing
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">No listings yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first listing to start selling</p>
            <Link to="/sell/new" className="btn-primary inline-flex mt-4 text-sm px-5 py-2.5 rounded-xl items-center gap-2"><Plus size={16} /> Create Listing</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map(l => <ListingRow key={l.id} listing={l} />)}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
