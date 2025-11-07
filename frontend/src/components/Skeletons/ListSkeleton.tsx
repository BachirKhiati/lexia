import Skeleton from './Skeleton';

interface ListSkeletonProps {
  count?: number;
}

export default function ListSkeleton({ count = 5 }: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-synapse-card border border-synapse-border rounded-lg p-4"
        >
          <div className="flex items-center gap-4">
            <Skeleton circle width="3rem" height="3rem" />
            <div className="flex-1">
              <Skeleton width="70%" height="1.25rem" className="mb-2" />
              <Skeleton width="50%" height="1rem" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
