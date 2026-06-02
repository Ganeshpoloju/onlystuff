import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import { Link } from 'react-router-dom';
export default function MyListings() {
  return <div className="min-h-screen pb-20 sm:pb-0"><Navbar /><main className="max-w-3xl mx-auto px-4 py-6"><div className="flex items-center justify-between mb-6"><h1 className="text-xl font-bold">My Listings</h1><Link to="/sell/new" className="btn-primary text-sm">+ New Listing</Link></div></main><BottomNav /></div>;
}
