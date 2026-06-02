import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socketInstance = null;

// Initialise once — called from App on mount, not per-component
export function initSocket() {
  if (socketInstance) return socketInstance;
  socketInstance = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    reconnectionAttempts: 5,
  });
  return socketInstance;
}

// Returns the stable singleton — never null after initSocket() is called
export function getSocket() {
  return socketInstance;
}

// Hook for components — returns the stable singleton directly
export function useSocket() {
  return socketInstance;
}
