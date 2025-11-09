import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorAlert from '../components/ErrorAlert';
import { getAuthErrorMessage, parseApiError, getValidationMessage } from '../utils/errorMessages';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('finnish');
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorDetails('');

    // Client-side validation
    const passwordValidation = getValidationMessage('password', password);
    if (passwordValidation) {
      setError('Password requirements not met');
      setErrorDetails(passwordValidation);
      return;
    }

    const usernameValidation = getValidationMessage('username', username);
    if (usernameValidation) {
      setError('Invalid username');
      setErrorDetails(usernameValidation);
      return;
    }

    setLoading(true);

    try {
      await register(email, username, password, language);
      // Small delay to ensure localStorage is synced before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lexia-background via-lexia-surface-hover to-lexia-background py-6 sm:py-12 px-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-48 h-48 sm:w-96 sm:h-96 bg-lexia-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 sm:w-80 sm:h-80 bg-lexia-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-36 h-36 sm:w-72 sm:h-72 bg-lexia-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
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
            Start Your Language Journey
          </p>
        </div>

        {/* Register Card */}
        <div className="card">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-lexia-text">Create Account</h2>
          <p className="text-sm sm:text-base text-lexia-text-secondary mb-4 sm:mb-6">Join thousands of language learners</p>

          {error && (
            <ErrorAlert
              message={error}
              details={errorDetails}
              onDismiss={() => setError('')}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-bold text-lexia-text mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Choose a username"
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
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-lexia-text mb-2">
                What language do you want to learn?
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="select"
              >
                <option value="finnish">🇫🇮 Finnish</option>
                <option value="english">🇬🇧 English</option>
                <option value="spanish">🇪🇸 Spanish</option>
                <option value="french">🇫🇷 French</option>
                <option value="german">🇩🇪 German</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg font-bold mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="loading-spinner-sm"></div>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-lexia-text-secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-lexia-primary hover:text-lexia-primary-dark font-bold transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box - Vibrant */}
        <div className="mt-8 p-6 bg-gradient-to-r from-lexia-primary/10 via-lexia-accent/10 to-lexia-secondary/10 rounded-2xl border border-lexia-border shadow-elegant">
          <p className="text-sm text-lexia-text text-center font-medium">
            ✨ By creating an account, you'll get access to all Lexia features including{' '}
            <span className="font-bold text-lexia-primary">AI-powered quests</span>,{' '}
            <span className="font-bold text-lexia-accent">your personal knowledge graph</span>, and{' '}
            <span className="font-bold text-lexia-secondary">intelligent spaced repetition</span>!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
