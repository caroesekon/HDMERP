import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiShoppingBag, HiMail, HiLockClosed } from 'react-icons/hi';
import { usePOSAuth } from '../../context/POSAuthContext';
import toast from 'react-hot-toast';

export default function POSLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = usePOSAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to POS!');
      navigate('/pos');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <HiShoppingBag className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">POS System</h1>
            <p className="text-gray-500 mt-1">Sign in to manage sales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Email"
                required
              />
            </div>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In to POS'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-blue-600 hover:underline">
              ← Back to Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}