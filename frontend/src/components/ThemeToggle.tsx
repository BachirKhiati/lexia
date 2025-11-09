import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 bg-lexia-surface dark:bg-lexia-dark-surface hover:bg-lexia-surface-hover dark:hover:bg-lexia-dark-surface-hover border-2 border-lexia-border dark:border-lexia-dark-border group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Light mode icon */}
      <Sun
        className={`w-5 h-5 transition-all duration-300 ${
          theme === 'light'
            ? 'text-lexia-warning scale-100 rotate-0'
            : 'text-lexia-text-tertiary dark:text-lexia-dark-text-tertiary scale-75 -rotate-90 opacity-0 absolute'
        }`}
      />

      {/* Dark mode icon */}
      <Moon
        className={`w-5 h-5 transition-all duration-300 ${
          theme === 'dark'
            ? 'text-lexia-info scale-100 rotate-0'
            : 'text-lexia-text-tertiary scale-75 rotate-90 opacity-0 absolute'
        }`}
      />

      {/* Label */}
      <span className="text-sm font-semibold text-lexia-text dark:text-lexia-dark-text">
        {theme === 'light' ? 'Light' : 'Dark'}
      </span>

      {/* Animated background glow */}
      <div
        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-lexia-warning/10 to-lexia-primary/10'
            : 'bg-gradient-to-r from-lexia-info/10 to-lexia-accent/10'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
