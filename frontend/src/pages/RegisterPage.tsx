import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('finnish');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, username, password, language);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-synapse-background py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-synapse-primary mb-2">🧠 Synapse</h1>
          <p className="text-xl text-gray-400">Start Your Language Journey</p>
        </div>

        {/* Register Card */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-white">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
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
              <label className="block text-sm font-semibold text-gray-400 mb-2">Username</label>
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
              <label className="block text-sm font-semibold text-gray-400 mb-2">Password</label>
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
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                What language do you want to learn?
              </label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input">
                <option value="finnish">🇫🇮 Finnish</option>
                <option value="english">🇬🇧 English</option>
                <option value="spanish">🇪🇸 Spanish</option>
                <option value="french">🇫🇷 French</option>
                <option value="german">🇩🇪 German</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-synapse-primary hover:text-synapse-primary/80 font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-synapse-primary/10 rounded-lg border border-synapse-primary">
          <p className="text-sm text-gray-300 text-center">
            By creating an account, you'll get access to all Synapse features including AI-powered quests, your
            personal knowledge graph, and more!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
