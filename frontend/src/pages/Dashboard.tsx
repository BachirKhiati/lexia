import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { useOnboarding } from '../contexts/OnboardingContext';
import OnboardingModal from '../components/Onboarding/OnboardingModal';

const Dashboard = () => {
  const { showOnboarding, startOnboarding, completeOnboarding, closeOnboarding } = useOnboarding();

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome to <span className="bg-gradient-to-r from-synapse-solid via-cyan-400 to-synapse-secondary bg-clip-text text-transparent font-bold">Lexia</span>
            </h1>
            <p className="text-xl text-gray-400">
              Your Interactive Language Universe. Don't just learn—explore.
            </p>
          </div>
          <button
            onClick={startOnboarding}
            className="flex items-center gap-2 px-4 py-2 bg-synapse-card hover:bg-synapse-border border border-synapse-border rounded-lg transition-colors text-synapse-text"
            title="Restart Tour"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="hidden md:inline">Take Tour</span>
          </button>
        </div>

        {/* Onboarding Modal */}
        {showOnboarding && (
          <OnboardingModal onClose={closeOnboarding} onComplete={completeOnboarding} />
        )}

        {/* The 5 Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* The Scribe */}
          <Link to="/scribe" className="card hover:border-synapse-primary border-2 border-transparent transition-all duration-200 group">
            <div className="text-4xl mb-3">✍️</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-synapse-primary transition-colors">
              The Scribe
            </h2>
            <p className="text-gray-400">
              Your guided workbench. Complete AI-generated quests and practice writing with instant feedback.
            </p>
          </Link>

          {/* The Synapse */}
          <Link to="/synapse" className="card hover:border-synapse-primary border-2 border-transparent transition-all duration-200 group">
            <div className="text-4xl mb-3">🧠</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-synapse-primary transition-colors">
              The Synapse
            </h2>
            <p className="text-gray-400">
              Your knowledge mind map. Visualize what you know and watch your language network grow.
            </p>
          </Link>

          {/* The Lens */}
          <Link to="/lens" className="card hover:border-synapse-primary border-2 border-transparent transition-all duration-200 group">
            <div className="text-4xl mb-3">🌍</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-synapse-primary transition-colors">
              The Lens
            </h2>
            <p className="text-gray-400">
              Import real-world content. Turn any article or video into an interactive learning experience.
            </p>
          </Link>

          {/* The Orator */}
          <Link to="/orator" className="card hover:border-synapse-primary border-2 border-transparent transition-all duration-200 group">
            <div className="text-4xl mb-3">🗣️</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-synapse-primary transition-colors">
              The Orator
            </h2>
            <p className="text-gray-400">
              Your speaking coach. Practice pronunciation and have real conversations with AI.
            </p>
          </Link>
        </div>

        {/* The Learning Cycle */}
        <div className="card bg-gradient-to-br from-synapse-primary/20 to-synapse-secondary/20 border-2 border-synapse-primary/50">
          <h2 className="text-2xl font-bold mb-4">The Complete Learning Cycle</h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              <span><strong className="text-white">Discover:</strong> Read articles with The Lens and find new words</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <span><strong className="text-white">Capture:</strong> Add words to your knowledge graph as "ghost nodes"</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✍️</span>
              <span><strong className="text-white">Practice:</strong> Complete quests to master your ghost words</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <span><strong className="text-white">Master:</strong> Watch ghost nodes become solid as you learn</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗣️</span>
              <span><strong className="text-white">Speak:</strong> Practice conversations with The Orator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
