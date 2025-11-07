import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    path: string;
  };
}

interface OnboardingModalProps {
  onClose: () => void;
  onComplete: () => void;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Synapse!',
    description:
      'Synapse is your AI-powered language learning companion. Learn Finnish through interactive quests, mind maps, and spaced repetition. Let us show you around!',
    icon: '🧠',
  },
  {
    title: 'The Analyzer',
    description:
      'Click any word to get instant analysis: definitions, conjugations, examples, and pronunciation. The Analyzer is your universal language assistant, always ready to help.',
    icon: '🔍',
  },
  {
    title: 'The Scribe',
    description:
      'Complete AI-generated writing quests tailored to your level. Each quest helps you practice with your ghost words and get instant feedback from Claude AI.',
    icon: '✍️',
    action: {
      label: 'Try Your First Quest',
      path: '/scribe',
    },
  },
  {
    title: 'The Synapse',
    description:
      'Your personal mind map visualizes everything you know. Words start as ghost nodes (new), become liquid (learning), and finally solid (mastered). Watch your knowledge network grow!',
    icon: '🧠',
    action: {
      label: 'View Your Mind Map',
      path: '/synapse',
    },
  },
  {
    title: 'The Lens',
    description:
      'Import real-world content from articles and videos. The Lens extracts key vocabulary and adds it to your learning queue automatically.',
    icon: '🌍',
    action: {
      label: 'Import Content',
      path: '/lens',
    },
  },
  {
    title: 'The Orator',
    description:
      'Practice speaking with AI voice recognition. Get instant feedback on pronunciation and have natural conversations to build confidence.',
    icon: '🗣️',
    action: {
      label: 'Start Speaking',
      path: '/orator',
    },
  },
  {
    title: 'Spaced Repetition',
    description:
      'Synapse uses the SM-2 algorithm to schedule reviews at optimal intervals. Review words when they\'re about to be forgotten for maximum retention. Check your dashboard for due reviews!',
    icon: '🔄',
  },
  {
    title: 'Ready to Start!',
    description:
      'You\'re all set! Start by importing content with The Lens, or dive right into a quest with The Scribe. Your learning journey begins now. 🚀',
    icon: '🎉',
  },
];

export default function OnboardingModal({ onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const step = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-synapse-card border border-synapse-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-synapse-border">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{step.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-synapse-text">{step.title}</h2>
              <p className="text-sm text-synapse-text-secondary">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-synapse-text-secondary hover:text-synapse-text transition-colors"
            aria-label="Close onboarding"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-synapse-text text-lg leading-relaxed mb-6">{step.description}</p>

          {step.action && (
            <div className="bg-synapse-background rounded-lg p-4 border border-synapse-accent/30">
              <p className="text-sm text-synapse-text-secondary mb-2">Quick Action:</p>
              <a
                href={step.action.path}
                onClick={handleSkip}
                className="inline-flex items-center gap-2 px-4 py-2 bg-synapse-accent hover:bg-synapse-accent/80 text-white rounded-lg transition-colors font-semibold"
              >
                {step.action.label}
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Progress Indicators */}
        <div className="px-8 pb-4">
          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full flex-1 transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-synapse-accent'
                    : index < currentStep
                    ? 'bg-synapse-accent/50'
                    : 'bg-synapse-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-synapse-border bg-synapse-background">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-synapse-text-secondary cursor-not-allowed opacity-50'
                : 'text-synapse-text hover:bg-synapse-card'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleSkip}
            className="text-synapse-text-secondary hover:text-synapse-text transition-colors"
          >
            Skip Tour
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-synapse-accent hover:bg-synapse-accent/80 text-white rounded-lg transition-colors font-semibold"
          >
            {isLastStep ? (
              <>
                <Check className="w-4 h-4" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
