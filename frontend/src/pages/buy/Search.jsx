import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import ListingCard from '../../components/listing/ListingCard';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { Search as SearchIcon, SlidersHorizontal, Map, List, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet marker icon (webpack asset issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORIES = ['Electronics','Furniture','Kitchen & Appliances','Books & Stationery','Clothing & Accessories','Toys & Games','Sports & Fitness','Home Decor','Groceries & Produce','Plants & Gardening','Baby & Kids','Vehicles & Accessories','Other','Home Repairs','Cleaning','Tutoring & Coaching','Fitness & Wellness','Pet Care','Beauty & Grooming','Photography','Music & Arts','Transport & Moving','IT & Tech Support'];

// Hyderabad center
const HYD_CENTER = [17.385, 78.487];

export default function Search() {
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '', radiusKm: 5 });

  const { data, isLoading } = useQuery({
    queryKey: ['search', submitted, filters],
    queryFn: () => {
      const params = new URLSearchParams({ limit: 40 });
      if (submitted) params.set('q', submitted);
      if (filters.type) params.set('type', filters.type);
      if (filters.category) params.set('category', filters.category);
      params.set('radiusKm', filters.radiusKm);
      return api.get(`/listings?${params}`).then(r => r.data);
    },
    staleTime: 30_000,
  });

  const listings = data?.listings ?? [];

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  function handleSearch(e) {
    e.preventDefault();
    setSubmitted(q);
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-10 pr-4 w-full"
              placeholder="Search listings near you…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            {q && (
              <button type="button" onClick={() => { setQ(''); setSubmitted(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary px-5 rounded-xl text-sm font-semibold">Search</button>
          <button type="button" onClick={() => setShowFilters(v => !v)} className={`btn-secondary px-3 rounded-xl ${showFilters ? 'border-brand-400 text-brand-500' : ''}`}>
            <SlidersHorizontal size={18} />
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="card p-4 mb-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type</label>
                <select className="input text-sm" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
                  <option value="">All</option>
                  <option value="product">Products</option>
                  <option value="service">Services</option>
                </select>
              </div>
              {/* Category */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category</label>
                <select className="input text-sm" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                  <option value="">All categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Radius */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Radius: {filters.radiusKm} km</label>
                <input type="range" min="1" max="50" value={filters.radiusKm} onChange={e => setFilter('radiusKm', Number(e.target.value))} className="w-full accent-brand-500" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.type && <button onClick={() => setFilter('type','')} className="flex items-center gap-1 text-xs bg-brand-50 text-brand-600 border border-brand-200 rounded-full px-2.5 py-1"><X size={10} /> {filters.type}</button>}
              {filters.category && <button onClick={() => setFilter('category','')} className="flex items-center gap-1 text-xs bg-brand-50 text-brand-600 border border-brand-200 rounded-full px-2.5 py-1"><X size={10} /> {filters.category}</button>}
            </div>
          </div>
        )}

        {/* View toggle + count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Searching…' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
          </p>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-brand-50 text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}><List size={16} /></button>
            <button onClick={() => setView('map')} className={`p-1.5 rounded-lg transition-colors ${view === 'map' ? 'bg-brand-50 text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}><Map size={16} /></button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-semibold text-gray-700">No listings found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search or expand your radius</p>
          </div>
        ) : view === 'list' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className="card overflow-hidden" style={{ height: 480 }}>
            <MapContainer center={HYD_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {listings.map(l => {
                const lat = l.community?.lat;
                const lng = l.community?.lng;
                if (!lat || !lng) return null;
                return (
                  <Marker key={l.id} position={[lat, lng]}>
                    <Popup>
                      <Link to={`/listings/${l.id}`} className="font-semibold text-sm text-brand-500 hover:underline">{l.title}</Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {l.pricingModel === 'fixed' ? `₹${l.fixedPrice?.toLocaleString('en-IN')}` : `From ₹${l.priceSlabs?.[0]?.pricePerUnit?.toLocaleString('en-IN')}`}
                      </p>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
