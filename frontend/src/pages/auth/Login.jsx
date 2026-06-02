import logo from '../../assets/logo.svg';

export default function Login() {
  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="onlyStuff" className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Your neighbourhood marketplace in Hyderabad</p>
        </div>

        <div className="card p-6">
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.96-.89 6.62-2.43l-3.16-2.45c-.89.6-2.01.96-3.46.96-2.65 0-4.9-1.79-5.7-4.2H1.04v2.52C2.7 17.73 6.09 20 10 20z" fill="#34A853"/>
              <path d="M4.3 11.88A6.01 6.01 0 0 1 4 10c0-.65.1-1.28.3-1.88V5.6H1.04A10.02 10.02 0 0 0 0 10c0 1.61.39 3.14 1.04 4.4l3.26-2.52z" fill="#FBBC05"/>
              <path d="M10 3.96c1.84 0 3.06.79 3.76 1.46l2.82-2.76C14.96.99 12.7 0 10 0 6.09 0 2.7 2.27 1.04 5.6L4.3 8.12C5.1 5.71 7.35 3.96 10 3.96z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
            By continuing, you agree to our Terms of Service. You'll need to complete Aadhaar verification to access the platform.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          New to onlyStuff?{' '}
          <a href="https://onlystuff.in" className="text-brand-500 font-medium hover:underline">Learn more</a>
        </p>
      </div>
    </div>
  );
}
