export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-5 w-48 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="mt-2 h-4 w-32 rounded-lg bg-gray-100 dark:bg-white/5" />
        </div>
        <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-white/5" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-gray-100 dark:bg-white/5" />
        <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-white/5" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-white/5" />
        <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-white/5" />
        <div className="h-6 w-14 rounded-full bg-gray-100 dark:bg-white/5" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5">
      <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-white/10" />
      <div className="mt-3 h-7 w-16 rounded-lg bg-gray-200 dark:bg-white/10" />
      <div className="mt-2 h-4 w-28 rounded bg-gray-100 dark:bg-white/5" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex-1">
        <div className="h-4 w-40 rounded bg-gray-200 dark:bg-white/10" />
        <div className="mt-1.5 h-3 w-56 rounded bg-gray-100 dark:bg-white/5" />
      </div>
      <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-white/5" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
    </div>
  );
}
