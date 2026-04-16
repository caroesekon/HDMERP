import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiMail, HiLockClosed, HiSparkles, HiArrowLeft } from 'react-icons/hi';
import { useHubAuth } from '../../context/HubAuthContext';
import systemService from '../../services/systemService';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  
  const { login } = useHubAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await systemService.getSettings();
      if (res.data) {
        setSettings(res.data);
      }
    } catch (error) {
      console.log('Using default settings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const appName = settings?.general?.appName || 'ERP Hub';
  const logo = settings?.general?.logo || null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 p-4">
      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-primary-600 transition"
      >
        <HiArrowLeft className="h-5 w-5 mr-1" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center">
              {logo ? (
                <img src={logo} alt={appName} className="h-10 w-auto mb-3" />
              ) : (
                <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-3 rounded-xl shadow-md mb-3">
                  <HiSparkles className="h-6 w-6 text-white" />
                </div>
              )}
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-500 mt-1">Sign in to {appName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Email Address"
                required
              />
            </div>
            
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Password"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold py-3 rounded-lg hover:from-primary-700 hover:to-primary-600 transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}