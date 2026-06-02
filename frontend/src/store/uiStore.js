import { create } from 'zustand';

export const useUIStore = create((set) => ({
  toasts: [],
  addToast: (toast) => set((s) => ({
    toasts: [...s.toasts, { id: Date.now() + Math.random(), type: 'info', ...toast }],
  })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helper — import toast() anywhere without hooks
export const toast = {
  success: (message, title) => useUIStore.getState().addToast({ type: 'success', message, title }),
  error:   (message, title) => useUIStore.getState().addToast({ type: 'error',   message, title }),
  warning: (message, title) => useUIStore.getState().addToast({ type: 'warning', message, title }),
  info:    (message, title) => useUIStore.getState().addToast({ type: 'info',    message, title }),
};
