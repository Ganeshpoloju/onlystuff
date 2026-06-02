import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import SlabPricingEditor from '../../components/listing/SlabPricingEditor';
import { toast } from '../../store/uiStore';
import { ChevronLeft } from 'lucide-react';

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.get(`/listings/${id}`).then(r => r.data),
  });

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!listing) return;
    setForm({
      title: listing.title,
      description: listing.description,
      fixedPrice: listing.fixedPrice ?? '',
      moq: listing.moq ?? '',
      stockQty: listing.stockQty ?? '',
      visibility: listing.visibility,
      status: listing.status,
      slabs: listing.priceSlabs?.length > 0 ? listing.priceSlabs.map(s => ({ fromQty: s.fromQty, toQty: s.toQty ?? '', pricePerUnit: s.pricePerUnit })) : [{ fromQty: '1', toQty: '', pricePerUnit: '' }],
    });
  }, [listing]);

  const update = useMutation({
    mutationFn: (data) => api.patch(`/listings/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['listing', id]); qc.invalidateQueries(['myListings']); toast.success('Listing updated'); navigate('/sell'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update'),
  });

  if (isLoading || !form) return (
    <div className="min-h-screen"><Navbar /><div className="flex justify-center py-16"><Spinner size="lg" /></div><BottomNav /></div>
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleSubmit(e) {
    e.preventDefault();
    update.mutate({
      title: form.title,
      description: form.description,
      fixedPrice: listing.pricingModel === 'fixed' ? form.fixedPrice : undefined,
      moq: form.moq || undefined,
      stockQty: listing.type === 'product' ? form.stockQty : undefined,
      visibility: form.visibility,
      slabs: listing.pricingModel === 'slab' ? form.slabs : undefined,
    });
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700"><ChevronLeft size={22} /></button>
          <h1 className="text-xl font-bold">Edit Listing</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="card p-5 space-y-4">
            <Field label="Title">
              <input className="input" maxLength={100} value={form.title} onChange={e => set('title', e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea className="input resize-none h-28" maxLength={2000} value={form.description} onChange={e => set('description', e.target.value)} />
            </Field>
          </div>

          <div className="card p-5 space-y-4">
            {listing.pricingModel === 'fixed'
              ? <Field label="Price (₹)"><input type="number" min="0" step="0.01" className="input" value={form.fixedPrice} onChange={e => set('fixedPrice', e.target.value)} /></Field>
              : <Field label="Price tiers"><SlabPricingEditor slabs={form.slabs} onChange={v => set('slabs', v)} /></Field>
            }
            <Field label="MOQ" hint="Optional">
              <input type="number" min="1" className="input" value={form.moq} onChange={e => set('moq', e.target.value)} />
            </Field>
            {listing.type === 'product' && (
              <Field label="Stock quantity">
                <input type="number" min="0" className="input" value={form.stockQty} onChange={e => set('stockQty', e.target.value)} />
              </Field>
            )}
            <Field label="Visibility">
              <div className="flex gap-2">
                {[['everyone','Everyone'],['community','Community only']].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => set('visibility', v)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${form.visibility === v ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600'}`}
                  >{l}</button>
                ))}
              </div>
            </Field>
          </div>

          <div className="flex gap-3 pb-2">
            <Button type="button" variant="secondary" className="flex-1 justify-center" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" className="flex-1 justify-center" loading={update.isPending}>Save Changes</Button>
          </div>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
