import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let redirecting = false;

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Only redirect to login on 401 for non-auth endpoints, and only once
    if (
      err.response?.status === 401 &&
      !redirecting &&
      !err.config?.url?.includes('/auth/')
    ) {
      redirecting = true;
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
