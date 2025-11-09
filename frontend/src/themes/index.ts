/**
 * Lexia Theme System
 *
 * An elegant, bright theme with vibrant colors designed for
 * an engaging learning experience.
 */

export interface Theme {
  name: string;
  colors: {
    // Primary brand colors
    primary: string;
    primaryLight: string;
    primaryDark: string;

    // Secondary accent colors
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;

    // Tertiary accent
    accent: string;
    accentLight: string;
    accentDark: string;

    // Semantic colors for learning states
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;

    // Node states (for knowledge graph)
    ghost: string;      // Undiscovered words
    learning: string;   // Words in progress
    mastered: string;   // Mastered words

    // Surface colors
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;

    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    rainbow: string;
  };
}

/**
 * Elegant Bright Theme
 * A vibrant, modern theme with excellent readability
 */
export const elegantBrightTheme: Theme = {
  name: 'Elegant Bright',
  colors: {
    // Vibrant coral-pink as primary
    primary: '#FF6B9D',
    primaryLight: '#FFB3D1',
    primaryDark: '#E63E7A',

    // Turquoise as secondary
    secondary: '#00D9FF',
    secondaryLight: '#7FECFF',
    secondaryDark: '#00A8CC',

    // Vivid purple as accent
    accent: '#A855F7',
    accentLight: '#C084FC',
    accentDark: '#7E22CE',

    // Semantic colors - bright and clear
    success: '#10D98E',
    successLight: '#6EFBB8',
    warning: '#FFB347',
    warningLight: '#FFD699',
    info: '#4FC3F7',
    infoLight: '#81D4FA',

    // Knowledge graph node states
    ghost: '#B4B4C6',        // Soft lavender gray
    learning: '#FFB347',      // Warm amber
    mastered: '#10D98E',      // Vibrant mint green

    // Surfaces - light and airy
    background: '#FAFBFF',    // Very light blue-white
    surface: '#FFFFFF',       // Pure white
    surfaceHover: '#F5F7FF',  // Slight blue tint
    border: '#E5E7EB',        // Light gray

    // Text - dark for contrast
    text: {
      primary: '#1F2937',     // Dark gray
      secondary: '#6B7280',   // Medium gray
      tertiary: '#9CA3AF',    // Light gray
      inverse: '#FFFFFF',     // White for dark backgrounds
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(255, 107, 157, 0.4)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #FF6B9D 0%, #FFB3D1 100%)',
    secondary: 'linear-gradient(135deg, #00D9FF 0%, #7FECFF 100%)',
    accent: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
    rainbow: 'linear-gradient(135deg, #FF6B9D 0%, #00D9FF 50%, #A855F7 100%)',
  },
};

/**
 * Get the current active theme
 */
export const getTheme = (): Theme => {
  // For now, return the elegant bright theme
  // In the future, this could check localStorage for user preference
  return elegantBrightTheme;
};

/**
 * Theme utility functions
 */
export const themeUtils = {
  /**
   * Get a CSS custom property name for a color
   */
  getCSSVar: (path: string): string => `var(--lexia-${path.replace('.', '-')})`,

  /**
   * Apply theme colors as CSS custom properties
   */
  applyTheme: (theme: Theme): void => {
    const root = document.documentElement;

    // Apply all colors
    root.style.setProperty('--lexia-primary', theme.colors.primary);
    root.style.setProperty('--lexia-primary-light', theme.colors.primaryLight);
    root.style.setProperty('--lexia-primary-dark', theme.colors.primaryDark);

    root.style.setProperty('--lexia-secondary', theme.colors.secondary);
    root.style.setProperty('--lexia-secondary-light', theme.colors.secondaryLight);
    root.style.setProperty('--lexia-secondary-dark', theme.colors.secondaryDark);

    root.style.setProperty('--lexia-accent', theme.colors.accent);
    root.style.setProperty('--lexia-accent-light', theme.colors.accentLight);
    root.style.setProperty('--lexia-accent-dark', theme.colors.accentDark);

    root.style.setProperty('--lexia-success', theme.colors.success);
    root.style.setProperty('--lexia-success-light', theme.colors.successLight);
    root.style.setProperty('--lexia-warning', theme.colors.warning);
    root.style.setProperty('--lexia-warning-light', theme.colors.warningLight);
    root.style.setProperty('--lexia-info', theme.colors.info);
    root.style.setProperty('--lexia-info-light', theme.colors.infoLight);

    root.style.setProperty('--lexia-ghost', theme.colors.ghost);
    root.style.setProperty('--lexia-learning', theme.colors.learning);
    root.style.setProperty('--lexia-mastered', theme.colors.mastered);

    root.style.setProperty('--lexia-background', theme.colors.background);
    root.style.setProperty('--lexia-surface', theme.colors.surface);
    root.style.setProperty('--lexia-surface-hover', theme.colors.surfaceHover);
    root.style.setProperty('--lexia-border', theme.colors.border);

    root.style.setProperty('--lexia-text-primary', theme.colors.text.primary);
    root.style.setProperty('--lexia-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--lexia-text-tertiary', theme.colors.text.tertiary);
    root.style.setProperty('--lexia-text-inverse', theme.colors.text.inverse);
  },
};

export default elegantBrightTheme;
