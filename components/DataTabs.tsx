"use client";
import { useDeferredValue, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Inbox, Search, X } from "lucide-react";
import GridDenda from "@/components/GridDenda";
import TabelIuran from "@/components/TabelIuran";
import Badge, { TONE_KATEGORI_PENGELUARAN } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { inputClass } from "@/components/ui/Field";
import { TANPA_KATEGORI } from "@/lib/config";
import { susunGridDenda } from "@/lib/denda";
import { formatPeriode, formatRupiah, formatTanggal } from "@/lib/format";
import type { Anggota, PemasukanDenganNama, Pengeluaran } from "@/lib/types";
import { cn } from "@/lib/cn";

type Align = "left" | "right";

interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  align?: Align;
  className?: string;
  /** Tampil sebagai baris utama di kartu mobile */
  primary?: boolean;
}

interface TabDef<T> {
  key: string;
  label: string;
  rows: T[];
  columns: Column<T>[];
  search: (row: T) => string;
  total?: (rows: T[]) => number;
  totalTone?: "income" | "expense";
  empty: string;
}

const HALAMAN = 25;

function Nominal({ value, tone }: { value: number; tone: "income" | "expense" }) {
  return (
    <span className={cn("num font-semibold", tone === "income" ? "text-income" : "text-expense")}>
      {formatRupiah(value)}
    </span>
  );
}

function pemasukanTab(
  key: string,
  label: string,
  rows: PemasukanDenganNama[],
  periode: "bulan" | "tanggal" | null
): TabDef<PemasukanDenganNama> {
  const columns: Column<PemasukanDenganNama>[] = [
    { header: "Nama Warga", cell: (r) => r.nama_anggota ?? "Tidak diketahui", primary: true, className: "font-medium text-ink" },
  ];
  if (periode) {
    columns.push({
      header: periode === "bulan" ? "Periode" : "Tgl. Gotong-Royong",
      cell: (r) => (periode === "bulan" ? formatPeriode(r.periode_bulan) : formatTanggal(r.periode_bulan)),
      className: "text-ink-muted",
    });
  }
  columns.push(
    { header: "Tgl. Bayar", cell: (r) => formatTanggal(r.tanggal_bayar), className: "text-ink-muted" },
    { header: "Jumlah", cell: (r) => <Nominal value={r.jumlah} tone="income" />, align: "right" }
  );

  return {
    key,
    label,
    rows,
    columns,
    search: (r) => `${r.nama_anggota ?? ""} ${r.periode_bulan ? formatPeriode(r.periode_bulan) : ""}`,
    total: (rs) => rs.reduce((s, r) => s + r.jumlah, 0),
    totalTone: "income",
    empty: `Belum ada data ${label}.`,
  };
}

export default function DataTabs({
  anggota,
  pemasukan,
  pengeluaran,
}: {
  anggota: Anggota[];
  pemasukan: PemasukanDenganNama[];
  pengeluaran: Pengeluaran[];
}) {
  const baseId = useId();
  const [activeKey, setActiveKey] = useState("warga");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(HALAMAN);
  const deferredQuery = useDeferredValue(query);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = useMemo(() => {
    const byKat = (k: string) => pemasukan.filter((p) => p.kategori === k);
    const list: TabDef<any>[] = [
      {
        key: "warga",
        label: "Daftar Warga",
        rows: anggota,
        columns: [
          { header: "Nama Lengkap", cell: (r: Anggota) => r.nama_lengkap, primary: true, className: "font-medium text-ink" },
          { header: "Alamat", cell: (r: Anggota) => r.alamat || "—", className: "text-ink-muted" },
        ],
        search: (r: Anggota) => `${r.nama_lengkap} ${r.alamat ?? ""}`,
        empty: "Belum ada data warga.",
      } satisfies TabDef<Anggota>,
      pemasukanTab("iuran", "Iuran Bulanan", byKat("Iuran Bulanan"), "bulan"),
      pemasukanTab("wajib", "Sumbangan Wajib", byKat("Sumbangan Wajib"), null),
      pemasukanTab("awal", "Sumbangan Awal", byKat("Sumbangan Awal"), null),
      pemasukanTab("denda", "Denda Kerja Bakti", byKat("Denda Gotong-Royong"), "tanggal"),
      pemasukanTab("donasi", "Donasi Sukarela", byKat("Donasi Sukarela"), null),
      {
        key: "pengeluaran",
        label: "Pengeluaran",
        rows: pengeluaran,
        columns: [
          { header: "Item / Keperluan", cell: (r: Pengeluaran) => r.item_barang, primary: true, className: "font-medium text-ink" },
          {
            header: "Kategori",
            cell: (r: Pengeluaran) => {
              const k = r.kategori ?? TANPA_KATEGORI;
              return <Badge tone={TONE_KATEGORI_PENGELUARAN[k] ?? "neutral"}>{k}</Badge>;
            },
          },
          { header: "Tanggal", cell: (r: Pengeluaran) => formatTanggal(r.tanggal), className: "text-ink-muted" },
          {
            header: "Volume",
            cell: (r: Pengeluaran) =>
              `${r.volume ?? 1} × ${formatRupiah(r.harga_satuan ?? r.total_biaya)}`,
            className: "num text-ink-muted",
          },
          { header: "Total", cell: (r: Pengeluaran) => <Nominal value={r.total_biaya} tone="expense" />, align: "right" },
        ],
        search: (r: Pengeluaran) => `${r.item_barang} ${r.kategori ?? TANPA_KATEGORI} ${r.vendor ?? ""} ${r.pembeli ?? ""}`,
        total: (rs: Pengeluaran[]) => rs.reduce((s, r) => s + r.total_biaya, 0),
        totalTone: "expense",
        empty: "Belum ada data pengeluaran.",
      } satisfies TabDef<Pengeluaran>,
    ];
    return list;
  }, [anggota, pemasukan, pengeluaran]);

  const gridDenda = useMemo(() => susunGridDenda(anggota, pemasukan), [anggota, pemasukan]);

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.key === activeKey));
  const tab = tabs[activeIndex];

  const q = deferredQuery.trim().toLowerCase();
  const filtered = q ? tab.rows.filter((r) => tab.search(r).toLowerCase().includes(q)) : tab.rows;
  const visible = filtered.slice(0, limit);
  const total = tab.total?.(filtered);

  const pilih = (i: number) => {
    setActiveKey(tabs[i].key);
    setLimit(HALAMAN);
    tabRefs.current[i]?.focus();
  };

  // Navigasi keyboard pola WAI-ARIA tabs
  const onKeyDown = (e: KeyboardEvent) => {
    const n = tabs.length;
    if (e.key === "ArrowRight") pilih((activeIndex + 1) % n);
    else if (e.key === "ArrowLeft") pilih((activeIndex - 1 + n) % n);
    else if (e.key === "Home") pilih(0);
    else if (e.key === "End") pilih(n - 1);
    else return;
    e.preventDefault();
  };

  const panelId = `${baseId}-panel`;

  return (
    <div>
      {/* Tab */}
      <div className="relative border-b border-border">
        <div
          role="tablist"
          aria-label="Kategori data"
          onKeyDown={onKeyDown}
          className="scrollbar-none flex gap-1 overflow-x-auto px-3 sm:px-4"
        >
          {tabs.map((t, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`${baseId}-tab-${t.key}`}
                aria-selected={active}
                aria-controls={panelId}
                tabIndex={active ? 0 : -1}
                onClick={() => pilih(i)}
                className={cn(
                  "relative flex h-12 shrink-0 items-center gap-2 px-3 text-sm font-medium whitespace-nowrap transition-colors",
                  "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full",
                  active ? "text-brand-dark after:bg-brand" : "text-ink-muted hover:text-ink"
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "num rounded-full px-1.5 py-px text-xs font-semibold",
                    active ? "bg-brand-soft text-brand-dark" : "bg-surface-alt text-ink-faint"
                  )}
                >
                  {t.rows.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" id={panelId} aria-labelledby={`${baseId}-tab-${tab.key}`}>
        {/* Pencarian + total */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[1.125rem] -translate-y-1/2 text-ink-faint" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(HALAMAN);
              }}
              placeholder={tab.key === "pengeluaran" ? "Cari item, vendor, pembeli…" : "Cari nama…"}
              aria-label={`Cari di ${tab.label}`}
              className={cn(inputClass, "h-11 pr-10 pl-10 [&::-webkit-search-cancel-button]:hidden")}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
                className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-alt hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>
          {/* Iuran menampilkan total per tahun di tabelnya sendiri */}
          {total !== undefined && filtered.length > 0 && tab.key !== "iuran" && (
            <p className="text-sm text-ink-muted" aria-live="polite">
              {q ? `${filtered.length} hasil · ` : `${filtered.length} entri · `}
              Total <Nominal value={total} tone={tab.totalTone ?? "income"} />
            </p>
          )}
        </div>

        {tab.key === "iuran" ? (
          <TabelIuran anggota={anggota} pemasukan={pemasukan} query={deferredQuery} />
        ) : tab.key === "denda" ? (
          <GridDenda grid={gridDenda} query={deferredQuery} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={q ? Search : Inbox}
            title={q ? "Tidak ada yang cocok" : "Belum ada data"}
            description={q ? `Tidak ditemukan hasil untuk "${deferredQuery}".` : tab.empty}
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-[0.9375rem]">
                <thead>
                  <tr className="border-b border-border bg-surface-alt/60">
                    <th scope="col" className="w-14 py-3 pr-2 pl-5 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                      No
                    </th>
                    {tab.columns.map((c) => (
                      <th
                        key={c.header}
                        scope="col"
                        className={cn(
                          "px-4 py-3 text-xs font-semibold tracking-wide text-ink-faint uppercase last:pr-5",
                          c.align === "right" && "text-right"
                        )}
                      >
                        {c.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visible.map((row, i) => (
                    <tr key={row.id} className="transition-colors hover:bg-surface-alt/50">
                      <td className="num py-3.5 pr-2 pl-5 text-sm text-ink-faint">{i + 1}</td>
                      {tab.columns.map((c) => (
                        <td
                          key={c.header}
                          className={cn("px-4 py-3.5 last:pr-5", c.className, c.align === "right" && "text-right")}
                        >
                          {c.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <ul className="divide-y divide-border sm:hidden">
              {visible.map((row) => {
                const primary = tab.columns.find((c) => c.primary)!;
                const amount = tab.columns.find((c) => c.align === "right");
                const rest = tab.columns.filter((c) => c !== primary && c !== amount);
                return (
                  <li key={row.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{primary.cell(row)}</p>
                      <p className="mt-0.5 text-sm text-ink-muted">
                        {rest.map((c, i) => (
                          <span key={c.header}>
                            {i > 0 && <span className="text-border-strong"> · </span>}
                            {c.cell(row)}
                          </span>
                        ))}
                      </p>
                    </div>
                    {amount && <div className="shrink-0 pt-0.5 text-[0.9375rem]">{amount.cell(row)}</div>}
                  </li>
                );
              })}
            </ul>

            {filtered.length > limit && (
              <div className="border-t border-border p-3 text-center">
                <button
                  type="button"
                  onClick={() => setLimit((l) => l + HALAMAN * 2)}
                  className="h-11 rounded-xl px-4 text-sm font-semibold text-brand hover:bg-brand-soft"
                >
                  Tampilkan lebih banyak ({filtered.length - limit} lagi)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
