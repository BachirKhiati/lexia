import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserQuests, generateQuest } from '../services/api';
import QuestCard from '../components/Scribe/QuestCard';
import { useAuth } from '../contexts/AuthContext';

const ScribePage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id || 1;

  const { data: quests, isLoading } = useQuery({
    queryKey: ['quests', userId],
    queryFn: () => getUserQuests(userId),
  });

  const generateQuestMutation = useMutation({
    mutationFn: () => generateQuest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests', userId] });
    },
  });

  const activeQuest = quests?.find((q) => q.status === 'in_progress' || q.status === 'pending');
  const completedQuests = quests?.filter((q) => q.status === 'completed') || [];

  const handleQuestComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['quests', userId] });
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            ✍️ <span className="text-synapse-primary">The Scribe</span>
          </h1>
          <p className="text-xl text-lexia-text-secondary">
            Your guided writing workbench. Complete quests to master new words.
          </p>
        </div>

        {/* Active Quest */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner" />
          </div>
        ) : activeQuest ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-lexia-text">Current Quest</h2>
            <QuestCard quest={activeQuest} userId={userId} onComplete={handleQuestComplete} />
          </div>
        ) : (
          <div className="card mb-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2">No Active Quest</h2>
            <p className="text-lexia-text-secondary mb-6">Generate a new quest to continue your learning journey!</p>
            <button
              onClick={() => generateQuestMutation.mutate()}
              disabled={generateQuestMutation.isPending}
              className="btn-primary"
            >
              {generateQuestMutation.isPending ? 'Generating...' : '✨ Generate New Quest'}
            </button>
          </div>
        )}

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-lexia-text">
              Completed Quests ({completedQuests.length})
            </h2>
            <div className="space-y-4">
              {completedQuests.map((quest) => (
                <div key={quest.id} className="card opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-lexia-text">{quest.title}</h3>
                      <p className="text-sm text-lexia-text-secondary">
                        Completed {new Date(quest.completed_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-4xl">✓</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScribePage;
