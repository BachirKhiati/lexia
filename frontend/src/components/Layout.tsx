import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/scribe', label: 'The Scribe', icon: '✍️' },
    { path: '/synapse', label: 'The Synapse', icon: '🧠' },
    { path: '/lens', label: 'The Lens', icon: '🌍' },
    { path: '/orator', label: 'The Orator', icon: '🗣️' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-synapse-surface border-r border-gray-800 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-synapse-primary">Synapse</h1>
          <p className="text-sm text-gray-400 mt-1">Interactive Language Universe</p>
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
              <span className="text-synapse-solid font-bold">24</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Quests Completed</span>
              <span className="text-synapse-primary font-bold">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Streak</span>
              <span className="text-orange-500 font-bold">7 days 🔥</span>
            </div>
          </div>
        </div>

        {/* Language Badge */}
        <div className="mt-4 p-3 bg-gradient-to-r from-synapse-primary to-synapse-secondary rounded-lg text-center">
          <p className="text-xs text-gray-200">Learning</p>
          <p className="text-lg font-bold">🇫🇮 Finnish</p>
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
