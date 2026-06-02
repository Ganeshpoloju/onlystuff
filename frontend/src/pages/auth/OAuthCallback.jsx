import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import Spinner from '../../components/ui/Spinner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    api.get('/auth/me')
      .then(r => {
        setUser(r.data);
        if (r.data.aadhaarStatus === 'approved') navigate('/');
        else if (!r.data.aadhaarFrontUrl) navigate('/onboarding/aadhaar');
        else navigate('/onboarding/pending');
      })
      .catch(() => navigate('/login'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
