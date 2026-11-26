import Card, { CardHeader } from "@/components/ui/Card";
import DataTabs from "@/components/DataTabs";
import GrafikBulanan from "@/components/GrafikBulanan";
import PanelAdmin from "@/components/dashboard/PanelAdmin";
import SaldoHero from "@/components/dashboard/SaldoHero";
import StatGrid from "@/components/dashboard/StatGrid";
import SumberPemasukan from "@/components/dashboard/SumberPemasukan";
import { getSession } from "@/lib/auth";
import { getAnggota, getPemasukan, getPengeluaran } from "@/lib/queries";
import { arusKasBulanan, hitungRingkasan } from "@/lib/ringkasan";

// Data keuangan selalu terbaru; Neon bangun otomatis dari mode idle saat diakses.
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  // Semua query jalan paralel
  const [session, anggota, pemasukan, pengeluaran] = await Promise.all([
    getSession(),
    getAnggota(),
    getPemasukan(),
    getPengeluaran(),
  ]);

  const r = hitungRingkasan(anggota, pemasukan, pengeluaran);
  const grafik = arusKasBulanan(pemasukan, pengeluaran);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-4 px-4 py-5 sm:space-y-5 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-[1.75rem] sm:leading-9">Ringkasan Kas</h1>
          <p className="text-[0.9375rem] text-ink-muted">Transparansi keuangan untuk seluruh warga.</p>
        </div>
      </div>

      <SaldoHero r={r} />
      <StatGrid r={r} jumlahPengeluaran={pengeluaran.length} />

      {session && <PanelAdmin anggota={anggota} pemasukan={pemasukan} pengeluaran={pengeluaran} r={r} />}

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Arus Kas Bulanan" description="Perbandingan pemasukan dan pengeluaran per bulan" />
          <div className="px-3 pt-4 pb-4 sm:px-5 sm:pb-5">
            <GrafikBulanan data={grafik} />
          </div>
        </Card>
        <SumberPemasukan r={r} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Data Lengkap" description="Semua catatan warga, pemasukan, dan pengeluaran" className="pb-4" />
        <DataTabs anggota={anggota} pemasukan={pemasukan} pengeluaran={pengeluaran} />
      </Card>
    </div>
  );
}
