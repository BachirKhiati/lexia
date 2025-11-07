import Skeleton from './Skeleton';

export default function CardSkeleton() {
  return (
    <div className="bg-synapse-card border border-synapse-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton width="60%" height="1.5rem" className="mb-2" />
          <Skeleton width="40%" height="1rem" />
        </div>
        <Skeleton circle width="2.5rem" height="2.5rem" />
      </div>
      <Skeleton width="100%" height="4rem" className="mb-3" />
      <div className="flex gap-2">
        <Skeleton width="4rem" height="2rem" />
        <Skeleton width="4rem" height="2rem" />
        <Skeleton width="4rem" height="2rem" />
      </div>
    </div>
  );
}
