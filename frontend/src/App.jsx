import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import api from './lib/api';
import ToastContainer from './components/ui/Toast';
import { initSocket } from './hooks/useSocket';

// Auth pages
import Login from './pages/auth/Login';
import OAuthCallback from './pages/auth/OAuthCallback';
import AadhaarUpload from './pages/auth/AadhaarUpload';
import PendingVerification from './pages/auth/PendingVerification';

// Buy pages
import Home from './pages/buy/Home';
import Search from './pages/buy/Search';
import ListingDetail from './pages/buy/ListingDetail';
import GroupBuys from './pages/buy/GroupBuys';
import Orders from './pages/buy/Orders';

// Sell pages
import MyListings from './pages/sell/MyListings';
import CreateListing from './pages/sell/CreateListing';
import EditListing from './pages/sell/EditListing';
import OrdersReceived from './pages/sell/OrdersReceived';
import ServiceCalendar from './pages/sell/ServiceCalendar';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AadhaarQueue from './pages/admin/AadhaarQueue';
import CommunityRequests from './pages/admin/CommunityRequests';
import Reports from './pages/admin/Reports';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';

import BottomNav from './components/layout/BottomNav';
import Spinner from './components/ui/Spinner';
import ChatWindow from './pages/chat/ChatWindow';
import ChatList from './pages/chat/ChatList';

function RequireLogin({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.aadhaarStatus !== 'approved' && !requireAdmin) {
    if (!user.aadhaarFrontUrl) return <Navigate to="/onboarding/aadhaar" replace />;
    return <Navigate to="/onboarding/pending" replace />;
  }
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    api.get('/auth/me')
      .then(r => {
        setUser(r.data);
        // Initialise socket once, after we know user is authenticated
        initSocket();
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Onboarding — requires login but not verified */}
        <Route path="/onboarding/aadhaar" element={<RequireLogin><AadhaarUpload /></RequireLogin>} />
        <Route path="/onboarding/pending" element={<RequireLogin><PendingVerification /></RequireLogin>} />

        {/* Buy */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/listings/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
        <Route path="/buy/group-buys" element={<ProtectedRoute><GroupBuys /></ProtectedRoute>} />
        <Route path="/buy/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
        <Route path="/chat/:listingId" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />

        {/* Sell */}
        <Route path="/sell" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
        <Route path="/sell/new" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
        <Route path="/sell/listings/:id/edit" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
        <Route path="/sell/orders" element={<ProtectedRoute><OrdersReceived /></ProtectedRoute>} />
        <Route path="/sell/calendar" element={<ProtectedRoute><ServiceCalendar /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/aadhaar" element={<ProtectedRoute requireAdmin><AadhaarQueue /></ProtectedRoute>} />
        <Route path="/admin/communities" element={<ProtectedRoute requireAdmin><CommunityRequests /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><Reports /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><Analytics /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
