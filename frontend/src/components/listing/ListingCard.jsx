import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import Badge from '../ui/Badge';

export default function ListingCard({ listing }) {
  const price = listing.pricingModel === 'fixed'
    ? `₹${listing.fixedPrice}`
    : `From ₹${listing.priceSlabs?.[0]?.pricePerUnit ?? '—'}`;

  return (
    <Link to={`/listings/${listing.id}`} className="card overflow-hidden hover:shadow-md transition-shadow group">
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {listing.photos?.[0]
          ? <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
        }
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{listing.title}</p>
        <p className="text-brand-500 font-bold text-sm mt-0.5">{price}</p>
        {listing.moq && <p className="text-xs text-gray-400 mt-0.5">MOQ: {listing.moq}</p>}
        <div className="flex items-center justify-between mt-2">
          {listing.community && (
            <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
              <MapPin size={10} />{listing.community.name}
            </span>
          )}
          {listing._count?.groupBuys > 0 && (
            <Badge variant="brand" className="ml-auto shrink-0">
              <Users size={10} className="mr-1" /> Group
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
