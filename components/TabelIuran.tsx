"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/ui/EmptyState";
import { bulanIni, formatPeriode, formatRupiah, formatTanggal, formatTanggalPendek } from "@/lib/format";
import { susunGridIuran, tahunIuran } from "@/lib/iuran";
import type { Anggota, Pemasukan } from "@/lib/types";
import { cn } from "@/lib/cn";

const NAMA_BULAN_PENDEK = Array.from({ length: 12 }, (_, i) =>
  new Date(Date.UTC(2000, i, 1)).toLocaleDateString("id-ID", { month: "short", timeZone: "UTC" })
);

/**
 * Iuran bulanan untuk warga: satu baris per anggota, satu kolom per bulan.
 * Sel berisi tanggal bayar (dd/mm/yy); kosong = belum tercatat.
 */
export default function TabelIuran({
  anggota,
  pemasukan,
  query,
}: {
  anggota: Anggota[];
  pemasukan: Pemasukan[];
  query: string;
}) {
  const tahunIni = Number(bulanIni().slice(0, 4));
  const pilihanTahun = useMemo(() => tahunIuran(pemasukan, tahunIni), [pemasukan, tahunIni]);
  const [tahun, setTahun] = useState(tahunIni);
  const grid = useMemo(() => susunGridIuran(anggota, pemasukan, tahun), [anggota, pemasukan, tahun]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const baris = q ? grid.baris.filter((b) => b.nama.toLowerCase().includes(q)) : grid.baris;

  const perBulan = grid.bulan.map((b) => grid.baris.filter((r) => r.tercatat[b]).length);
  const totalTahun = grid.baris.reduce(
    (s, r) => s + Object.values(r.tercatat).reduce((t, c) => t + c.jumlah, 0),
    0
  );

  // Tahun berjalan: bulan ini langsung terlihat di layar ponsel. Tahun lain: mulai dari Januari.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const th = el.querySelector<HTMLElement>(`[data-bulan="${bulanIni()}"]`);
    el.scrollLeft = th ? Math.max(0, th.offsetLeft - el.clientWidth / 2) : 0;
  }, [tahun]);

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div role="group" aria-label="Pilih tahun" className="scrollbar-none flex gap-2 overflow-x-auto">
          {pilihanTahun.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={t === tahun}
              onClick={() => setTahun(t)}
              className={cn(
                "num h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
                t === tahun
                  ? "border-brand bg-brand text-white"
                  : "border-border-strong bg-surface text-ink-muted hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-muted" aria-live="polite">
          Total {tahun}{" "}
          <span className="num font-semibold text-income">{formatRupiah(totalTahun)}</span>
        </p>
      </div>

      <p className="border-b border-border px-4 py-3 text-sm text-ink-muted sm:px-5">
        Tanggal = kapan iuran bulan itu dibayar (tgl/bln/thn). Tanda — berarti belum tercatat. Geser ke samping untuk
        melihat bulan lain.
      </p>

      {baris.length === 0 ? (
        <EmptyState
          icon={Search}
          title={q ? "Tidak ada yang cocok" : "Belum ada data"}
          description={q ? `Tidak ditemukan hasil untuk "${query}".` : "Belum ada data warga."}
        />
      ) : (
        <div ref={scrollRef} className="max-h-[75dvh] overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-left text-[0.9375rem]">
            <caption className="sr-only">Tanggal bayar iuran bulanan {tahun} per anggota</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky top-0 left-0 z-30 w-32 min-w-32 border-b border-border bg-surface-alt px-4 py-3 text-xs font-semibold tracking-wide text-ink-faint uppercase sm:w-56 sm:pl-5"
                >
                  Nama Warga
                </th>
                {grid.bulan.map((b, i) => (
                  <th
                    key={b}
                    scope="col"
                    data-bulan={b}
                    className={cn(
                      "sticky top-0 z-20 border-b border-border bg-surface-alt px-2 py-3 text-center text-xs font-semibold",
                      b === bulanIni() ? "text-brand-dark" : "text-ink-faint"
                    )}
                  >
                    {NAMA_BULAN_PENDEK[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {baris.map((r) => (
                <tr key={r.anggotaId} className="group">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-border bg-surface px-4 py-1 text-sm font-medium text-ink group-hover:bg-surface-alt sm:pl-5 sm:text-[0.9375rem]"
                  >
                    {r.nama}
                  </th>
                  {grid.bulan.map((b) => {
                    const ada = r.tercatat[b];
                    const periode = formatPeriode(`${b}-01`);
                    if (!ada) {
                      return (
                        <td key={b} className="border-b border-border p-0 text-center group-hover:bg-surface-alt/50">
                          <span className="inline-flex h-11 items-center text-ink-faint">
                            <span aria-hidden>—</span>
                            <span className="sr-only">{periode}: belum tercatat</span>
                          </span>
                        </td>
                      );
                    }
                    const keterangan = `${periode} · ${formatRupiah(ada.jumlah)} · dibayar ${formatTanggal(ada.tanggalBayar)}`;
                    return (
                      <td key={b} className="border-b border-border p-0 text-center group-hover:bg-surface-alt/50">
                        <button
                          type="button"
                          title={keterangan}
                          aria-label={`${r.nama}, ${keterangan}`}
                          onClick={() => toast(r.nama, { description: keterangan })}
                          className="num inline-flex h-11 items-center justify-center rounded-lg px-2 text-[0.8125rem] font-semibold whitespace-nowrap text-income hover:bg-income-soft"
                        >
                          {formatTanggalPendek(ada.tanggalBayar)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th
                  scope="row"
                  className="sticky bottom-0 left-0 z-30 border-t border-border bg-surface-alt px-4 py-3 text-xs font-semibold tracking-wide text-ink-faint uppercase sm:pl-5"
                >
                  Sudah bayar
                </th>
                {grid.bulan.map((b, i) => (
                  <td
                    key={b}
                    className="sticky bottom-0 z-20 border-t border-border bg-surface-alt px-2 py-3 text-center text-xs whitespace-nowrap"
                  >
                    <span className="num font-semibold text-ink">{perBulan[i]}</span>
                    <span className="num text-ink-faint">/{grid.baris.length}</span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
