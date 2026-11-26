import { CalendarCheck, Receipt, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import { JUMLAH_ANGGOTA_MAKSIMAL } from "@/lib/config";
import { formatPeriode, formatRupiah } from "@/lib/format";
import type { Ringkasan } from "@/lib/ringkasan";
import { cn } from "@/lib/cn";

function Stat({
  icon: Icon,
  iconClass,
  label,
  value,
  sub,
  progress,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  progress?: { value: number; max: number; label: string };
}) {
  const pct = progress ? Math.min(100, Math.round((progress.value / Math.max(progress.max, 1)) * 100)) : 0;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", iconClass)}>
          <Icon className="size-[1.125rem]" aria-hidden />
        </span>
        <p className="text-sm font-medium text-ink-muted">{label}</p>
      </div>
      <p className="num mt-3 text-2xl font-bold tracking-tight text-ink">{value}</p>
      {progress && (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-alt"
          role="progressbar"
          aria-label={progress.label}
          aria-valuenow={progress.value}
          aria-valuemin={0}
          aria-valuemax={progress.max}
        >
          <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}
      {sub && <p className="mt-2 text-sm text-ink-faint">{sub}</p>}
    </Card>
  );
}

export default function StatGrid({ r, jumlahPengeluaran }: { r: Ringkasan; jumlahPengeluaran: number }) {
  const belum = Math.max(r.jumlahAnggota - r.lunasBulanIni, 0);
  const bulan = formatPeriode(`${r.bulanIni}-01`);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      <Stat
        icon={Users}
        iconClass="bg-brand-soft text-brand"
        label="Anggota Terdaftar"
        value={
          <>
            {r.jumlahAnggota}
            <span className="text-base font-semibold text-ink-faint"> / {JUMLAH_ANGGOTA_MAKSIMAL}</span>
          </>
        }
        progress={{ value: r.jumlahAnggota, max: JUMLAH_ANGGOTA_MAKSIMAL, label: "Kuota anggota terisi" }}
      />
      <Stat
        icon={CalendarCheck}
        iconClass="bg-income-soft text-income"
        label={`Iuran ${bulan}`}
        value={
          <>
            {r.lunasBulanIni}
            <span className="text-base font-semibold text-ink-faint"> lunas</span>
          </>
        }
        progress={{ value: r.lunasBulanIni, max: r.jumlahAnggota, label: `Anggota lunas iuran ${bulan}` }}
        sub={belum > 0 ? `${belum} anggota belum membayar` : "Semua anggota sudah lunas"}
      />
      <Stat
        icon={Receipt}
        iconClass="bg-expense-soft text-expense"
        label="Pengeluaran Bulan Ini"
        value={formatRupiah(r.keluarBulanIni)}
        sub={`${jumlahPengeluaran} transaksi tercatat sepanjang waktu`}
      />
    </div>
  );
}
