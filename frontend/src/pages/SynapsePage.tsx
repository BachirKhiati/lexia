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
    total: mindMapData?.nodes.length || 0,
    solid: mindMapData?.nodes.filter((n) => n.status === 'solid').length || 0,
    ghost: mindMapData?.nodes.filter((n) => n.status === 'ghost').length || 0,
  };

  return (
    <div className="h-screen flex flex-col p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">
          🧠 <span className="text-synapse-primary">The Synapse</span>
        </h1>
        <p className="text-xl text-gray-400 mb-4">
          Your personal knowledge graph. Watch your language network grow!
        </p>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-synapse-surface px-4 py-2 rounded-lg">
            <span className="text-gray-400">Total Words:</span>
            <span className="ml-2 font-bold text-white">{stats.total}</span>
          </div>
          <div className="bg-synapse-surface px-4 py-2 rounded-lg">
            <span className="text-gray-400">Mastered:</span>
            <span className="ml-2 font-bold text-synapse-solid">{stats.solid}</span>
          </div>
          <div className="bg-synapse-surface px-4 py-2 rounded-lg">
            <span className="text-gray-400">Learning:</span>
            <span className="ml-2 font-bold text-synapse-ghost">{stats.ghost}</span>
          </div>
        </div>
      </div>

      {/* Mind Map */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-synapse-background rounded-xl">
            <div className="loading-spinner" />
          </div>
        ) : mindMapData && mindMapData.nodes.length > 0 ? (
          <MindMap data={mindMapData} onNodeClick={handleNodeClick} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-synapse-background rounded-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-2xl font-bold mb-2">Your Synapse is Empty</h2>
              <p className="text-gray-400 mb-4">
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
