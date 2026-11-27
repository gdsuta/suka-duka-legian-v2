import Card, { CardHeader } from "@/components/ui/Card";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface ItemRincian {
  label: string;
  total: number;
  jumlahEntri: number;
  /** Kelas token latar, mis. "bg-brand" */
  warna: string;
}

/** Kartu porsi per kategori: bar bertumpuk + daftar angka lengkap. */
export default function RincianKategori({
  title,
  description,
  emptyText,
  totalSemua,
  items,
}: {
  title: string;
  description: string;
  emptyText: string;
  totalSemua: number;
  items: ItemRincian[];
}) {
  const total = totalSemua || 1;

  return (
    <Card className="flex flex-col">
      <CardHeader title={title} description={description} />

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-faint">{emptyText}</p>
        ) : (
          <>
            {/* Bar bertumpuk — ringkasan visual; angka lengkap ada di daftar di bawahnya */}
            <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden>
              {items.map((k) => (
                <div
                  key={k.label}
                  className={cn("h-full first:rounded-l-full last:rounded-r-full", k.warna)}
                  style={{ width: `${(k.total / total) * 100}%` }}
                />
              ))}
            </div>

            <ul className="mt-5 space-y-3.5">
              {items.map((k) => {
                const pct = (k.total / total) * 100;
                return (
                  <li key={k.label} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={cn("size-2.5 shrink-0 rounded-full", k.warna)} aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{k.label}</p>
                        <p className="text-xs text-ink-faint">{k.jumlahEntri} entri</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num text-sm font-semibold text-ink">{formatRupiah(k.total)}</p>
                      <p className="num text-xs text-ink-faint">
                        {pct.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}
