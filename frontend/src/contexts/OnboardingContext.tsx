import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingContextType {
  showOnboarding: boolean;
  hasSeenOnboarding: boolean;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  closeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = 'synapse_onboarding_completed';

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding before
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    setHasSeenOnboarding(completed === 'true');

    // Show onboarding for new users after a short delay
    if (completed !== 'true') {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        showOnboarding,
        hasSeenOnboarding,
        startOnboarding,
        completeOnboarding,
        closeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
