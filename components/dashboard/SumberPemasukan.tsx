import Card, { CardHeader } from "@/components/ui/Card";
import { WARNA_KATEGORI } from "@/lib/config";
import { formatRupiah } from "@/lib/format";
import type { Ringkasan } from "@/lib/ringkasan";
import { cn } from "@/lib/cn";

export default function SumberPemasukan({ r }: { r: Ringkasan }) {
  const total = r.totalMasuk || 1;

  return (
    <Card className="flex flex-col">
      <CardHeader title="Sumber Pemasukan" description="Porsi tiap kategori dari total kas masuk" />

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
        {r.perKategori.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-faint">Belum ada pemasukan.</p>
        ) : (
          <>
            {/* Bar bertumpuk — ringkasan visual; angka lengkap ada di daftar di bawahnya */}
            <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden>
              {r.perKategori.map((k) => (
                <div
                  key={k.kategori}
                  className={cn("h-full first:rounded-l-full last:rounded-r-full", WARNA_KATEGORI[k.kategori])}
                  style={{ width: `${(k.total / total) * 100}%` }}
                />
              ))}
            </div>

            <ul className="mt-5 space-y-3.5">
              {r.perKategori.map((k) => {
                const pct = (k.total / total) * 100;
                return (
                  <li key={k.kategori} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={cn("size-2.5 shrink-0 rounded-full", WARNA_KATEGORI[k.kategori])} aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{k.kategori}</p>
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
