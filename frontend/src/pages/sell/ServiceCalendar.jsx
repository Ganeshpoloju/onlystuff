import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from '../../store/uiStore';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

const STATUS_VARIANT = { pending: 'warning', confirmed: 'success', declined: 'danger', cancelled: 'default', completed: 'default', closed: 'default', fully_closed: 'default' };

export default function ServiceCalendar() {
  const qc = useQueryClient();
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', 'seller'],
    queryFn: () => api.get('/bookings?role=seller').then(r => r.data),
  });

  const confirm = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/confirm`),
    onSuccess: () => { qc.invalidateQueries(['bookings']); toast.success('Booking confirmed'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const decline = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/decline`, { reason: 'Unavailable' }),
    onSuccess: () => { qc.invalidateQueries(['bookings']); toast.info('Booking declined'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const dayBookings = bookings.filter(b => isSameDay(new Date(b.slotDate), selectedDay));
  const allPending = bookings.filter(b => b.status === 'pending');

  function hasBooking(day) {
    return bookings.some(b => isSameDay(new Date(b.slotDate), day));
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-6 bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Service Calendar</h1>

        {/* Pending confirmations banner */}
        {allPending.length > 0 && (
          <div className="card p-3 mb-4 bg-amber-50 border border-amber-200 flex items-center gap-3">
            <span className="text-amber-500 text-xl">⏰</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">{allPending.length} booking{allPending.length > 1 ? 's' : ''} awaiting confirmation</p>
              <p className="text-xs text-amber-600">Respond within 2 hours to avoid auto-decline</p>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMonth(m => subMonths(m, 1))} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600"><ChevronLeft size={18} /></button>
            <h2 className="font-semibold text-gray-900">{format(month, 'MMMM yyyy')}</h2>
            <button onClick={() => setMonth(m => addMonths(m, 1))} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Leading empty cells */}
            {Array.from({ length: days[0].getDay() }).map((_, i) => <div key={`e${i}`} />)}
            {days.map(day => {
              const selected = isSameDay(day, selectedDay);
              const today = isToday(day);
              const hasBook = hasBooking(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`relative py-2 rounded-xl text-sm font-medium transition-all ${selected ? 'bg-gradient-to-br from-brand-500 to-orange-400 text-white' : today ? 'border border-brand-300 text-brand-500' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {format(day, 'd')}
                  {hasBook && !selected && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-400 rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day bookings */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{format(selectedDay, 'EEEE, MMMM d')}</h2>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : dayBookings.length === 0 ? (
            <div className="text-center py-8 card">
              <Calendar size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No bookings on this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayBookings
                .sort((a, b) => a.slotStart.localeCompare(b.slotStart))
                .map(b => (
                  <div key={b.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{b.listing?.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{b.slotStart} – {b.slotEnd}</p>
                        {b.recurrence !== 'none' && <p className="text-xs text-brand-500 mt-0.5 capitalize">Recurring · {b.recurrence}</p>}
                        {b.notes && <p className="text-xs text-gray-400 mt-1 italic">"{b.notes}"</p>}
                      </div>
                      <Badge variant={STATUS_VARIANT[b.status] ?? 'default'}>{b.status}</Badge>
                    </div>
                    {b.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button className="flex-1 justify-center text-xs py-2" loading={confirm.isPending} onClick={() => confirm.mutate(b.id)}>Confirm</Button>
                        <Button variant="danger" className="flex-1 justify-center text-xs py-2" loading={decline.isPending} onClick={() => decline.mutate(b.id)}>Decline</Button>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
