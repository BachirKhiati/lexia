/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Elegant Bright Theme
        lexia: {
          // Primary - Vibrant coral-pink
          primary: '#FF6B9D',
          'primary-light': '#FFB3D1',
          'primary-dark': '#E63E7A',

          // Secondary - Turquoise
          secondary: '#00D9FF',
          'secondary-light': '#7FECFF',
          'secondary-dark': '#00A8CC',

          // Accent - Vivid purple
          accent: '#A855F7',
          'accent-light': '#C084FC',
          'accent-dark': '#7E22CE',

          // Semantic colors
          success: '#10D98E',
          'success-light': '#6EFBB8',
          warning: '#FFB347',
          'warning-light': '#FFD699',
          info: '#4FC3F7',
          'info-light': '#81D4FA',

          // Node states for knowledge graph
          ghost: '#B4B4C6',        // Undiscovered
          learning: '#FFB347',      // In progress
          mastered: '#10D98E',      // Complete

          // Surfaces
          background: '#FAFBFF',
          surface: '#FFFFFF',
          'surface-hover': '#F5F7FF',
          border: '#E5E7EB',

          // Text
          text: '#1F2937',
          'text-secondary': '#6B7280',
          'text-tertiary': '#9CA3AF',
          'text-inverse': '#FFFFFF',
        },
        // Keep legacy synapse colors for gradual migration
        synapse: {
          primary: '#FF6B9D',
          secondary: '#A855F7',
          ghost: '#B4B4C6',
          solid: '#10D98E',
          background: '#FAFBFF',
          surface: '#FFFFFF',
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 157, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 157, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(255, 107, 157, 0.3)',
        'glow-md': '0 0 20px rgba(255, 107, 157, 0.4)',
        'glow-lg': '0 0 30px rgba(255, 107, 157, 0.5)',
        'elegant': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(255, 107, 157, 0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B9D 0%, #FFB3D1 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #00D9FF 0%, #7FECFF 100%)',
        'gradient-accent': 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
        'gradient-rainbow': 'linear-gradient(135deg, #FF6B9D 0%, #00D9FF 50%, #A855F7 100%)',
        'gradient-success': 'linear-gradient(135deg, #10D98E 0%, #6EFBB8 100%)',
      },
    },
  },
  plugins: [],
}
