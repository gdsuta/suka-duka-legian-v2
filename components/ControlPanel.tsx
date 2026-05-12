"use client";
import Link from "next/link";
import TombolEkspor from "@/components/TombolEkspor";
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

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6 gap-4">
      {isAdmin ? (
        <>
          {/* Tampilan Admin */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={logoutAdmin}
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition font-medium text-sm border border-gray-300 flex items-center gap-1"
            >
              🔒 Kunci
            </button>
            <Link
              href="/admin/riwayat-transaksi"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition font-medium text-sm"
            >
              Riwayat
            </Link>
            <Link
              href="/admin/catat-pengeluaran"
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition font-medium text-sm"
            >
              + Pengeluaran
            </Link>
            <Link
              href="/admin/catat-pemasukan"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition font-medium text-sm"
            >
              + Pemasukan
            </Link>
            <Link
              href="/admin/tambah-anggota"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm"
            >
              + Anggota
            </Link>
            {/* NEW — Kelola Anggota */}
            <Link
              href="/admin/kelola-anggota"
              className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition font-medium text-sm"
            >
              Kelola Anggota
            </Link>
          </div>

          <div>
            <TombolEkspor
              anggota={anggota}
              pemasukan={pemasukan}
              pengeluaran={pengeluaran}
              totalPemasukan={totalPemasukan}
              totalPengeluaran={totalPengeluaran}
              saldoKas={saldoKas}
            />
          </div>
        </>
      ) : (
        <>
          {/* Tampilan Warga */}
          <div className="flex-1 text-gray-500 text-sm font-medium">
            👋 Selamat datang! Anda sedang melihat mode Pantau Warga.
          </div>
          <Link
            href="/login"
            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100 transition font-medium text-sm border border-indigo-200 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Mode Admin
          </Link>
        </>
      )}
    </div>
  );
}