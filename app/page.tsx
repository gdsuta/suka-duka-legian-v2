import { createSupabaseServerClient } from "@/lib/supabase/server";
import Image from "next/image";
import ControlPanel from "@/components/ControlPanel";
import DataTabs from "@/components/DataTabs";
import GrafikBulanan from "@/components/GrafikBulanan";
import Card from "@/components/ui/Card";
import { JUMLAH_ANGGOTA_MAKSIMAL } from "@/lib/config";

// Cache halaman selama 60 detik — otomatis di-reset setiap kali ada data baru
export const revalidate = 60;

export default async function Dashboard() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isAdmin = !!session;

  // Semua query jalan paralel
  const [
    { data: anggota, error: errorAnggota },
    { data: pemasukan, error: errorPemasukan },
    { data: pengeluaran, error: errorPengeluaran },
  ] = await Promise.all([
    supabase
      .from("anggota")
      .select("*")
      .order("nama_lengkap", { ascending: true }),
    supabase.from("pemasukan").select("*"),
    supabase
      .from("pengeluaran")
      .select("*")
      .order("tanggal", { ascending: true }),
  ]);

  const errors = [errorAnggota, errorPemasukan, errorPengeluaran].filter(
    Boolean
  );
  if (errors.length > 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-16">
        <Card className="p-6 border-expense/30 bg-expense-soft">
          <h2 className="font-heading font-semibold text-expense text-lg mb-2">
            Koneksi Database Gagal
          </h2>
          <ul className="list-disc pl-4 text-expense/90 text-sm space-y-1">
            {errors.map((e, i) => (
              <li key={i}>{e!.message}</li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }

  const totalPemasukan =
    pemasukan?.reduce((sum, item) => sum + Number(item.jumlah), 0) || 0;
  const totalPengeluaran =
    pengeluaran?.reduce((sum, item) => sum + Number(item.total_biaya), 0) || 0;
  const saldoKas = totalPemasukan - totalPengeluaran;

  // Breakdown per sumber pemasukan
  const breakdown = [
    {
      label: "Iuran Bulanan",
      color: "bg-brand",
      total:
        pemasukan
          ?.filter((p) => p.kategori === "Iuran Bulanan")
          .reduce((sum, p) => sum + Number(p.jumlah), 0) || 0,
    },
    {
      label: "Sumbangan Wajib",
      color: "bg-gold",
      total:
        pemasukan
          ?.filter((p) => p.kategori === "Sumbangan Wajib")
          .reduce((sum, p) => sum + Number(p.jumlah), 0) || 0,
    },
    {
      label: "Denda Gotong-Royong",
      color: "bg-expense",
      total:
        pemasukan
          ?.filter((p) => p.kategori === "Denda Gotong-Royong")
          .reduce((sum, p) => sum + Number(p.jumlah), 0) || 0,
    },
    {
      label: "Donasi Sukarela",
      color: "bg-income",
      total:
        pemasukan
          ?.filter((p) => p.kategori === "Donasi Sukarela")
          .reduce((sum, p) => sum + Number(p.jumlah), 0) || 0,
    },
  ].filter((item) => item.total > 0); // hanya tampilkan kategori yang ada nilainya

  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">

        {/* 1. PANEL KONTROL */}
        <ControlPanel
          isAdmin={isAdmin}
          anggota={anggota || []}
          pemasukan={pemasukan || []}
          pengeluaran={pengeluaran || []}
          totalPemasukan={totalPemasukan}
          totalPengeluaran={totalPengeluaran}
          saldoKas={saldoKas}
        />

        {/* 2. HEADER */}
        <Card className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-full bg-surface-alt flex items-center justify-center overflow-hidden border border-border relative">
            <Image
              src="/logo.png"
              alt="Logo Suka Duka Legian"
              fill
              className="object-cover relative z-10"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-xl sm:text-3xl font-semibold text-ink leading-tight">
              Keuangan Suka Duka Legian
            </h1>
            <p className="text-ink-muted mt-1 text-sm sm:text-base">
              Sistem Pencatatan Iuran dan Kas Warga
            </p>
          </div>
        </Card>

        {/* STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

          {/* Total Anggota */}
          <Card className="p-5 border-l-4 border-l-brand">
            <h3 className="text-ink-muted text-xs font-semibold uppercase tracking-wide">
              Total Anggota
            </h3>
            <p className="text-2xl sm:text-3xl font-semibold text-ink mt-1">
              {anggota?.length || 0} / {JUMLAH_ANGGOTA_MAKSIMAL}
            </p>
          </Card>

          {/* Total Pemasukan + Breakdown */}
          <Card className="p-5 border-l-4 border-l-income">
            <h3 className="text-ink-muted text-xs font-semibold uppercase tracking-wide">
              Total Pemasukan
            </h3>
            <p className="text-xl sm:text-2xl font-semibold text-income mt-1">
              Rp {totalPemasukan.toLocaleString("id-ID")}
            </p>

            {/* Breakdown per sumber */}
            {breakdown.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                {breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                      <span className="text-xs text-ink-muted truncate">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-ink shrink-0">
                      Rp {item.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Total Pengeluaran */}
          <Card className="p-5 border-l-4 border-l-expense">
            <h3 className="text-ink-muted text-xs font-semibold uppercase tracking-wide">
              Total Pengeluaran
            </h3>
            <p className="text-xl sm:text-2xl font-semibold text-expense mt-1">
              Rp {totalPengeluaran.toLocaleString("id-ID")}
            </p>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
              <span className="text-xs text-ink-muted">Sisa Saldo Kas</span>
              <span className="text-sm font-bold text-brand">
                Rp {saldoKas.toLocaleString("id-ID")}
              </span>
            </div>
          </Card>

        </div>

        {/* GRAFIK BULANAN */}
        <Card className="p-4 sm:p-6">
          <h2 className="font-heading text-lg sm:text-xl font-semibold text-ink mb-1">
            Grafik Arus Kas Bulanan
          </h2>
          <p className="text-ink-muted text-sm mb-4">
            Perbandingan pemasukan dan pengeluaran per bulan
          </p>
          <GrafikBulanan
            pemasukan={pemasukan || []}
            pengeluaran={pengeluaran || []}
          />
        </Card>

        {/* TABEL DATA */}
        <Card className="overflow-hidden">
          <div className="p-4 bg-surface-alt border-b border-border">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-ink">
              Data Informasi Keseluruhan
            </h2>
          </div>
          <DataTabs
            anggota={anggota || []}
            pemasukan={pemasukan || []}
            pengeluaran={pengeluaran || []}
          />
        </Card>

      </div>
    </div>
  );
}
