import { Link } from 'react-router-dom';
import { HelpCircle, Sparkles } from 'lucide-react';
import { useOnboarding } from '../contexts/OnboardingContext';
import OnboardingModal from '../components/Onboarding/OnboardingModal';

const Dashboard = () => {
  const { showOnboarding, startOnboarding, completeOnboarding, closeOnboarding } = useOnboarding();

  const modules = [
    {
      path: '/scribe',
      icon: '✍️',
      title: 'The Scribe',
      description: 'Your guided workbench. Complete AI-generated quests and practice writing with instant feedback.',
      gradient: 'from-lexia-primary to-lexia-accent',
      borderColor: 'hover:border-lexia-primary',
    },
    {
      path: '/synapse',
      icon: '🧠',
      title: 'The Synapse',
      description: 'Your knowledge mind map. Visualize what you know and watch your language network grow.',
      gradient: 'from-lexia-secondary to-lexia-info',
      borderColor: 'hover:border-lexia-secondary',
    },
    {
      path: '/lens',
      icon: '🌍',
      title: 'The Lens',
      description: 'Import real-world content. Turn any article or video into an interactive learning experience.',
      gradient: 'from-lexia-info to-lexia-success',
      borderColor: 'hover:border-lexia-info',
    },
    {
      path: '/orator',
      icon: '🗣️',
      title: 'The Orator',
      description: 'Your speaking coach. Practice pronunciation and have real conversations with AI.',
      gradient: 'from-lexia-accent to-lexia-warning',
      borderColor: 'hover:border-lexia-accent',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header - Bright & Welcoming */}
        <div className="mb-6 sm:mb-8 lg:mb-10 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
              Welcome to <span className="bg-gradient-rainbow bg-clip-text text-transparent">Lexia</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-lexia-text-secondary font-medium">
              Your Interactive Language Universe. Don't just learn—explore.
            </p>
          </div>
          <button
            onClick={startOnboarding}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-lexia-surface hover:bg-lexia-surface-hover border-2 border-lexia-border hover:border-lexia-primary rounded-xl transition-all duration-300 text-lexia-text font-semibold shadow-md hover:shadow-glow-sm group self-start sm:self-auto"
            title="Restart Tour"
          >
            <HelpCircle className="w-5 h-5 group-hover:text-lexia-primary transition-colors" />
            <span className="sm:inline">Take Tour</span>
          </button>
        </div>

        {/* Onboarding Modal */}
        {showOnboarding && (
          <OnboardingModal onClose={closeOnboarding} onComplete={completeOnboarding} />
        )}

        {/* The 5 Modules - Colorful Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
          {modules.map((module) => (
            <Link
              key={module.path}
              to={module.path}
              className={`card ${module.borderColor} border-2 border-transparent transition-all duration-300 group relative overflow-hidden`}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {module.icon}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-lexia-text group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300" style={{
                  backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  '--tw-gradient-from': module.gradient.includes('primary') ? '#FF6B9D' :
                                       module.gradient.includes('secondary') ? '#00D9FF' :
                                       module.gradient.includes('info') ? '#4FC3F7' : '#A855F7',
                  '--tw-gradient-to': module.gradient.includes('accent') ? '#A855F7' :
                                     module.gradient.includes('info') ? '#4FC3F7' :
                                     module.gradient.includes('success') ? '#10D98E' : '#FFB347'
                } as any}>
                  {module.title}
                </h2>
                <p className="text-sm sm:text-base text-lexia-text-secondary leading-relaxed">
                  {module.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* The Learning Cycle - Vibrant Gradient Card */}
        <div className="card bg-gradient-to-br from-lexia-primary/10 via-lexia-accent/10 to-lexia-secondary/10 border-2 border-lexia-primary/30 shadow-elegant">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-lexia-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-lexia-text">The Complete Learning Cycle</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-lexia-surface rounded-xl border border-lexia-border hover:border-lexia-info transition-all duration-300 group">
              <span className="text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform flex-shrink-0">🌍</span>
              <span className="text-sm sm:text-base text-lexia-text">
                <strong className="font-bold text-lexia-info">Discover:</strong> Read articles with The Lens and find new words
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-lexia-surface rounded-xl border border-lexia-border hover:border-lexia-secondary transition-all duration-300 group">
              <span className="text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform flex-shrink-0">🧠</span>
              <span className="text-sm sm:text-base text-lexia-text">
                <strong className="font-bold text-lexia-secondary">Capture:</strong> Add words to your knowledge graph as "ghost nodes"
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-lexia-surface rounded-xl border border-lexia-border hover:border-lexia-primary transition-all duration-300 group">
              <span className="text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform flex-shrink-0">✍️</span>
              <span className="text-sm sm:text-base text-lexia-text">
                <strong className="font-bold text-lexia-primary">Practice:</strong> Complete quests to master your ghost words
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-lexia-surface rounded-xl border border-lexia-border hover:border-lexia-success transition-all duration-300 group">
              <span className="text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform flex-shrink-0">✨</span>
              <span className="text-sm sm:text-base text-lexia-text">
                <strong className="font-bold text-lexia-success">Master:</strong> Watch ghost nodes become solid as you learn
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-lexia-surface rounded-xl border border-lexia-border hover:border-lexia-accent transition-all duration-300 group">
              <span className="text-3xl sm:text-4xl transform group-hover:scale-110 transition-transform flex-shrink-0">🗣️</span>
              <span className="text-sm sm:text-base text-lexia-text">
                <strong className="font-bold text-lexia-accent">Speak:</strong> Practice conversations with The Orator
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
