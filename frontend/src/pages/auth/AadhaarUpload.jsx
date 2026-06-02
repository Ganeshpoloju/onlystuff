import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import logo from '../../assets/logo.svg';
import { Upload, ShieldCheck } from 'lucide-react';

export default function AadhaarUpload() {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!front || !back) return setError('Both front and back images are required');
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('front', front);
      fd.append('back', back);
      await api.post('/users/me/aadhaar', fd);
      navigate('/onboarding/pending');
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="onlyStuff" className="h-10 mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ShieldCheck size={16} /> Identity Verification
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify your identity</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">Upload a clear photo of your Aadhaar card. Our team will verify it within 24 hours.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {[{ label: 'Aadhaar Front', setter: setFront, value: front }, { label: 'Aadhaar Back', setter: setBack, value: back }].map(({ label, setter, value }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${value ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={e => setter(e.target.files[0])} />
                {value
                  ? <><img src={URL.createObjectURL(value)} alt="" className="h-24 object-contain rounded-lg mb-2" /><span className="text-xs text-brand-600 font-medium">{value.name}</span></>
                  : <><Upload size={24} className="text-gray-400 mb-2" /><span className="text-sm text-gray-500">Click to upload</span><span className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</span></>
                }
              </label>
            </div>
          ))}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={loading} className="w-full justify-center">
            Submit for Verification
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed px-4">
          Your Aadhaar images are encrypted and only accessible to our verification team. We do not store your Aadhaar number.
        </p>
      </div>
    </div>
  );
}
