import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socketInstance = null;

export function useSocket() {
  const { user } = useAuthStore();
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
        reconnectionAttempts: 5,
      });
    }
    ref.current = socketInstance;
    return () => {};
  }, [user]);

  return ref.current;
}

export function getSocket() {
  return socketInstance;
}
