import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import api from '../lib/api';
import { getSocket } from './useSocket';
import { toast } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

const NOTIFICATION_MESSAGES = {
  order_placed:      { title: 'New order!',         message: 'Someone placed an order on your listing.' },
  order_confirmed:   { title: 'Order confirmed',    message: 'The seller confirmed your order.' },
  order_closed:      { title: 'Order closed',       message: 'An order has been marked as closed.' },
  booking_request:   { title: 'New booking',        message: 'Someone requested a booking.' },
  booking_confirmed: { title: 'Booking confirmed',  message: 'Your booking has been confirmed.' },
  booking_declined:  { title: 'Booking declined',   message: 'Your booking request was declined.' },
  new_message:       { title: 'New message',        message: 'You have a new message.' },
  groupbuy_locked:   { title: 'Group Buy locked!',  message: 'The group buy hit its target.' },
  groupbuy_expiring: { title: 'Group Buy expiring', message: 'Your group buy expires in 6 hours.' },
};

export function useNotifications() {
  const qc = useQueryClient();
  const registered = useRef(false);
  const { user } = useAuthStore();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/users/me/notifications').then(r => r.data),
    staleTime: 30_000,
    enabled: !!user && user.aadhaarStatus === 'approved',
    retry: false,
  });

  // Register socket listener once — stable singleton, no dependency churn
  useEffect(() => {
    if (registered.current) return;
    const socket = getSocket();
    if (!socket) return;
    registered.current = true;

    const handler = (notification) => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      const m = NOTIFICATION_MESSAGES[notification.type] ?? { title: 'New notification', message: '' };
      if (m.message) toast.info(m.message, m.title);
    };

    socket.on('new_notification', handler);
    return () => {
      socket.off('new_notification', handler);
      registered.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/users/me/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return { notifications, unreadCount, markRead: markRead.mutate };
}
