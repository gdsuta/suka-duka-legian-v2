"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { BarChart3 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { formatRupiah, formatRupiahSingkat } from "@/lib/format";

// Nilai warna = token di globals.css (Recharts butuh nilai langsung untuk SVG)
const C = {
  income: "#0e6b58",
  expense: "#e0786c",
  grid: "#e3e8ee",
  tick: "#64748b",
};

export interface TitikBulanan {
  key: string;
  bulan: string;
  pemasukan: number;
  pengeluaran: number;
}

function TooltipKas({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const masuk = Number(payload.find((p) => p.dataKey === "pemasukan")?.value ?? 0);
  const keluar = Number(payload.find((p) => p.dataKey === "pengeluaran")?.value ?? 0);
  const selisih = masuk - keluar;

  return (
    <div className="min-w-48 rounded-xl border border-border bg-surface p-3 text-sm shadow-raised">
      <p className="mb-2 font-semibold text-ink">{label}</p>
      <div className="space-y-1">
        <p className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-ink-muted">
            <span className="size-2.5 rounded-sm" style={{ background: C.income }} />
            Pemasukan
          </span>
          <span className="num font-semibold text-ink">{formatRupiah(masuk)}</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-ink-muted">
            <span className="size-2.5 rounded-sm" style={{ background: C.expense }} />
            Pengeluaran
          </span>
          <span className="num font-semibold text-ink">{formatRupiah(keluar)}</span>
        </p>
      </div>
      <p className="mt-2 flex justify-between gap-4 border-t border-border pt-2">
        <span className="text-ink-muted">Selisih</span>
        <span className={`num font-semibold ${selisih >= 0 ? "text-income" : "text-expense"}`}>
          {selisih >= 0 ? "+" : "−"}
          {formatRupiah(Math.abs(selisih))}
        </span>
      </p>
    </div>
  );
}

export default function GrafikBulanan({ data }: { data: TitikBulanan[] }) {
  if (data.length === 0) {
    return <EmptyState icon={BarChart3} title="Belum ada transaksi" description="Grafik muncul setelah ada data." />;
  }

  // Ringkasan teks untuk pembaca layar
  const ringkasan = data
    .map((d) => `${d.bulan}: masuk ${formatRupiah(d.pemasukan)}, keluar ${formatRupiah(d.pengeluaran)}`)
    .join("; ");

  return (
    <figure>
      <div className="mb-3 flex items-center gap-4 text-sm text-ink-muted" aria-hidden>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: C.income }} /> Pemasukan
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: C.expense }} /> Pengeluaran
        </span>
      </div>
      <div className="h-64 sm:h-72" role="img" aria-label={`Grafik arus kas bulanan. ${ringkasan}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="24%" barGap={3}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis
              dataKey="bulan"
              tick={{ fontSize: 12, fill: C.tick }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatRupiahSingkat}
              tick={{ fontSize: 12, fill: C.tick }}
              axisLine={false}
              tickLine={false}
              width={68}
            />
            <Tooltip content={<TooltipKas />} cursor={{ fill: "rgb(15 26 36 / 0.04)", radius: 6 }} />
            <Bar dataKey="pemasukan" name="Pemasukan" fill={C.income} radius={[5, 5, 0, 0]} maxBarSize={28} />
            <Bar dataKey="pengeluaran" name="Pengeluaran" fill={C.expense} radius={[5, 5, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
