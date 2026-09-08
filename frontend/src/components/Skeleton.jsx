import React from 'react';

export function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function SkeletonLines({ count = 3, width = '100%' }) {
  return (
    <div className="flex flex-col" style={{ gap: '0.6rem', width }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="skeleton-line" style={{ width: i === count - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}

export function SkeletonBalance() {
  return (
    <div className="flex flex-col" style={{ gap: '0.75rem' }}>
      <Skeleton className="skeleton-line" style={{ width: 160 }} />
      <Skeleton className="skeleton-balance" />
    </div>
  );
}

export function SkeletonTxList({ count = 5 }) {
  return (
    <div className="flex flex-col" style={{ gap: '0.75rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="skeleton-tx" />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col page-enter" style={{ gap: '1.75rem', paddingTop: '1rem' }}>
      <SkeletonBalance />
      <div className="flex" style={{ gap: '1rem' }}>
        <Skeleton style={{ height: 46, flex: 1, borderRadius: 12 }} />
        <Skeleton style={{ height: 46, flex: 1, borderRadius: 12 }} />
        <Skeleton style={{ height: 46, flex: 1, borderRadius: 12 }} />
      </div>
      <SkeletonTxList count={6} />
    </div>
  );
}
