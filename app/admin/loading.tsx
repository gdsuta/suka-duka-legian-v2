import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Memuat halaman">
      <Skeleton className="mb-3 h-5 w-20" />
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-5 w-80 max-w-full" />
      <div className="mt-7 max-w-2xl space-y-5 rounded-card border border-border bg-surface p-5 sm:p-7">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-4 w-28" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
