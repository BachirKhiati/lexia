import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress, UserProgress } from '../services/api';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠', gradient: 'from-lexia-primary to-lexia-accent' },
    { path: '/scribe', label: 'The Scribe', icon: '✍️', gradient: 'from-lexia-accent to-lexia-secondary' },
    { path: '/synapse', label: 'The Synapse', icon: '🧠', gradient: 'from-lexia-secondary to-lexia-info' },
    { path: '/lens', label: 'The Lens', icon: '🌍', gradient: 'from-lexia-info to-lexia-success' },
    { path: '/orator', label: 'The Orator', icon: '🗣️', gradient: 'from-lexia-success to-lexia-warning' },
    { path: '/analytics', label: 'Analytics', icon: '📊', gradient: 'from-lexia-warning to-lexia-primary' },
    { path: '/export-import', label: 'Export/Import', icon: '💾', gradient: 'from-lexia-primary to-lexia-secondary' },
  ];

  // Fetch user progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      // Double-check token exists before fetching
      const token = localStorage.getItem('lexia_token');
      if (!token) {
        console.warn('[Layout] No token found, skipping progress fetch');
        return;
      }

      try {
        const data = await getUserProgress();
        setProgress(data);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      }
    };

    if (user) {
      fetchProgress();
    }
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-lexia-background">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-lexia-surface rounded-xl shadow-glow-sm border border-lexia-border hover:bg-lexia-surface-hover transition-all"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-lexia-text" />
        ) : (
          <Menu className="w-6 h-6 text-lexia-text" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Bright & Elegant */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-lexia-surface border-r border-lexia-border p-6 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="mb-8 flex items-center gap-3 pb-6 border-b border-lexia-border">
          <div className="relative">
            <img
              src="/icons/icon-72x72.svg"
              alt="Lexia Logo"
              className="w-14 h-14 flex-shrink-0 drop-shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-xl rounded-full"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-rainbow bg-clip-text text-transparent">
              Lexia
            </h1>
            <p className="text-xs text-lexia-text-secondary mt-1 font-medium">Interactive Language Universe</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                location.pathname === item.path
                  ? 'text-lexia-text-inverse shadow-glow-md'
                  : 'text-lexia-text hover:bg-lexia-surface-hover'
              }`}
            >
              {/* Gradient background for active item */}
              {location.pathname === item.path && (
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-100`}></div>
              )}

              <span className="text-2xl relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </span>
              <span className="font-semibold relative z-10">{item.label}</span>

              {/* Hover gradient effect */}
              {location.pathname !== item.path && (
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Learning Stats - Colorful Cards */}
        <div className="mt-8 p-5 bg-gradient-to-br from-lexia-surface to-lexia-surface-hover rounded-2xl border border-lexia-border shadow-md">
          <h3 className="text-sm font-bold text-lexia-text mb-4 flex items-center gap-2">
            <span className="text-lg">📈</span>
            Your Progress
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-lexia-text-secondary">Words Mastered</span>
              <span className="text-lg font-bold bg-gradient-success bg-clip-text text-transparent">
                {progress ? progress.words_mastered : '...'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-lexia-text-secondary">Quests Completed</span>
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                {progress ? progress.quests_completed : '...'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-lexia-text-secondary">Streak</span>
              <span className="text-lg font-bold text-lexia-warning flex items-center gap-1">
                {progress ? progress.streak_days : '...'} 🔥
              </span>
            </div>
          </div>
        </div>

        {/* Language Badge - Vibrant Gradient */}
        <div className="mt-4 p-4 bg-gradient-rainbow rounded-2xl text-center shadow-glow-sm">
          <p className="text-xs text-lexia-text-inverse/80 font-medium uppercase tracking-wide">Learning</p>
          <p className="text-xl font-bold text-lexia-text-inverse mt-1">
            {user?.language === 'finnish' && '🇫🇮 Finnish'}
            {user?.language === 'english' && '🇬🇧 English'}
            {user?.language === 'spanish' && '🇪🇸 Spanish'}
            {user?.language === 'french' && '🇫🇷 French'}
            {user?.language === 'german' && '🇩🇪 German'}
          </p>
        </div>

        {/* User Info & Logout - Clean Card */}
        <div className="mt-4 p-4 bg-lexia-surface-hover rounded-2xl border border-lexia-border">
          <p className="text-xs text-lexia-text-secondary mb-1 font-medium">Logged in as</p>
          <p className="text-base text-lexia-text font-bold mb-3">{user?.username}</p>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-sm text-red-500 hover:text-red-600 font-semibold transition-colors flex items-center gap-2 group"
          >
            <span className="transform group-hover:translate-x-1 transition-transform">🚪</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content - Light & Airy */}
      <main className="flex-1 overflow-y-auto bg-lexia-background w-full lg:w-auto">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile menu button */}
        {children}
      </main>
    </div>
  );
};

export default Layout;
