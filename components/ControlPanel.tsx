"use client";
import TombolEkspor from "@/components/TombolEkspor";
import Button from "@/components/ui/Button";
import { ShieldIcon } from "@/components/ui/icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ControlPanelProps {
  isAdmin: boolean;
  anggota: any[];
  pemasukan: any[];
  pengeluaran: any[];
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoKas: number;
}

export default function ControlPanel({
  isAdmin,
  anggota,
  pemasukan,
  pengeluaran,
  totalPemasukan,
  totalPengeluaran,
  saldoKas,
}: ControlPanelProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const logoutAdmin = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!isAdmin) {
    return (
      <div className="bg-surface border border-border rounded-lg card-shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Anda sedang melihat mode{" "}
          <span className="font-medium text-ink">Pantau Warga</span>.
        </p>
        <Button href="/login" variant="outline" size="sm">
          <ShieldIcon className="h-4 w-4" />
          Masuk sebagai Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg card-shadow p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand bg-brand-soft px-2.5 py-1.5 rounded-full">
          <ShieldIcon className="h-3.5 w-3.5" />
          Mode Admin
        </span>
        <button
          onClick={logoutAdmin}
          className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
        >
          Keluar
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
        <Button href="/admin/catat-pemasukan" variant="primary" size="sm" className="shrink-0">
          + Pemasukan
        </Button>
        <Button href="/admin/catat-pengeluaran" variant="danger" size="sm" className="shrink-0">
          + Pengeluaran
        </Button>
        <Button href="/admin/tambah-anggota" variant="outline" size="sm" className="shrink-0">
          + Anggota
        </Button>
        <Button href="/admin/kelola-anggota" variant="secondary" size="sm" className="shrink-0">
          Kelola Anggota
        </Button>
        <Button href="/admin/riwayat-transaksi" variant="secondary" size="sm" className="shrink-0">
          Riwayat
        </Button>
      </div>

      <div className="pt-3 border-t border-border">
        <TombolEkspor
          anggota={anggota}
          pemasukan={pemasukan}
          pengeluaran={pengeluaran}
          totalPemasukan={totalPemasukan}
          totalPengeluaran={totalPengeluaran}
          saldoKas={saldoKas}
        />
      </div>
    </div>
  );
}
