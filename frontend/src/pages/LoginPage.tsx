import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ErrorAlert from '../components/ErrorAlert';
import { getAuthErrorMessage, parseApiError } from '../utils/errorMessages';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
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
      // Small delay to ensure localStorage is synced before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      toast.success('Welcome back!', 'You\'ve successfully logged in.');
      navigate('/');
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err);
      const apiError = parseApiError(err);
      setError(errorMessage);
      if (apiError.details && apiError.details !== errorMessage) {
        setErrorDetails(apiError.details);
      }
      toast.error('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lexia-background via-lexia-surface-hover to-lexia-background py-6 sm:py-12">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-36 h-36 sm:w-72 sm:h-72 bg-lexia-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 sm:w-96 sm:h-96 bg-lexia-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 sm:w-80 sm:h-80 bg-lexia-accent/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-md w-full relative z-10 px-4">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="relative">
              <img src="/icons/icon-96x96.svg" alt="Lexia" className="w-14 h-14 sm:w-20 sm:h-20 drop-shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-primary opacity-30 blur-2xl rounded-full"></div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-rainbow bg-clip-text text-transparent">
              Lexia
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-lexia-text-secondary font-medium px-4">
            Your Interactive Language Universe
          </p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-lexia-text">Welcome Back</h2>
          <p className="text-sm sm:text-base text-lexia-text-secondary mb-4 sm:mb-6">Sign in to continue your learning journey</p>

          {error && (
            <ErrorAlert
              message={error}
              details={errorDetails}
              onDismiss={() => setError('')}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-lexia-text mb-2">Email Address</label>
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
              <label className="block text-sm font-bold text-lexia-text mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg font-bold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="loading-spinner-sm"></div>
                  Logging in...
                </span>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-lexia-text-secondary">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-lexia-primary hover:text-lexia-primary-dark font-bold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 p-6 bg-gradient-to-r from-lexia-primary/10 via-lexia-secondary/10 to-lexia-accent/10 rounded-2xl border border-lexia-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">✍️</div>
              <p className="text-xs font-semibold text-lexia-text">AI Quests</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🧠</div>
              <p className="text-xs font-semibold text-lexia-text">Mind Map</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📊</div>
              <p className="text-xs font-semibold text-lexia-text">Analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
