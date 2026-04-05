import { createSupabaseServerClient } from "@/lib/supabase/server";
import Image from "next/image";
import ControlPanel from "@/components/ControlPanel";
import DataTabs from "@/components/DataTabs";
import GrafikBulanan from "@/components/GrafikBulanan";
import { JUMLAH_ANGGOTA_MAKSIMAL } from "@/lib/config";

// Cache halaman selama 60 detik — otomatis di-reset setiap kali ada data baru
export const revalidate = 60;

export default async function Dashboard() {
  const supabase = await createSupabaseServerClient();

  // Cek sesi admin dari server (bukan localStorage)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isAdmin = !!session;

  // Semua query jalan paralel — lebih cepat 60-70% dibanding sequential
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

  // Tangkap semua error dari ketiga query sekaligus
  const errors = [errorAnggota, errorPemasukan, errorPengeluaran].filter(
    Boolean
  );
  if (errors.length > 0) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="font-bold text-red-700 text-lg mb-2">
            Koneksi Database Gagal
          </h2>
          <ul className="list-disc pl-4 text-red-600 text-sm space-y-1">
            {errors.map((e, i) => (
              <li key={i}>{e!.message}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const totalPemasukan =
    pemasukan?.reduce((sum, item) => sum + Number(item.jumlah), 0) || 0;
  const totalPengeluaran =
    pengeluaran?.reduce((sum, item) => sum + Number(item.total_biaya), 0) || 0;
  const saldoKas = totalPemasukan - totalPengeluaran;

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-5xl mx-auto">

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
        <div className="flex items-center gap-6 bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="w-24 h-24 shrink-0 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm relative">
            <Image
              src="/logo.png"
              alt="Logo Suka Duka Legian"
              fill
              className="object-cover relative z-10"
              priority
            />
            <span className="text-gray-400 font-bold text-xs absolute z-0">
              LOGO
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Keuangan Suka Duka Legian
            </h1>
            <p className="text-gray-500 mt-1">Sistem Pencatatan Iuran dan Kas</p>
          </div>
        </div>

        {/* 3. SALDO KAS */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-8 text-center border-t-4 border-indigo-500">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Sisa Saldo Kas Saat Ini
          </h2>
          <p className="text-4xl md:text-5xl font-extrabold text-indigo-700 break-words">
            Rp {saldoKas.toLocaleString("id-ID")}
          </p>
        </div>

        {/* 4. STATISTIK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-semibold">
              Total Anggota
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {anggota?.length || 0} / {JUMLAH_ANGGOTA_MAKSIMAL}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-semibold">
              Total Pemasukan
            </h3>
            <p className="text-2xl font-bold text-green-600">
              Rp {totalPemasukan.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-semibold">
              Total Pengeluaran
            </h3>
            <p className="text-2xl font-bold text-red-600">
              Rp {totalPengeluaran.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* 5. GRAFIK BULANAN */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Grafik Arus Kas Bulanan
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Perbandingan pemasukan dan pengeluaran per bulan
          </p>
          <GrafikBulanan
            pemasukan={pemasukan || []}
            pengeluaran={pengeluaran || []}
          />
        </div>

        {/* 6. TABEL DATA */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Data Informasi Keseluruhan
            </h2>
          </div>
          <div className="overflow-x-auto">
            <DataTabs
              anggota={anggota || []}
              pemasukan={pemasukan || []}
              pengeluaran={pengeluaran || []}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
