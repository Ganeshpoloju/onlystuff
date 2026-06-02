import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export function useAuth() {
  const { user, setUser, logout } = useAuthStore();

  async function signOut() {
    await api.post('/auth/logout').catch(() => {});
    logout();
    window.location.href = '/login';
  }

  return { user, signOut, isAdmin: user?.role === 'admin' };
}
