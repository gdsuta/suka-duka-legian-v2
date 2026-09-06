export default function Loading() {
  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-8">
        <div className="h-7 w-52 bg-surface-alt rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="h-12 bg-surface-alt animate-pulse" />
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-8 bg-surface-alt rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
