/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        synapse: {
          primary: '#6366f1',    // Indigo for primary actions
          secondary: '#8b5cf6',  // Purple for secondary
          ghost: '#94a3b8',      // Gray for ghost nodes
          solid: '#10b981',      // Green for mastered nodes
          background: '#0f172a', // Dark blue background
          surface: '#1e293b',    // Card background
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
