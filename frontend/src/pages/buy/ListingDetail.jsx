import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { toast } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeft, MapPin, Star, Users, MessageCircle, ShoppingCart, Calendar, Package, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

function PriceDisplay({ listing }) {
  if (listing.pricingModel === 'fixed') {
    return <span className="text-2xl font-bold text-brand-500">₹{listing.fixedPrice?.toLocaleString('en-IN')}</span>;
  }
  const slabs = listing.priceSlabs ?? [];
  const from = slabs[0]?.pricePerUnit;
  return (
    <div>
      <span className="text-2xl font-bold text-brand-500">From ₹{from?.toLocaleString('en-IN')}</span>
      {listing.moq && <span className="text-sm text-gray-500 ml-2">· MOQ: {listing.moq}</span>}
      <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden text-sm">
        <table className="w-full">
          <thead><tr className="bg-gray-50"><th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Qty</th><th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">₹/unit</th></tr></thead>
          <tbody>
            {slabs.map((s, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-3 py-2 text-gray-700">{s.fromQty}{s.toQty ? `–${s.toQty}` : '+'}</td>
                <td className="px-3 py-2 text-right font-semibold text-brand-500">₹{s.pricePerUnit?.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupBuyPanel({ listing, groupBuys }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showInitiate, setShowInitiate] = useState(false);
  const [targetQty, setTargetQty] = useState(listing.moq || 10);

  const initiate = useMutation({
    mutationFn: () => api.post('/group-buys', {
      listingId: listing.id,
      targetQty,
      targetPricePerUnit: listing.pricingModel === 'fixed' ? listing.fixedPrice : listing.priceSlabs?.[0]?.pricePerUnit,
    }),
    onSuccess: () => { qc.invalidateQueries(['groupBuys', listing.id]); setShowInitiate(false); toast.success('Group buy started! Share the link with neighbours.'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to start group buy'),
  });

  const join = useMutation({
    mutationFn: ({ gbId, quantity }) => api.post(`/group-buys/${gbId}/join`, { quantity }),
    onSuccess: () => { qc.invalidateQueries(['groupBuys', listing.id]); toast.success('Joined the group buy!'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to join'),
  });

  const openBuys = groupBuys?.filter(gb => gb.status === 'open') ?? [];

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users size={16} className="text-brand-500" />
        <span className="text-sm font-semibold text-gray-900">Group Buy</span>
        {openBuys.length > 0 && <Badge variant="brand">{openBuys.length} active</Badge>}
      </div>

      {openBuys.length === 0 ? (
        <div>
          <p className="text-sm text-gray-500 mb-3">No active group buys. Start one to pool orders with neighbours and unlock bulk pricing.</p>
          <Button variant="secondary" className="w-full justify-center text-sm" onClick={() => setShowInitiate(true)}>
            Start a Group Buy
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {openBuys.map(gb => {
            const pct = Math.min((gb.committedQty / gb.targetQty) * 100, 100);
            const isMember = gb.members?.some(m => m.userId === user?.id);
            return (
              <div key={gb.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{gb.committedQty} / {gb.targetQty} units</span>
                  <span className="text-xs text-gray-400">Expires {format(new Date(gb.expiresAt), 'MMM d, h:mm a')}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-orange-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                {!isMember && (
                  <Button className="w-full justify-center text-sm" onClick={() => join.mutate({ gbId: gb.id, quantity: 1 })} loading={join.isPending}>
                    Join this Group Buy
                  </Button>
                )}
                {isMember && <p className="text-center text-sm text-brand-500 font-medium">✓ You're in</p>}
              </div>
            );
          })}
          <button className="text-sm text-brand-500 font-medium" onClick={() => setShowInitiate(true)}>+ Start another group buy</button>
        </div>
      )}

      <Modal open={showInitiate} onClose={() => setShowInitiate(false)} title="Start a Group Buy" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Set a target quantity to pool orders with neighbours and unlock bulk pricing.</p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target quantity</label>
            <input type="number" min={listing.moq || 1} className="input" value={targetQty} onChange={e => setTargetQty(Number(e.target.value))} />
            {listing.moq && <p className="text-xs text-gray-400 mt-1">Minimum: {listing.moq} units</p>}
          </div>
          <Button className="w-full justify-center" onClick={() => initiate.mutate()} loading={initiate.isPending}>
            Start Group Buy (48h window)
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function OrderForm({ listing }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [qty, setQty] = useState(listing.moq || 1);
  const [fulfillment, setFulfillment] = useState('pickup');
  const [showDelivery, setShowDelivery] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState([]);

  const placeOrder = useMutation({
    mutationFn: () => api.post('/orders', { listingId: listing.id, quantity: qty, fulfillmentMethod: fulfillment }),
    onSuccess: () => { toast.success('Order placed! Check your orders tab.', 'Order placed'); navigate('/buy/orders'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to place order'),
  });

  const moqMet = !listing.moq || qty >= listing.moq;

  return (
    <div className="card p-4 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity</label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-brand-300">−</button>
          <input type="number" min="1" className="input text-center w-20" value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} />
          <button type="button" onClick={() => setQty(q => q + 1)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-brand-300">+</button>
        </div>
        {!moqMet && (
          <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
            <Users size={12} /> MOQ is {listing.moq}. Join or start a group buy below.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fulfilment</label>
        <div className="flex gap-2">
          {[['pickup','Pickup'],['delivery','Delivery'],['arrange','Arrange via chat']].map(([v,l]) => (
            <button key={v} type="button" onClick={() => setFulfillment(v)}
              className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${fulfillment === v ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >{l}</button>
          ))}
        </div>
      </div>

      <Button
        className="w-full justify-center gap-2"
        disabled={!moqMet}
        loading={placeOrder.isPending}
        onClick={() => placeOrder.mutate()}
      >
        <ShoppingCart size={16} /> Place Order
      </Button>
      <p className="text-xs text-center text-gray-400">P2P transaction — coordinate payment directly with seller via chat</p>
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [imgIdx, setImgIdx] = useState(0);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.get(`/listings/${id}`).then(r => r.data),
  });

  const { data: groupBuys } = useQuery({
    queryKey: ['groupBuys', id],
    queryFn: () => api.get(`/group-buys?listingId=${id}`).then(r => r.data),
    enabled: !!listing,
  });

  if (isLoading) return (
    <div className="min-h-screen"><Navbar /><div className="flex justify-center py-20"><Spinner size="lg" /></div><BottomNav /></div>
  );
  if (!listing) return (
    <div className="min-h-screen"><Navbar /><div className="text-center py-20 text-gray-400">Listing not found</div><BottomNav /></div>
  );

  const isSeller = user?.id === listing.sellerId;
  const photos = listing.photos ?? [];

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-4">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm">
          <ChevronLeft size={18} /> Back
        </button>

        <div className="grid sm:grid-cols-5 gap-6">
          {/* Left: photos + details */}
          <div className="sm:col-span-3 space-y-4">
            {/* Photo gallery */}
            <div className="card overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                {photos.length > 0
                  ? <img src={photos[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">{listing.type === 'service' ? '🔧' : '📦'}</div>
                }
                {photos.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm"><ChevronLeft size={16} /></button>
                    <button onClick={() => setImgIdx(i => (i + 1) % photos.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm"><ChevronRight size={16} /></button>
                  </>
                )}
              </div>
              {photos.length > 1 && (
                <div className="flex gap-1.5 p-3 overflow-x-auto">
                  {photos.map((p, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === imgIdx ? 'border-brand-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant={listing.type === 'service' ? 'brand' : 'default'}>{listing.type}</Badge>
                    {listing.condition && <Badge variant="default">{listing.condition}</Badge>}
                    {listing.status === 'active' && <Badge variant="success">Available</Badge>}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
                </div>
              </div>
              <PriceDisplay listing={listing} />
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>
              {listing.community && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={14} className="text-brand-500" />
                  {listing.community.name}
                </div>
              )}
            </div>

            {/* Seller info */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Seller</h3>
              <div className="flex items-center gap-3">
                <Avatar src={listing.seller?.avatarUrl} name={listing.seller?.name} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{listing.seller?.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" /> Aadhaar Verified
                  </div>
                </div>
                {!isSeller && (
                  <Link to={`/chat/${id}`} className="flex items-center gap-1.5 text-sm text-brand-500 font-medium border border-brand-200 rounded-xl px-3 py-2 hover:bg-brand-50 transition-colors">
                    <MessageCircle size={15} /> Chat
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right: order actions */}
          <div className="sm:col-span-2 space-y-4">
            {isSeller ? (
              <div className="card p-4">
                <p className="text-sm text-gray-500 text-center py-2">This is your listing.</p>
                <Link to={`/sell/listings/${id}/edit`}>
                  <Button variant="secondary" className="w-full justify-center mt-2">Edit Listing</Button>
                </Link>
              </div>
            ) : (
              <>
                <OrderForm listing={listing} />
                {(listing.moq || listing.pricingModel === 'slab') && (
                  <GroupBuyPanel listing={listing} groupBuys={groupBuys} />
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
