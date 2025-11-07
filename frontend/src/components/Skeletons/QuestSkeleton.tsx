import Skeleton from './Skeleton';

export default function QuestSkeleton() {
  return (
    <div className="bg-synapse-card border border-synapse-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton width="3rem" height="3rem" />
        <Skeleton width="5rem" height="1.5rem" className="rounded-full" />
      </div>
      <Skeleton width="80%" height="1.75rem" className="mb-3" />
      <Skeleton width="100%" height="6rem" className="mb-4" />
      <div className="space-y-2">
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="90%" height="1rem" />
        <Skeleton width="95%" height="1rem" />
      </div>
      <div className="mt-6 flex gap-3">
        <Skeleton width="8rem" height="2.5rem" />
        <Skeleton width="8rem" height="2.5rem" />
      </div>
    </div>
  );
}
