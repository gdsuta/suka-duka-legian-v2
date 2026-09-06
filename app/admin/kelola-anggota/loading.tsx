export default function Loading() {
  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <div className="h-7 w-52 bg-surface-alt rounded animate-pulse" />
        <div className="h-20 bg-surface border border-border rounded-lg animate-pulse" />
        <div className="bg-surface border border-border rounded-lg overflow-hidden p-4 sm:p-6 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-12 bg-surface-alt rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
