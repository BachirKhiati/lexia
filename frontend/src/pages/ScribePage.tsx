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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            ✍️ <span className="text-lexia-primary">The Scribe</span>
          </h1>
          <p className="text-lg sm:text-xl text-lexia-text-secondary">
            Your guided writing workbench. Complete quests to master new words.
          </p>
        </div>

        {/* Active Quest */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner" />
          </div>
        ) : activeQuest ? (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-lexia-text">Current Quest</h2>
            <QuestCard quest={activeQuest} userId={userId} onComplete={handleQuestComplete} />
          </div>
        ) : (
          <div className="card mb-6 sm:mb-8 text-center">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎯</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No Active Quest</h2>
            <p className="text-sm sm:text-base text-lexia-text-secondary mb-4 sm:mb-6">Generate a new quest to continue your learning journey!</p>
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
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-lexia-text">
              Completed Quests ({completedQuests.length})
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {completedQuests.map((quest) => (
                <div key={quest.id} className="card opacity-60">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-lexia-text truncate">{quest.title}</h3>
                      <p className="text-xs sm:text-sm text-lexia-text-secondary">
                        Completed {new Date(quest.completed_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-3xl sm:text-4xl flex-shrink-0">✓</div>
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
