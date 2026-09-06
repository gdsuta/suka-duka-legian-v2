export default function Loading() {
  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto bg-surface border border-border rounded-lg p-5 sm:p-6 space-y-4">
        <div className="h-7 w-56 bg-surface-alt rounded animate-pulse" />
        <div className="h-4 w-72 bg-surface-alt rounded animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-surface-alt rounded animate-pulse" />
            <div className="h-11 bg-surface-alt rounded-md animate-pulse" />
          </div>
        ))}
        <div className="h-11 bg-surface-alt rounded-md animate-pulse" />
      </div>
    </div>
  );
}
