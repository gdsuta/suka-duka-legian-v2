import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:space-y-5 sm:px-6 sm:py-8" aria-busy="true" aria-label="Memuat data">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <Skeleton className="h-56 rounded-card bg-brand-soft sm:h-64" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-card border border-border bg-surface p-5">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="mt-4 h-7 w-28" />
            <Skeleton className="mt-3 h-1.5 w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="rounded-card border border-border bg-surface p-5 lg:col-span-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-5 h-64" />
        </div>
        <div className="rounded-card border border-border bg-surface p-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-5 h-3 w-full" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="mt-4 h-9 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
