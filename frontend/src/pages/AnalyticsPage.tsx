import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics';
import { StatCardSkeleton, ListSkeleton } from '../components/Skeletons';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics', 'stats'],
    queryFn: () => analyticsService.getLearningStats(),
  });

  const { data: wordsOverTime } = useQuery({
    queryKey: ['analytics', 'words-over-time', selectedPeriod],
    queryFn: () => analyticsService.getWordsOverTime(selectedPeriod),
  });

  const { data: questsOverTime } = useQuery({
    queryKey: ['analytics', 'quests-over-time', selectedPeriod],
    queryFn: () => analyticsService.getQuestsOverTime(selectedPeriod),
  });

  const { data: wordsByPOS } = useQuery({
    queryKey: ['analytics', 'words-by-pos'],
    queryFn: () => analyticsService.getWordsByPartOfSpeech(),
  });

  const { data: challengingWords } = useQuery({
    queryKey: ['analytics', 'challenging-words'],
    queryFn: () => analyticsService.getChallengingWords(10),
  });

  if (statsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-9 w-64 bg-synapse-border rounded animate-pulse mb-2" />
            <div className="h-5 w-48 bg-synapse-border rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-synapse-border rounded animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-synapse-card border border-synapse-border rounded-lg p-6 h-64">
            <div className="h-6 w-48 bg-synapse-border rounded animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-12 bg-synapse-border rounded animate-pulse" />
              <div className="h-12 bg-synapse-border rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-synapse-card border border-synapse-border rounded-lg p-6 h-64">
            <div className="h-6 w-48 bg-synapse-border rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-8 bg-synapse-border rounded animate-pulse" />
              <div className="h-8 bg-synapse-border rounded animate-pulse" />
              <div className="h-8 bg-synapse-border rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-synapse-card border border-synapse-border rounded-lg p-6 h-64">
            <div className="h-6 w-48 bg-synapse-border rounded animate-pulse mb-4" />
            <div className="h-48 bg-synapse-border rounded animate-pulse" />
          </div>
          <div className="bg-synapse-card border border-synapse-border rounded-lg p-6 h-64">
            <div className="h-6 w-48 bg-synapse-border rounded animate-pulse mb-4" />
            <div className="h-48 bg-synapse-border rounded animate-pulse" />
          </div>
        </div>

        {/* Challenging Words Skeleton */}
        <div className="bg-synapse-card border border-synapse-border rounded-lg p-6">
          <div className="h-6 w-64 bg-synapse-border rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ListSkeleton count={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-synapse-text mb-2">
            📊 Learning Analytics
          </h1>
          <p className="text-synapse-text-secondary">
            Track your progress and insights
          </p>
        </div>

        {/* Period selector */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(Number(e.target.value))}
          className="px-4 py-2 bg-synapse-card border border-synapse-border rounded-lg text-synapse-text"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Words"
            value={stats.total_words}
            subtitle={`${stats.words_mastered} mastered`}
            icon="📚"
            color="blue"
          />
          <StatCard
            title="Quests Completed"
            value={stats.quests_completed}
            subtitle={`${stats.quests_pending} pending`}
            icon="✍️"
            color="purple"
          />
          <StatCard
            title="Current Streak"
            value={`${stats.current_streak} days`}
            subtitle={`Longest: ${stats.longest_streak} days`}
            icon="🔥"
            color="orange"
          />
          <StatCard
            title="Due Today"
            value={stats.words_due_today}
            subtitle={`${stats.total_reviews} total reviews`}
            icon="📅"
            color="green"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Words Progress */}
        {stats && (
          <div className="bg-synapse-card border border-synapse-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-synapse-text mb-4">
              Vocabulary Progress
            </h3>
            <div className="space-y-4">
              <ProgressBar
                label="Solid Words"
                value={stats.solid_words}
                max={stats.total_words}
                color="green"
              />
              <ProgressBar
                label="Ghost Words"
                value={stats.ghost_words}
                max={stats.total_words}
                color="gray"
              />
              <div className="pt-4 border-t border-synapse-border">
                <div className="flex justify-between text-sm text-synapse-text-secondary">
                  <span>Average Ease Factor</span>
                  <span className="font-semibold text-synapse-accent">
                    {stats.average_ease_factor.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Words by Part of Speech */}
        {wordsByPOS && wordsByPOS.length > 0 && (
          <div className="bg-synapse-card border border-synapse-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-synapse-text mb-4">
              Words by Part of Speech
            </h3>
            <div className="space-y-3">
              {wordsByPOS.map((item) => (
                <div key={item.part_of_speech} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-synapse-text capitalize">
                        {item.part_of_speech}
                      </span>
                      <span className="text-sm font-semibold text-synapse-accent">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2 bg-synapse-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-synapse-accent to-green-600"
                        style={{
                          width: `${(item.count / (stats?.total_words || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Words Over Time */}
        {wordsOverTime && wordsOverTime.length > 0 && (
          <div className="bg-synapse-card border border-synapse-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-synapse-text mb-4">
              Words Added Over Time
            </h3>
            <SimpleLineChart data={wordsOverTime} color="green" />
          </div>
        )}

        {/* Quests Over Time */}
        {questsOverTime && questsOverTime.length > 0 && (
          <div className="bg-synapse-card border border-synapse-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-synapse-text mb-4">
              Quests Completed Over Time
            </h3>
            <SimpleLineChart data={questsOverTime} color="purple" />
          </div>
        )}
      </div>

      {/* Challenging Words */}
      {challengingWords && challengingWords.length > 0 && (
        <div className="bg-synapse-card border border-synapse-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-synapse-text mb-4">
            🎯 Most Challenging Words
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challengingWords.map((word) => (
              <div
                key={word.word}
                className="bg-synapse-background rounded-lg p-4 border border-synapse-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-synapse-text">{word.word}</div>
                    <div className="text-sm text-synapse-text-secondary">
                      {word.definition}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-synapse-text-secondary">Ease Factor</div>
                    <div className="text-lg font-bold text-orange-500">
                      {word.ease_factor.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-synapse-text-secondary">
                  {word.reviews} reviews
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: 'blue' | 'purple' | 'orange' | 'green';
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-synapse-accent to-green-600',
  };

  return (
    <div className="bg-synapse-card border border-synapse-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <div
          className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClasses[color]}`}
        />
      </div>
      <div className="text-3xl font-bold text-synapse-text mb-1">{value}</div>
      <div className="text-sm text-synapse-text-secondary mb-1">{title}</div>
      <div className="text-xs text-synapse-text-secondary">{subtitle}</div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: 'green' | 'gray';
}

function ProgressBar({ label, value, max, color }: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const colorClasses = {
    green: 'bg-gradient-to-r from-synapse-accent to-green-600',
    gray: 'bg-gray-500',
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-synapse-text">{label}</span>
        <span className="text-sm font-semibold text-synapse-accent">
          {value} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="h-3 bg-synapse-background rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface SimpleLineChartProps {
  data: Array<{ date: string; count: number }>;
  color: 'green' | 'purple';
}

function SimpleLineChart({ data, color }: SimpleLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-synapse-text-secondary">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.count), 1);
  const colorClasses = {
    green: 'bg-synapse-accent',
    purple: 'bg-purple-500',
  };

  return (
    <div className="h-48">
      <div className="flex items-end justify-between h-full gap-1">
        {data.map((point, index) => {
          const height = (point.count / maxValue) * 100;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end group"
            >
              <div
                className={`w-full ${colorClasses[color]} rounded-t transition-all duration-300 hover:opacity-80`}
                style={{ height: `${height}%`, minHeight: point.count > 0 ? '4px' : '0' }}
                title={`${point.date}: ${point.count}`}
              />
              {index % Math.floor(data.length / 5) === 0 && (
                <div className="text-xs text-synapse-text-secondary mt-2 rotate-45 origin-top-left">
                  {new Date(point.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
