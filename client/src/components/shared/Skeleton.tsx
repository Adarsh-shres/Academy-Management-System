import type { ReactNode } from 'react';

type SkeletonBlockProps = {
  className?: string;
};

export function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return (
    <div
      className={`animate-pulse rounded-[8px] bg-[#e8e2ef] ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className = '' }: SkeletonBlockProps) {
  return <SkeletonBlock className={`h-3 ${className}`} />;
}

export function SkeletonCircle({ className = '' }: SkeletonBlockProps) {
  return <SkeletonBlock className={`rounded-full ${className}`} />;
}

export function SkeletonCard({
  children,
  className = '',
}: SkeletonBlockProps & { children?: ReactNode }) {
  return (
    <div className={`rounded-[10px] border border-[#e7dff0] bg-white shadow-[0_2px_12px_rgba(57,31,86,0.04)] ${className}`}>
      {children}
    </div>
  );
}

