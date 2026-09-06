"use client";
import { useState } from "react";

type Tone = "income" | "expense" | "muted";

interface Cell {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
}

interface Row {
  id: string;
  cells: Cell[];
}

const toneClass: Record<Tone, string> = {
  income: "text-income font-semibold",
  expense: "text-expense font-semibold",
  muted: "text-ink-muted",
};

function formatRupiah(n: number) {
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

function formatTanggal(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DataTabs({ anggota, pemasukan, pengeluaran }: any) {
  const [activeTab, setActiveTab] = useState("warga");

  const getNamaWarga = (id: string) => {
    const orang = anggota.find((a: any) => a.id === id);
    return orang ? orang.nama_lengkap : "Tidak diketahui";
  };

  const byKategori = (kategori: string) =>
    pemasukan
      .filter((p: any) => p.kategori === kategori)
      .sort(
        (a: any, b: any) =>
          new Date(b.tanggal_bayar).getTime() -
          new Date(a.tanggal_bayar).getTime()
      );

  const iuranBulanan = byKategori("Iuran Bulanan");
  const denda = byKategori("Denda Gotong-Royong");
  const sumbanganWajib = byKategori("Sumbangan Wajib");
  const donasiSukarela = byKategori("Donasi Sukarela");
  const totalDonasiSukarela = donasiSukarela.reduce(
    (sum: number, p: any) => sum + Number(p.jumlah),
    0
  );

  const tabs: {
    key: string;
    label: string;
    columns: string[];
    rows: Row[];
    emptyMessage: string;
    footer?: Cell[];
  }[] = [
    {
      key: "warga",
      label: "Daftar Warga",
      columns: ["Nama Lengkap", "Alamat"],
      emptyMessage: "Belum ada data warga.",
      rows: anggota.map((orang: any) => ({
        id: orang.id,
        cells: [
          { label: "Nama Lengkap", value: orang.nama_lengkap },
          { label: "Alamat", value: orang.alamat || "-", tone: "muted" },
        ],
      })),
    },
    {
      key: "iuran",
      label: "Iuran Bulanan",
      columns: ["Nama Warga", "Periode", "Jumlah"],
      emptyMessage: "Belum ada data Iuran Bulanan.",
      rows: iuranBulanan.map((item: any) => ({
        id: item.id,
        cells: [
          { label: "Nama Warga", value: getNamaWarga(item.anggota_id) },
          { label: "Periode", value: item.periode_bulan || "-", tone: "muted" },
          { label: "Jumlah", value: formatRupiah(item.jumlah), tone: "income" },
        ],
      })),
    },
    {
      key: "denda",
      label: "Denda Gotong-Royong",
      columns: ["Nama Warga", "Periode", "Jumlah"],
      emptyMessage: "Belum ada data Denda Gotong-Royong.",
      rows: denda.map((item: any) => ({
        id: item.id,
        cells: [
          { label: "Nama Warga", value: getNamaWarga(item.anggota_id) },
          { label: "Periode", value: item.periode_bulan || "-", tone: "muted" },
          { label: "Jumlah", value: formatRupiah(item.jumlah), tone: "income" },
        ],
      })),
    },
    {
      key: "sumbangan",
      label: "Sumbangan Wajib",
      columns: ["Nama Warga", "Jumlah", "Tanggal"],
      emptyMessage: "Belum ada data Sumbangan Wajib.",
      rows: sumbanganWajib.map((item: any) => ({
        id: item.id,
        cells: [
          { label: "Nama Warga", value: getNamaWarga(item.anggota_id) },
          { label: "Jumlah", value: formatRupiah(item.jumlah), tone: "income" },
          { label: "Tanggal", value: formatTanggal(item.tanggal_bayar), tone: "muted" },
        ],
      })),
    },
    {
      key: "donasi",
      label: "Donasi Sukarela",
      columns: ["Nama Warga", "Jumlah", "Tanggal"],
      emptyMessage: "Belum ada data Donasi Sukarela.",
      rows: donasiSukarela.map((item: any) => ({
        id: item.id,
        cells: [
          { label: "Nama Warga", value: getNamaWarga(item.anggota_id) },
          { label: "Jumlah", value: formatRupiah(item.jumlah), tone: "income" },
          { label: "Tanggal", value: formatTanggal(item.tanggal_bayar), tone: "muted" },
        ],
      })),
      footer:
        donasiSukarela.length > 0
          ? [
              { label: "Total Donasi Sukarela", value: "Total Donasi Sukarela" },
              { label: "Jumlah", value: formatRupiah(totalDonasiSukarela), tone: "income" },
              { label: "Entri", value: `${donasiSukarela.length} entri`, tone: "muted" },
            ]
          : undefined,
    },
    {
      key: "pengeluaran",
      label: "Pengeluaran",
      columns: ["Tanggal", "Item Barang", "Total Biaya"],
      emptyMessage: "Belum ada data Pengeluaran.",
      rows: [...pengeluaran].reverse().map((item: any) => ({
        id: item.id,
        cells: [
          { label: "Tanggal", value: item.tanggal, tone: "muted" },
          { label: "Item Barang", value: item.item_barang },
          { label: "Total Biaya", value: formatRupiah(item.total_biaya), tone: "expense" },
        ],
      })),
    },
  ];

  const tab = tabs.find((t) => t.key === activeTab)!;

  return (
    <div>
      {/* Tab Menu */}
      <div className="flex overflow-x-auto border-b border-border bg-surface-alt">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`shrink-0 px-4 min-h-11 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === key
                ? "border-brand text-brand bg-surface"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface text-ink-muted text-xs uppercase tracking-wide border-b border-border">
              <th className="p-4 font-semibold w-12">No</th>
              {tab.columns.map((c) => (
                <th key={c} className="p-4 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tab.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={tab.columns.length + 1}
                  className="p-8 text-center text-ink-faint"
                >
                  {tab.emptyMessage}
                </td>
              </tr>
            ) : (
              tab.rows.map((row, index) => (
                <tr key={row.id} className="border-b border-border hover:bg-surface-alt/60 transition-colors">
                  <td className="p-4 text-ink-faint text-sm">{index + 1}</td>
                  {row.cells.map((cell, ci) => (
                    <td key={ci} className={`p-4 ${cell.tone ? toneClass[cell.tone] : "text-ink"}`}>
                      {cell.value}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {tab.footer && (
            <tfoot>
              <tr className="bg-income-soft border-t-2 border-income/30">
                <td colSpan={2} className="p-4 font-semibold text-ink">
                  {tab.footer[0].value}
                </td>
                <td className={`p-4 ${toneClass.income}`}>{tab.footer[1].value}</td>
                <td className="p-4 text-ink-faint text-sm">{tab.footer[2].value}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden">
        {tab.footer && (
          <div className="p-4 bg-income-soft border-b border-income/20 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Total Donasi Sukarela</p>
              <p className="text-xs text-ink-faint">{tab.footer[2].value}</p>
            </div>
            <p className={`text-base ${toneClass.income}`}>{tab.footer[1].value}</p>
          </div>
        )}
        {tab.rows.length === 0 ? (
          <p className="p-8 text-center text-ink-faint text-sm">{tab.emptyMessage}</p>
        ) : (
          <ul className="divide-y divide-border">
            {tab.rows.map((row) => (
              <li key={row.id} className="p-4">
                <p className="font-medium text-ink">{row.cells[0].value}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  {row.cells.slice(1).map((cell, ci) => (
                    <span key={ci} className={cell.tone ? toneClass[cell.tone] : "text-ink-muted"}>
                      {cell.value}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
