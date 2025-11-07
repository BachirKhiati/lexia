import Skeleton from './Skeleton';

export default function StatCardSkeleton() {
  return (
    <div className="bg-synapse-card border border-synapse-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton width="2rem" height="2rem" />
        <Skeleton circle width="0.5rem" height="0.5rem" />
      </div>
      <Skeleton width="50%" height="2rem" className="mb-2" />
      <Skeleton width="70%" height="0.875rem" className="mb-1" />
      <Skeleton width="60%" height="0.75rem" />
    </div>
  );
}
