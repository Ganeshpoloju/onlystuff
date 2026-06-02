import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const ICONS = {
  success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
  error:   <AlertCircle  size={18} className="text-red-500 shrink-0" />,
  warning: <AlertTriangle size={18} className="text-yellow-500 shrink-0" />,
  info:    <Info          size={18} className="text-blue-500 shrink-0" />,
};

const BARS = {
  success: 'bg-green-500',
  error:   'bg-red-500',
  warning: 'bg-yellow-500',
  info:    'bg-blue-500',
};

function ToastItem({ toast }) {
  const { removeToast } = useUIStore();

  useEffect(() => {
    const t = setTimeout(() => removeToast(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(t);
  }, [toast.id]);

  return (
    <div className="relative flex items-start gap-3 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 pr-9 min-w-[280px] max-w-sm overflow-hidden animate-toast-in">
      {ICONS[toast.type ?? 'info']}
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-sm font-semibold text-gray-900 leading-tight">{toast.title}</p>}
        {toast.message && <p className="text-sm text-gray-600 mt-0.5 leading-snug">{toast.message}</p>}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={15} />
      </button>
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${BARS[toast.type ?? 'info']} animate-toast-bar`}
        style={{ animationDuration: `${toast.duration ?? 4000}ms` }}
      />
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useUIStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
