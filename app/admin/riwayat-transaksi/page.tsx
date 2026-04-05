"use client";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

export default function RiwayatTransaksi() {
  const supabase = createSupabaseBrowserClient();
  const [pemasukan, setPemasukan] = useState<any[]>([]);
  const [pengeluaran, setPengeluaran] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [
      { data: dataMasuk, error: errMasuk },
      { data: dataKeluar, error: errKeluar },
    ] = await Promise.all([
      supabase
        .from("pemasukan")
        .select("*, anggota(nama_lengkap)")
        .order("tanggal_bayar", { ascending: false }),
      supabase
        .from("pengeluaran")
        .select("*")
        .order("tanggal", { ascending: false }),
    ]);

    if (errMasuk || errKeluar) {
      toast.error("Gagal memuat data riwayat.");
    } else {
      setPemasukan(dataMasuk || []);
      setPengeluaran(dataKeluar || []);
    }
    setLoading(false);
  };

  const hapusData = (tabel: string, id: string, label: string) => {
    // Gunakan sonner toast dengan action konfirmasi — lebih baik dari window.confirm
    toast.warning(`Hapus "${label}"?`, {
      description: "Aksi ini tidak dapat dibatalkan.",
      action: {
        label: "Ya, Hapus",
        onClick: async () => {
          const { error } = await supabase
            .from(tabel)
            .delete()
            .eq("id", id);

          if (error) {
            toast.error("Gagal menghapus: " + error.message);
          } else {
            toast.success("Data berhasil dihapus.");
            fetchData();
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Riwayat Transaksi
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Kelola semua data pemasukan dan pengeluaran
            </p>
          </div>
          <Link
            href="/"
            className="text-blue-600 hover:underline font-medium text-sm"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-12 bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-8 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tabel Pemasukan */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-green-50 border-b border-green-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-green-800">
                  Riwayat Pemasukan
                </h2>
                <span className="text-sm text-green-600 font-medium">
                  {pemasukan.length} entri
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-3">Nama Warga</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Jumlah</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pemasukan.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 text-center text-gray-400"
                        >
                          Belum ada pemasukan.
                        </td>
                      </tr>
                    ) : (
                      pemasukan.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="p-3 font-medium">
                            {item.anggota?.nama_lengkap || "Tidak diketahui"}
                          </td>
                          <td className="p-3">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {item.kategori}
                            </span>
                            {item.periode_bulan && (
                              <span className="block text-xs text-gray-400 mt-1">
                                Bln: {item.periode_bulan}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-green-600 font-semibold">
                            Rp{" "}
                            {Number(item.jumlah).toLocaleString("id-ID")}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() =>
                                hapusData(
                                  "pemasukan",
                                  item.id,
                                  item.anggota?.nama_lengkap || item.id
                                )
                              }
                              className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition text-xs font-bold"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabel Pengeluaran */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-red-50 border-b border-red-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-red-800">
                  Riwayat Pengeluaran
                </h2>
                <span className="text-sm text-red-600 font-medium">
                  {pengeluaran.length} entri
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Item/Keperluan</th>
                      <th className="p-3">Total Biaya</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengeluaran.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 text-center text-gray-400"
                        >
                          Belum ada pengeluaran.
                        </td>
                      </tr>
                    ) : (
                      pengeluaran.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="p-3 text-gray-500">{item.tanggal}</td>
                          <td className="p-3 font-medium">{item.item_barang}</td>
                          <td className="p-3 text-red-600 font-semibold">
                            Rp{" "}
                            {Number(item.total_biaya).toLocaleString("id-ID")}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() =>
                                hapusData(
                                  "pengeluaran",
                                  item.id,
                                  item.item_barang
                                )
                              }
                              className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition text-xs font-bold"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
