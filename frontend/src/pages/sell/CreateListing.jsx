import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Button from '../../components/ui/Button';
import PhotoUpload from '../../components/listing/PhotoUpload';
import SlabPricingEditor from '../../components/listing/SlabPricingEditor';
import { toast } from '../../store/uiStore';
import { ChevronLeft } from 'lucide-react';

const PRODUCT_CATEGORIES = ['Electronics','Furniture','Kitchen & Appliances','Books & Stationery','Clothing & Accessories','Toys & Games','Sports & Fitness','Home Decor','Groceries & Produce','Plants & Gardening','Baby & Kids','Vehicles & Accessories','Other'];
const SERVICE_CATEGORIES = ['Home Repairs','Cleaning','Tutoring & Coaching','Fitness & Wellness','Pet Care','Beauty & Grooming','Photography','Music & Arts','Transport & Moving','IT & Tech Support','Other'];
const WORKING_DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const SLOT_DURATIONS = [15,30,45,60,90,120];
const BUFFER_TIMES = [0,15,30,45,60];

function Field({ label, children, hint, error }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export default function CreateListing() {
  const navigate = useNavigate();
  const [type, setType] = useState('product');
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '', description: '', category: '', condition: 'New',
    pricingModel: 'fixed', fixedPrice: '', moq: '', stockQty: '',
    fulfillment: 'both', visibility: 'everyone',
    slabs: [{ fromQty: '1', toQty: '', pricePerUnit: '' }],
    slotDurationMins: 60, bufferMins: 15,
    workingDays: ['monday','tuesday','wednesday','thursday','friday'],
    workingHoursStart: '09:00', workingHoursEnd: '18:00',
    maxConcurrent: 1, serviceAreaKm: '',
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  function toggleDay(day) {
    set('workingDays', form.workingDays.includes(day)
      ? form.workingDays.filter(d => d !== day)
      : [...form.workingDays, day]);
  }

  function validate() {
    const e = {};
    if (!form.title.trim())       e.title = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.category)           e.category = 'Required';
    if (photos.length === 0)      e.photos = 'At least 1 photo required';
    if (form.pricingModel === 'fixed' && !form.fixedPrice) e.fixedPrice = 'Required';
    if (type === 'product' && !form.stockQty) e.stockQty = 'Required';
    if (type === 'service' && form.workingDays.length === 0) e.workingDays = 'Select at least one day';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const fd = new FormData();
      photos.forEach(p => fd.append('photos', p));
      Object.entries(payload).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
      });
      return api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      toast.success('Your listing is now live!', 'Published');
      navigate('/sell');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to publish listing'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    createMutation.mutate({
      type,
      title: form.title,
      description: form.description,
      category: form.category,
      condition: type === 'product' ? form.condition : undefined,
      pricingModel: form.pricingModel,
      fixedPrice: form.pricingModel === 'fixed' ? form.fixedPrice : undefined,
      slabs: form.pricingModel === 'slab' ? form.slabs : undefined,
      moq: form.moq || undefined,
      stockQty: type === 'product' ? form.stockQty : undefined,
      fulfillment: { method: form.fulfillment },
      visibility: form.visibility,
      serviceConfig: type === 'service' ? {
        slotDurationMins: form.slotDurationMins,
        bufferMins: form.bufferMins,
        workingDays: form.workingDays,
        workingHoursStart: form.workingHoursStart,
        workingHoursEnd: form.workingHoursEnd,
        maxConcurrent: form.maxConcurrent,
        serviceAreaKm: form.serviceAreaKm || undefined,
      } : undefined,
    });
  }

  const cats = type === 'product' ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES;

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Create listing</h1>
            <p className="text-sm text-gray-500">Fill in the details and go live</p>
          </div>
        </div>

        {/* Type toggle */}
        <div className="card p-1 flex gap-1 mb-6">
          {[['product','📦 Product'],['service','🔧 Service']].map(([t,l]) => (
            <button key={t} type="button" onClick={() => { setType(t); set('category',''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${type === t ? 'bg-gradient-to-r from-brand-500 to-orange-400 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >{l}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photos */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Photos</h2>
            <PhotoUpload photos={photos} onChange={setPhotos} />
            {errors.photos && <p className="text-xs text-red-500 mt-2">{errors.photos}</p>}
          </div>

          {/* Basic info */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Details</h2>
            <Field label="Title" error={errors.title} hint="Keep it short and descriptive (max 100 chars)">
              <input className="input" placeholder="e.g. Samsung 65-inch 4K TV" maxLength={100} value={form.title} onChange={e => set('title', e.target.value)} />
            </Field>
            <Field label="Description" error={errors.description}>
              <textarea className="input resize-none h-28" placeholder="Describe condition, features, what's included…" maxLength={2000} value={form.description} onChange={e => set('description', e.target.value)} />
            </Field>
            <Field label="Category" error={errors.category}>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            {type === 'product' && (
              <Field label="Condition">
                <div className="flex gap-2">
                  {['New','Used','Refurbished'].map(c => (
                    <button key={c} type="button" onClick={() => set('condition', c)}
                      className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${form.condition === c ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >{c}</button>
                  ))}
                </div>
              </Field>
            )}
          </div>

          {/* Pricing */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Pricing</h2>
            <Field label="Pricing model">
              <div className="flex gap-2">
                {[['fixed','Fixed price'],['slab','Slab / tiered']].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => set('pricingModel', v)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${form.pricingModel === v ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >{l}</button>
                ))}
              </div>
            </Field>
            {form.pricingModel === 'fixed'
              ? <Field label="Price (₹)" error={errors.fixedPrice}>
                  <input type="number" min="0" step="0.01" className="input" placeholder="0.00" value={form.fixedPrice} onChange={e => set('fixedPrice', e.target.value)} />
                </Field>
              : <Field label="Price tiers">
                  <SlabPricingEditor slabs={form.slabs} onChange={v => set('slabs', v)} />
                </Field>
            }
            <Field label="Minimum order quantity (MOQ)" hint="Optional. Buyers below this are prompted to start a group buy.">
              <input type="number" min="1" className="input" placeholder="No minimum" value={form.moq} onChange={e => set('moq', e.target.value)} />
            </Field>
            {type === 'product' && (
              <Field label="Stock quantity" error={errors.stockQty}>
                <input type="number" min="1" className="input" placeholder="How many do you have?" value={form.stockQty} onChange={e => set('stockQty', e.target.value)} />
              </Field>
            )}
          </div>

          {/* Service schedule */}
          {type === 'service' && (
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Availability</h2>
              <Field label="Working days" error={errors.workingDays}>
                <div className="flex flex-wrap gap-2">
                  {WORKING_DAYS.map(d => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all ${form.workingDays.includes(d) ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-500'}`}
                    >{d.slice(0,3)}</button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start time">
                  <input type="time" className="input" value={form.workingHoursStart} onChange={e => set('workingHoursStart', e.target.value)} />
                </Field>
                <Field label="End time">
                  <input type="time" className="input" value={form.workingHoursEnd} onChange={e => set('workingHoursEnd', e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Slot duration" hint="Time per appointment">
                  <select className="input" value={form.slotDurationMins} onChange={e => set('slotDurationMins', Number(e.target.value))}>
                    {SLOT_DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </Field>
                <Field label="Buffer between slots" hint="Enforced break time">
                  <select className="input" value={form.bufferMins} onChange={e => set('bufferMins', Number(e.target.value))}>
                    {BUFFER_TIMES.map(b => <option key={b} value={b}>{b === 0 ? 'No buffer' : `${b} min`}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Service area (km radius)" hint="Leave blank for community only">
                <input type="number" min="1" max="50" className="input" placeholder="e.g. 5" value={form.serviceAreaKm} onChange={e => set('serviceAreaKm', e.target.value)} />
              </Field>
            </div>
          )}

          {/* Fulfillment + visibility */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Delivery &amp; Visibility</h2>
            {type === 'product' && (
              <Field label="Fulfilment">
                <div className="flex gap-2">
                  {[['pickup','Pickup'],['delivery','Delivery'],['both','Both']].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => set('fulfillment', v)}
                      className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${form.fulfillment === v ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >{l}</button>
                  ))}
                </div>
              </Field>
            )}
            <Field label="Who can see this listing">
              <div className="flex gap-2">
                {[['everyone','Everyone'],['community','My community only']].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => set('visibility', v)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${form.visibility === v ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >{l}</button>
                ))}
              </div>
            </Field>
          </div>

          <div className="flex gap-3 pb-2">
            <Button type="button" variant="secondary" className="flex-1 justify-center" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" className="flex-1 justify-center" loading={createMutation.isPending}>Publish Listing</Button>
          </div>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
