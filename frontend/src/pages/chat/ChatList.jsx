import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import { useAuthStore } from '../../store/authStore';
import { format, isToday } from 'date-fns';
import { MessageCircle } from 'lucide-react';

export default function ChatList() {
  const { user } = useAuthStore();
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/chat').then(r => r.data),
  });

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-1">Start a chat from any listing</p>
          </div>
        ) : (
          <div className="card divide-y divide-gray-50">
            {conversations.map(conv => {
              const other = conv.senderId === user?.id ? conv.receiver : conv.sender;
              const time = isToday(new Date(conv.createdAt)) ? format(new Date(conv.createdAt), 'h:mm a') : format(new Date(conv.createdAt), 'MMM d');
              return (
                <Link key={`${conv.listingId}-${conv.id}`} to={`/chat/${conv.listingId}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                  <Avatar src={other?.avatarUrl} name={other?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="font-semibold text-sm text-gray-900 truncate">{other?.name}</p>
                      <span className="text-xs text-gray-400 shrink-0">{time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{conv.listing?.title}</p>
                    {conv.content && <p className="text-xs text-gray-400 truncate mt-0.5">{conv.content}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
