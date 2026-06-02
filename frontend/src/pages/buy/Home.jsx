import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import ListingCard from '../../components/listing/ListingCard';
import Spinner from '../../components/ui/Spinner';
import { Search, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'feed'],
    queryFn: () => api.get('/listings').then(r => r.data),
  });

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Hey {user?.name?.split(' ')[0]} 👋</h1>
          {user?.community && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin size={13} /> {user.community.name}
            </p>
          )}
        </div>

        {/* Search bar */}
        <button onClick={() => navigate('/search')} className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-400 text-sm mb-6 shadow-sm hover:border-brand-300 transition-colors">
          <Search size={16} />
          Search for anything nearby...
        </button>

        {/* Feed */}
        {isLoading
          ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          : data?.listings?.length === 0
          ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🏘️</p>
              <p className="font-semibold text-gray-700">Be the first to list something in your community</p>
              <p className="text-sm text-gray-400 mt-1">No listings yet nearby.</p>
              <Link to="/sell/new" className="btn-primary inline-block mt-4">Create a Listing</Link>
            </div>
          )
          : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )
        }
      </main>
      <BottomNav />
    </div>
  );
}
