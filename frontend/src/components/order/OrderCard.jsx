import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';
import { toast } from '../../store/uiStore';
import { useState } from 'react';
import { MessageCircle, Star, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_VARIANT = {
  placed:      'warning',
  confirmed:   'info',
  in_progress: 'info',
  closed:      'warning',
  disputed:    'danger',
  fully_closed:'success',
  cancelled:   'default',
};

const STATUS_LABEL = {
  placed:      'Awaiting confirmation',
  confirmed:   'Confirmed',
  in_progress: 'In progress',
  closed:      'Closed — dispute window open',
  disputed:    'Disputed',
  fully_closed:'Completed',
  cancelled:   'Cancelled',
};

export default function OrderCard({ order, role }) {
  const qc = useQueryClient();
  const [showDispute, setShowDispute] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const confirmMutation = useMutation({
    mutationFn: () => api.patch(`/orders/${order.id}/confirm`),
    onSuccess: () => { qc.invalidateQueries(['orders']); toast.success('Order confirmed'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const closeMutation = useMutation({
    mutationFn: () => api.patch(`/orders/${order.id}/close`),
    onSuccess: () => { qc.invalidateQueries(['orders']); toast.info('Order closed. Dispute window: 48h'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const disputeMutation = useMutation({
    mutationFn: () => api.post(`/orders/${order.id}/dispute`, { reason: disputeReason }),
    onSuccess: () => { qc.invalidateQueries(['orders']); setShowDispute(false); toast.warning('Dispute raised. Admin will review.'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const reviewMutation = useMutation({
    mutationFn: () => api.post(`/orders/${order.id}/reviews`, { rating, comment: reviewText }),
    onSuccess: () => { qc.invalidateQueries(['orders']); setShowReview(false); toast.success('Review posted!'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const other = role === 'buyer' ? order.seller : order.buyer;

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          {order.listing?.photos?.[0]
            ? <img src={order.listing.photos[0]} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/listings/${order.listingId}`} className="font-semibold text-sm text-gray-900 hover:text-brand-500 line-clamp-1">{order.listing?.title}</Link>
              <p className="text-xs text-gray-500 mt-0.5">
                Qty: {order.quantity} · ₹{order.totalPrice?.toLocaleString('en-IN')}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[order.status]}>{STATUS_LABEL[order.status] ?? order.status}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Avatar src={other?.avatarUrl} name={other?.name} size="sm" />
            <span className="text-xs text-gray-500">{other?.name}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
        <Link to={`/chat/${order.listingId}`} className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <MessageCircle size={12} /> Chat
        </Link>

        {role === 'seller' && order.status === 'placed' && (
          <Button className="text-xs px-3 py-1.5 rounded-lg" loading={confirmMutation.isPending} onClick={() => confirmMutation.mutate()}>
            Confirm Order
          </Button>
        )}

        {['confirmed', 'in_progress'].includes(order.status) && (
          <Button variant="secondary" className="text-xs px-3 py-1.5 rounded-lg" loading={closeMutation.isPending} onClick={() => closeMutation.mutate()}>
            Mark as Closed
          </Button>
        )}

        {order.status === 'closed' && (
          <Button variant="danger" className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1" onClick={() => setShowDispute(true)}>
            <AlertTriangle size={12} /> Raise Dispute
          </Button>
        )}

        {order.status === 'fully_closed' && (
          <Button variant="secondary" className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1" onClick={() => setShowReview(true)}>
            <Star size={12} /> Leave Review
          </Button>
        )}
      </div>

      {/* Dispute modal */}
      <Modal open={showDispute} onClose={() => setShowDispute(false)} title="Raise a Dispute" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Describe the issue. Admin will review and mediate.</p>
          <textarea className="input resize-none h-24 text-sm" placeholder="What went wrong?" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} />
          <Button className="w-full justify-center" loading={disputeMutation.isPending} onClick={() => disputeMutation.mutate()}>
            Submit Dispute
          </Button>
        </div>
      </Modal>

      {/* Review modal */}
      <Modal open={showReview} onClose={() => setShowReview(false)} title="Leave a Review" size="sm">
        <div className="space-y-4">
          <div className="flex gap-1 justify-center">
            {[1,2,3,4,5].map(s => (
              <button key={s} type="button" onClick={() => setRating(s)} className={`text-3xl transition-transform hover:scale-110 ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
            ))}
          </div>
          <textarea className="input resize-none h-20 text-sm" placeholder="Share your experience (optional)" value={reviewText} onChange={e => setReviewText(e.target.value)} />
          <Button className="w-full justify-center" loading={reviewMutation.isPending} onClick={() => reviewMutation.mutate()}>
            Post Review
          </Button>
        </div>
      </Modal>
    </div>
  );
}
