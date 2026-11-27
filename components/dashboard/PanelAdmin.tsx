import { History, TrendingDown, TrendingUp, UserPlus, CalendarCheck } from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import Card, { CardHeader } from "@/components/ui/Card";
import TombolEkspor from "@/components/TombolEkspor";
import type { Anggota, Pemasukan, Pengeluaran } from "@/lib/types";
import type { Ringkasan } from "@/lib/ringkasan";
import { cn } from "@/lib/cn";

const AKSI: { href: string; label: string; desc: string; icon: LucideIcon; tone: string }[] = [
  { href: "/admin/catat-pemasukan", label: "Catat Pemasukan", desc: "Iuran, sumbangan, denda", icon: TrendingUp, tone: "bg-income-soft text-income" },
  { href: "/admin/catat-iuran", label: "Iuran Sekaligus", desc: "Salin buku catatan iuran", icon: CalendarCheck, tone: "bg-brand-soft text-brand" },
  { href: "/admin/catat-pengeluaran", label: "Catat Pengeluaran", desc: "Belanja & biaya operasional", icon: TrendingDown, tone: "bg-expense-soft text-expense" },
  { href: "/admin/tambah-anggota", label: "Tambah Anggota", desc: "Daftarkan warga baru", icon: UserPlus, tone: "bg-sky-soft text-sky" },
  { href: "/admin/riwayat-transaksi", label: "Riwayat", desc: "Lihat & hapus transaksi", icon: History, tone: "bg-gold-soft text-gold" },
];

export default function PanelAdmin({
  anggota,
  pemasukan,
  pengeluaran,
  r,
}: {
  anggota: Anggota[];
  pemasukan: Pemasukan[];
  pengeluaran: Pengeluaran[];
  r: Ringkasan;
}) {
  return (
    <Card>
      <CardHeader title="Aksi Cepat" description="Pencatatan & laporan untuk admin" />
      <div className="grid grid-cols-2 gap-2 px-5 pt-4 sm:px-6 lg:grid-cols-5">
        {AKSI.map(({ href, label, desc, icon: Icon, tone }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-xl border border-border p-3.5 transition-[border-color,box-shadow,background-color] hover:border-border-strong hover:bg-surface-alt/40 hover:shadow-card sm:flex-row sm:items-center"
          >
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone)}>
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">{label}</span>
              <span className="block text-xs text-ink-faint">{desc}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-4 border-t border-border px-5 py-4 sm:px-6">
        <TombolEkspor
          anggota={anggota}
          pemasukan={pemasukan}
          pengeluaran={pengeluaran}
          totalPemasukan={r.totalMasuk}
          totalPengeluaran={r.totalKeluar}
          saldoKas={r.saldo}
        />
      </div>
    </Card>
  );
}
