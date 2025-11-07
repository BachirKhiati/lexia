import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

export default function Skeleton({
  width,
  height,
  circle = false,
  className = '',
  ...props
}: SkeletonProps) {
  const style = {
    width: width || '100%',
    height: height || '1rem',
    ...props.style,
  };

  return (
    <div
      className={`animate-pulse bg-synapse-border ${circle ? 'rounded-full' : 'rounded'
        } ${className}`}
      style={style}
      {...props}
    />
  );
}
