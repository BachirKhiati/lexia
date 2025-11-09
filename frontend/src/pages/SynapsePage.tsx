import { useQuery } from '@tanstack/react-query';
import { getMindMap } from '../services/api';
import MindMap from '../components/Synapse/MindMap';
import { MindMapNode } from '../types';
import { useAuth } from '../contexts/AuthContext';

const SynapsePage = () => {
  const { user } = useAuth();
  const userId = user?.id || 1;

  const { data: mindMapData, isLoading } = useQuery({
    queryKey: ['mindMap', userId],
    queryFn: () => getMindMap(userId),
  });

  const handleNodeClick = (node: MindMapNode) => {
    console.log('Clicked node:', node);
    // TODO: Show word details or navigate to Scribe with this word
  };

  const stats = {
    total: mindMapData?.nodes?.length || 0,
    solid: mindMapData?.nodes?.filter((n) => n.status === 'solid')?.length || 0,
    ghost: mindMapData?.nodes?.filter((n) => n.status === 'ghost')?.length || 0,
  };

  return (
    <div className="h-screen flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          🧠 <span className="text-lexia-secondary">The Synapse</span>
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-lexia-text-secondary mb-3 sm:mb-4">
          Your personal knowledge graph. Watch your language network grow!
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <div className="bg-lexia-surface px-3 sm:px-4 py-2 rounded-lg shadow-sm">
            <span className="text-xs sm:text-sm text-lexia-text-secondary">Total:</span>
            <span className="ml-1 sm:ml-2 font-bold text-lexia-text">{stats.total}</span>
          </div>
          <div className="bg-lexia-surface px-3 sm:px-4 py-2 rounded-lg shadow-sm">
            <span className="text-xs sm:text-sm text-lexia-text-secondary">Mastered:</span>
            <span className="ml-1 sm:ml-2 font-bold text-lexia-success">{stats.solid}</span>
          </div>
          <div className="bg-lexia-surface px-3 sm:px-4 py-2 rounded-lg shadow-sm">
            <span className="text-xs sm:text-sm text-lexia-text-secondary">Learning:</span>
            <span className="ml-1 sm:ml-2 font-bold text-lexia-accent">{stats.ghost}</span>
          </div>
        </div>
      </div>

      {/* Mind Map */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-lexia-background rounded-xl">
            <div className="loading-spinner" />
          </div>
        ) : mindMapData && mindMapData.nodes && mindMapData.nodes.length > 0 ? (
          <MindMap data={mindMapData} onNodeClick={handleNodeClick} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-lexia-background rounded-xl p-4">
            <div className="text-center max-w-md">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🧠</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Your Knowledge Graph is Empty</h2>
              <p className="text-sm sm:text-base text-lexia-text-secondary mb-4">
                Start by importing content with The Lens or completing quests in The Scribe!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SynapsePage;
