"use client";
import { useLayoutEffect, useRef } from "react";
import { Inbox, Search } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/ui/EmptyState";
import type { GridDenda as Grid, SelDenda } from "@/lib/denda";
import { formatRupiah, formatRupiahRingkas, formatTanggal } from "@/lib/format";

function keterangan(nama: string, tanggal: string, sel: SelDenda) {
  const dibayar = sel.tanggalBayar.map((t) => formatTanggal(t)).join(", ");
  return `Kerja bakti ${formatTanggal(tanggal)} · ${formatRupiah(sel.jumlah)} · dibayar ${dibayar}`;
}

/** Tabel anggota × tanggal kerja bakti: sel terisi = denda sudah tercatat dibayar. */
export default function GridDenda({ grid, query }: { grid: Grid; query: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Kerja bakti terbaru ada di kanan; geser ke ujung kanan agar langsung terlihat di layar ponsel
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [grid.kolom.length, query]);

  if (grid.kolom.length === 0) {
    return <EmptyState icon={Inbox} title="Belum ada data" description="Belum ada denda tercatat." />;
  }

  const q = query.trim().toLowerCase();
  const baris = q ? grid.baris.filter((b) => b.nama.toLowerCase().includes(q)) : grid.baris;

  return (
    <div>
      <p className="border-b border-border px-4 py-3 text-sm text-ink-muted sm:px-5">
        Angka = denda yang sudah dibayar untuk kerja bakti tanggal tersebut. Ketuk angka untuk melihat tanggal bayar.
      </p>

      {baris.length === 0 ? (
        <EmptyState icon={Search} title="Tidak ada yang cocok" description={`Tidak ditemukan hasil untuk "${query}".`} />
      ) : (
        <div ref={scrollRef} className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-left text-[0.9375rem]">
            <caption className="sr-only">Pembayaran denda kerja bakti per anggota</caption>
            <thead>
              <tr className="bg-surface-alt/60">
                <th
                  scope="col"
                  className="sticky left-0 z-10 w-32 min-w-32 border-b sm:w-56 border-border bg-surface-alt px-4 py-3 text-xs font-semibold tracking-wide text-ink-faint uppercase sm:pl-5"
                >
                  Nama Warga
                </th>
                {grid.kolom.map((k) => (
                  <th
                    key={k.tanggal}
                    scope="col"
                    className="border-b border-border px-2 py-3 text-center text-xs font-semibold whitespace-nowrap text-ink-faint"
                  >
                    {/* Tahun di baris kedua agar kolom tetap sempit di layar ponsel */}
                    <span className="block">{formatTanggal(k.tanggal).replace(/ \d{4}$/, "")}</span>
                    <span className="block font-normal">{k.tanggal.slice(0, 4)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {baris.map((b) => (
                <tr key={b.anggotaId} className="group">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-border bg-surface px-4 py-1 text-sm font-medium text-ink sm:text-[0.9375rem] group-hover:bg-surface-alt sm:pl-5"
                  >
                    {b.nama}
                  </th>
                  {grid.kolom.map((k) => {
                    const sel = b.sel[k.tanggal];
                    return (
                      <td key={k.tanggal} className="border-b border-border p-0 text-center group-hover:bg-surface-alt/50">
                        {sel ? (
                          <button
                            type="button"
                            title={keterangan(b.nama, k.tanggal, sel)}
                            aria-label={`${b.nama}, ${keterangan(b.nama, k.tanggal, sel)}`}
                            onClick={() => toast(b.nama, { description: keterangan(b.nama, k.tanggal, sel) })}
                            className="num inline-flex h-11 min-w-12 items-center justify-center rounded-lg px-2 text-sm font-semibold text-income hover:bg-income-soft"
                          >
                            {formatRupiahRingkas(sel.jumlah)}
                          </button>
                        ) : (
                          <span className="inline-flex h-11 items-center text-ink-faint" aria-label="belum ada pembayaran">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface-alt/60">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface-alt px-4 py-3 text-xs font-semibold tracking-wide text-ink-faint uppercase sm:pl-5"
                >
                  Jumlah bayar
                </th>
                {grid.kolom.map((k) => (
                  <td key={k.tanggal} className="px-2 py-3 text-center whitespace-nowrap">
                    <span className="num block text-sm font-semibold text-ink">{k.jumlahPembayar} orang</span>
                    <span className="num block text-xs text-ink-muted">{formatRupiah(k.total)}</span>
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
