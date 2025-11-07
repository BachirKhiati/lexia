import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorAlert from '../components/ErrorAlert';
import { getAuthErrorMessage, parseApiError } from '../utils/errorMessages';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorDetails('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err);
      const apiError = parseApiError(err);
      setError(errorMessage);
      if (apiError.details && apiError.details !== errorMessage) {
        setErrorDetails(apiError.details);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-synapse-background">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-synapse-primary mb-2">🧠 Synapse</h1>
          <p className="text-xl text-gray-400">Your Interactive Language Universe</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-white">Welcome Back</h2>

          {error && (
            <ErrorAlert
              message={error}
              details={errorDetails}
              onDismiss={() => setError('')}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-synapse-primary hover:text-synapse-primary/80 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>🔒 Secure • 🌍 Multi-language • 🤖 AI-Powered</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
