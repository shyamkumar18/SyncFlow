interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export default function Skeleton({ className = '', variant = 'text', width, height, style }: SkeletonProps) {
  const base = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };
  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={{ ...style, width, height }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="flex-1 h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-28 h-8" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ className = 'h-80' }: { className?: string }) {
  return (
    <div className={`p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <Skeleton className="w-48 h-6 mb-6" />
      <div className="flex items-end gap-2 h-full" style={{ maxHeight: 'calc(100% - 3rem)' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${Math.random() * 60 + 20}%` }} />
        ))}
      </div>
    </div>
  );
}
