"use client";
import { useDeferredValue, useState } from "react";
import { Inbox, Search, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import Badge, { TONE_KATEGORI } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { inputClass, selectClass } from "@/components/ui/Field";
import { hapusTransaksi } from "@/lib/actions/keuangan";
import { KATEGORI_PEMASUKAN } from "@/lib/config";
import { formatPeriode, formatRupiah, formatTanggal } from "@/lib/format";
import type { PemasukanDenganNama, Pengeluaran } from "@/lib/types";
import { cn } from "@/lib/cn";

const HALAMAN = 30;

type Jenis = "pemasukan" | "pengeluaran";

export default function RiwayatTransaksi({
  pemasukan,
  pengeluaran,
}: {
  pemasukan: PemasukanDenganNama[];
  pengeluaran: Pengeluaran[];
}) {
  const [jenis, setJenis] = useState<Jenis>("pemasukan");
  const [kategori, setKategori] = useState("");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(HALAMAN);
  const [menghapus, setMenghapus] = useState<string | null>(null);
  const q = useDeferredValue(query).trim().toLowerCase();

  const masuk = pemasukan.filter(
    (p) =>
      (!kategori || p.kategori === kategori) &&
      (!q || `${p.nama_anggota ?? ""} ${p.kategori}`.toLowerCase().includes(q))
  );
  const keluar = pengeluaran.filter(
    (k) => !q || `${k.item_barang} ${k.vendor ?? ""} ${k.pembeli ?? ""}`.toLowerCase().includes(q)
  );
  const jumlahHasil = jenis === "pemasukan" ? masuk.length : keluar.length;
  const total =
    jenis === "pemasukan" ? masuk.reduce((s, p) => s + p.jumlah, 0) : keluar.reduce((s, k) => s + k.total_biaya, 0);

  const hapus = (tabel: Jenis, id: string, label: string, nominal: number) => {
    toast.warning(`Hapus transaksi "${label}"?`, {
      description: `${formatRupiah(nominal)} akan dihapus permanen dan saldo kas ikut berubah.`,
      duration: 10000,
      action: {
        label: "Ya, hapus",
        onClick: async () => {
          setMenghapus(id);
          const res = await hapusTransaksi(tabel, id);
          setMenghapus(null);
          if (res.ok) toast.success(res.message);
          else toast.error(res.message);
        },
      },
      cancel: { label: "Batal", onClick: () => {} },
    });
  };

  const gantiJenis = (j: Jenis) => {
    setJenis(j);
    setLimit(HALAMAN);
  };

  return (
    <div className="space-y-4">
      {/* Kontrol */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Jenis transaksi" className="inline-grid grid-cols-2 rounded-xl bg-surface-alt p-1 ring-1 ring-border ring-inset sm:w-80">
          {(
            [
              { v: "pemasukan", label: "Pemasukan", icon: TrendingUp, n: pemasukan.length },
              { v: "pengeluaran", label: "Pengeluaran", icon: TrendingDown, n: pengeluaran.length },
            ] as const
          ).map(({ v, label, icon: Icon, n }) => (
            <button
              key={v}
              type="button"
              aria-pressed={jenis === v}
              onClick={() => gantiJenis(v)}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-[background-color,color,box-shadow]",
                jenis === v ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink"
              )}
            >
              <Icon className={cn("size-4", jenis === v && (v === "pemasukan" ? "text-income" : "text-expense"))} aria-hidden />
              {label}
              <span className="num text-xs text-ink-faint">{n}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {jenis === "pemasukan" && (
            <select
              value={kategori}
              onChange={(e) => {
                setKategori(e.target.value);
                setLimit(HALAMAN);
              }}
              aria-label="Filter kategori"
              className={cn(selectClass, "h-11 sm:w-56")}
            >
              <option value="">Semua kategori</option>
              {KATEGORI_PEMASUKAN.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          )}
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[1.125rem] -translate-y-1/2 text-ink-faint" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(HALAMAN);
              }}
              placeholder={jenis === "pemasukan" ? "Cari nama warga…" : "Cari item, vendor…"}
              aria-label="Cari transaksi"
              className={cn(inputClass, "h-11 pl-10")}
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-surface-alt/50 px-4 py-3 text-sm sm:px-5" aria-live="polite">
          <span className="text-ink-muted">
            <span className="num font-semibold text-ink">{jumlahHasil}</span> transaksi
          </span>
          <span className="text-ink-muted">
            Total{" "}
            <span className={cn("num font-semibold", jenis === "pemasukan" ? "text-income" : "text-expense")}>
              {formatRupiah(total)}
            </span>
          </span>
        </div>

        {jumlahHasil === 0 ? (
          <EmptyState
            icon={q || kategori ? Search : Inbox}
            title={q || kategori ? "Tidak ada yang cocok" : "Belum ada transaksi"}
            description={q || kategori ? "Coba ubah kata kunci atau filter." : undefined}
          />
        ) : (
          <ul className="divide-y divide-border">
            {jenis === "pemasukan"
              ? masuk.slice(0, limit).map((p) => (
                  <li
                    key={p.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 sm:px-5",
                      menghapus === p.id && "pointer-events-none opacity-50"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{p.nama_anggota ?? "Tidak diketahui"}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-faint">
                        <Badge tone={TONE_KATEGORI[p.kategori] ?? "neutral"}>{p.kategori}</Badge>
                        {p.periode_bulan && (
                          <span>
                            {p.kategori === "Iuran Bulanan" ? formatPeriode(p.periode_bulan) : formatTanggal(p.periode_bulan)}
                          </span>
                        )}
                        <span className="hidden sm:inline">· dicatat {formatTanggal(p.tanggal_bayar)}</span>
                      </div>
                    </div>
                    <span className="num shrink-0 text-[0.9375rem] font-semibold text-income">
                      {formatRupiah(p.jumlah)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => hapus("pemasukan", p.id, `${p.kategori} — ${p.nama_anggota ?? "?"}`, p.jumlah)}
                      aria-label={`Hapus ${p.kategori} ${p.nama_anggota ?? ""}`}
                      className="shrink-0 hover:bg-expense-soft hover:text-expense"
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </li>
                ))
              : keluar.slice(0, limit).map((k) => (
                  <li
                    key={k.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 sm:px-5",
                      menghapus === k.id && "pointer-events-none opacity-50"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{k.item_barang}</p>
                      <p className="mt-0.5 truncate text-sm text-ink-faint">
                        {formatTanggal(k.tanggal)}
                        {k.vendor && ` · ${k.vendor}`}
                        {k.pembeli && ` · oleh ${k.pembeli}`}
                      </p>
                    </div>
                    <span className="num shrink-0 text-[0.9375rem] font-semibold text-expense">
                      {formatRupiah(k.total_biaya)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => hapus("pengeluaran", k.id, k.item_barang, k.total_biaya)}
                      aria-label={`Hapus ${k.item_barang}`}
                      className="shrink-0 hover:bg-expense-soft hover:text-expense"
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </li>
                ))}
          </ul>
        )}

        {jumlahHasil > limit && (
          <div className="border-t border-border p-3 text-center">
            <button
              type="button"
              onClick={() => setLimit((l) => l + HALAMAN * 2)}
              className="h-11 rounded-xl px-4 text-sm font-semibold text-brand hover:bg-brand-soft"
            >
              Tampilkan lebih banyak ({jumlahHasil - limit} lagi)
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
