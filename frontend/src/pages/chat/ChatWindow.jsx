import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import { ChevronLeft, Send, Image, X } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

function msgDate(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

function Bubble({ msg, isMine }) {
  return (
    <div className={`flex gap-2 items-end max-w-[80%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
      {!isMine && <Avatar src={msg.sender?.avatarUrl} name={msg.sender?.name} size="sm" className="mb-0.5 shrink-0" />}
      <div>
        {msg.imageUrls?.map((url, i) => (
          <img key={i} src={url} alt="" className={`max-w-xs rounded-2xl mb-1 ${isMine ? 'ml-auto' : ''}`} />
        ))}
        {msg.content && (
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-gradient-to-br from-brand-500 to-orange-400 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm'}`}>
            {msg.content}
          </div>
        )}
        <p className={`text-[10px] text-gray-400 mt-1 ${isMine ? 'text-right' : ''}`}>{msgDate(msg.createdAt)}</p>
      </div>
    </div>
  );
}

export default function ChatWindow() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const socket = useSocket();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const fileRef = useRef(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat', listingId],
    queryFn: () => api.get(`/chat/${listingId}`).then(r => r.data),
    refetchInterval: false,
  });

  const { data: listing } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => api.get(`/listings/${listingId}`).then(r => r.data),
  });

  // Determine the other party
  const otherUser = listing?.seller?.id === user?.id ? null : listing?.seller;

  // Socket setup
  useEffect(() => {
    if (!socket) return;
    socket.emit('join:listing', listingId);
    const onMsg = (msg) => {
      qc.setQueryData(['chat', listingId], (old = []) => [...old, msg]);
    };
    const onTyping = (data) => {
      if (data.userId !== user?.id) { setTyping(true); setTimeout(() => setTyping(false), 2000); }
    };
    socket.on('chat:message', onMsg);
    socket.on('chat:typing', onTyping);
    return () => { socket.off('chat:message', onMsg); socket.off('chat:typing', onTyping); };
  }, [socket, listingId, user?.id, qc]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function handleTextChange(e) {
    setText(e.target.value);
    if (socket) {
      socket.emit('chat:typing', { listingId });
      clearTimeout(typingTimer.current);
    }
  }

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!text.trim() && images.length === 0) return;
      const fd = new FormData();
      fd.append('content', text.trim());
      // Determine receiver: if I'm the seller, receiver is last sender who isn't me; else it's the seller
      const receiverId = listing?.seller?.id === user?.id
        ? messages.findLast(m => m.senderId !== user.id)?.senderId
        : listing?.seller?.id;
      if (!receiverId) return;
      fd.append('receiverId', receiverId);
      images.forEach(img => fd.append('images', img));
      return api.post(`/chat/${listingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => {
      if (!res) return;
      setText('');
      setImages([]);
      qc.setQueryData(['chat', listingId], (old = []) => {
        const exists = old.some(m => m.id === res.data.id);
        return exists ? old : [...old, res.data];
      });
    },
  });

  function handleSend(e) {
    e?.preventDefault();
    sendMutation.mutate();
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto pb-20 sm:pb-0">
        {/* Chat header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-16 z-10">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 shrink-0"><ChevronLeft size={22} /></button>
          {listing && (
            <Link to={`/listings/${listingId}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                {listing.photos?.[0] ? <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">{listing.type === 'service' ? '🔧' : '📦'}</div>}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{listing.title}</p>
                {otherUser && <p className="text-xs text-gray-500 truncate">{otherUser.name}</p>}
              </div>
            </Link>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}
          {!isLoading && messages.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No messages yet. Say hi!</p>
          )}
          {messages.map(msg => (
            <Bubble key={msg.id} msg={msg} isMine={msg.senderId === user?.id} />
          ))}
          {typing && (
            <div className="flex items-center gap-2">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
                <div className="flex gap-1 items-center h-4">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex gap-2 px-4 py-2 bg-white border-t border-gray-100">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={URL.createObjectURL(img)} alt="" className="w-16 h-16 rounded-xl object-cover" />
                <button onClick={() => setImages(imgs => imgs.filter((_,idx) => idx !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="text-gray-400 hover:text-brand-500 transition-colors p-1 shrink-0">
            <Image size={20} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => setImages(imgs => [...imgs, ...Array.from(e.target.files)].slice(0, 5))} />
          <textarea
            rows={1}
            className="flex-1 input resize-none overflow-hidden py-2.5 text-sm"
            placeholder="Message…"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKey}
            style={{ minHeight: 40, maxHeight: 120 }}
          />
          <button type="submit" disabled={!text.trim() && images.length === 0} className="btn-primary p-2.5 rounded-xl shrink-0 disabled:opacity-40">
            <Send size={16} />
          </button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}
