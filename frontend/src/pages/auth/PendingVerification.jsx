import logo from '../../assets/logo.svg';
import { Clock, Mail } from 'lucide-react';
import api from '../../lib/api';

export default function PendingVerification() {
  const handleLogout = async () => {
    await api.post('/auth/logout');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <img src={logo} alt="onlyStuff" className="h-10 mx-auto mb-8" />
        <div className="card p-8">
          <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={28} className="text-yellow-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Verification in progress</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your Aadhaar documents are under review. We'll verify your identity within <strong>24 hours</strong> and send you an email once done.
          </p>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-xl px-4 py-3 text-sm">
            <Mail size={16} />
            <span>Check your email for updates</span>
          </div>
        </div>
        <button onClick={handleLogout} className="mt-6 text-sm text-gray-400 hover:text-gray-600">
          Sign out
        </button>
      </div>
    </div>
  );
}
