export default function Loading() {
  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

        {/* Control panel skeleton */}
        <div className="h-16 bg-surface border border-border rounded-lg animate-pulse" />

        {/* Header skeleton */}
        <div className="bg-surface border border-border rounded-lg p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-surface-alt animate-pulse shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-6 sm:h-8 w-56 sm:w-72 bg-surface-alt rounded animate-pulse" />
            <div className="h-4 w-40 sm:w-48 bg-surface-alt rounded animate-pulse" />
          </div>
        </div>

        {/* Saldo skeleton */}
        <div className="bg-surface-alt rounded-lg p-6 sm:p-8 text-center">
          <div className="h-5 w-40 bg-border rounded animate-pulse mx-auto mb-4" />
          <div className="h-10 sm:h-12 w-56 sm:w-72 bg-border rounded animate-pulse mx-auto" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-5">
              <div className="h-3 w-24 bg-surface-alt rounded animate-pulse mb-3" />
              <div className="h-7 w-32 bg-surface-alt rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
          <div className="h-5 w-48 bg-surface-alt rounded animate-pulse mb-4" />
          <div className="h-56 bg-surface-alt rounded animate-pulse" />
        </div>

        {/* Table skeleton */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-4 bg-surface-alt border-b border-border">
            <div className="h-5 w-56 bg-border rounded animate-pulse" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-surface-alt rounded animate-pulse" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
