import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress, UserProgress } from '../services/api';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/scribe', label: 'The Scribe', icon: '✍️' },
    { path: '/synapse', label: 'The Synapse', icon: '🧠' },
    { path: '/lens', label: 'The Lens', icon: '🌍' },
    { path: '/orator', label: 'The Orator', icon: '🗣️' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/export-import', label: 'Export/Import', icon: '💾' },
  ];

  // Fetch user progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      // Double-check token exists before fetching
      const token = localStorage.getItem('synapse_token');
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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-synapse-surface border-r border-gray-800 p-6">
        <div className="mb-8 flex items-center gap-3">
          <img
            src="/icons/icon-72x72.svg"
            alt="Lexia Logo"
            className="w-12 h-12 flex-shrink-0"
          />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-synapse-solid via-cyan-400 to-synapse-secondary bg-clip-text text-transparent">
              Lexia
            </h1>
            <p className="text-sm text-gray-400 mt-1">Interactive Language Universe</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-synapse-primary text-white shadow-lg'
                  : 'text-gray-400 hover:bg-synapse-background hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Learning Stats */}
        <div className="mt-8 p-4 bg-synapse-background rounded-lg">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Your Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Words Mastered</span>
              <span className="text-synapse-solid font-bold">
                {progress ? progress.words_mastered : '...'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Quests Completed</span>
              <span className="text-synapse-primary font-bold">
                {progress ? progress.quests_completed : '...'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Streak</span>
              <span className="text-orange-500 font-bold">
                {progress ? `${progress.streak_days} days` : '...'} 🔥
              </span>
            </div>
          </div>
        </div>

        {/* Language Badge */}
        <div className="mt-4 p-3 bg-gradient-to-r from-synapse-primary to-synapse-secondary rounded-lg text-center">
          <p className="text-xs text-gray-200">Learning</p>
          <p className="text-lg font-bold">
            {user?.language === 'finnish' && '🇫🇮 Finnish'}
            {user?.language === 'english' && '🇬🇧 English'}
            {user?.language === 'spanish' && '🇪🇸 Spanish'}
            {user?.language === 'french' && '🇫🇷 French'}
            {user?.language === 'german' && '🇩🇪 German'}
          </p>
        </div>

        {/* User info & logout */}
        <div className="mt-4 p-3 bg-synapse-background rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Logged in as</p>
          <p className="text-white font-semibold mb-3">{user?.username}</p>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            🚪 Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
