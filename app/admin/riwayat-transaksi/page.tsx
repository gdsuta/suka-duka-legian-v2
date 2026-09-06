"use client";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { ArrowLeftIcon, TrashIcon } from "@/components/ui/icons";

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

  const DeleteButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      aria-label={`Hapus ${label}`}
      className="inline-flex items-center gap-1 bg-expense-soft text-expense px-2.5 py-1.5 rounded text-xs font-semibold hover:bg-expense-soft/70 transition-colors"
    >
      <TrashIcon className="h-3.5 w-3.5" />
      Hapus
    </button>
  );

  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-8">
          <div>
            <h1 className="font-heading text-xl sm:text-3xl font-semibold text-ink">
              Riwayat Transaksi
            </h1>
            <p className="text-ink-muted text-sm mt-1">
              Kelola semua data pemasukan dan pengeluaran
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-brand transition-colors"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            {[1, 2].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-12 bg-surface-alt animate-pulse" />
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-8 bg-surface-alt rounded animate-pulse" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            {/* Pemasukan */}
            <Card className="overflow-hidden">
              <div className="p-4 bg-income-soft border-b border-income/20 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold text-income">
                  Riwayat Pemasukan
                </h2>
                <span className="text-sm text-income font-medium">
                  {pemasukan.length} entri
                </span>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-alt text-ink-muted">
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
                        <td colSpan={4} className="p-6 text-center text-ink-faint">
                          Belum ada pemasukan.
                        </td>
                      </tr>
                    ) : (
                      pemasukan.map((item) => (
                        <tr key={item.id} className="border-b border-border hover:bg-surface-alt/60 transition-colors">
                          <td className="p-3 font-medium text-ink">
                            {item.anggota?.nama_lengkap || "Tidak diketahui"}
                          </td>
                          <td className="p-3">
                            <span className="text-xs bg-brand-soft text-brand px-2 py-1 rounded-full">
                              {item.kategori}
                            </span>
                            {item.periode_bulan && (
                              <span className="block text-xs text-ink-faint mt-1">
                                Bln: {item.periode_bulan}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-income font-semibold">
                            Rp {Number(item.jumlah).toLocaleString("id-ID")}
                          </td>
                          <td className="p-3 text-center">
                            <DeleteButton
                              label={item.anggota?.nama_lengkap || item.id}
                              onClick={() =>
                                hapusData("pemasukan", item.id, item.anggota?.nama_lengkap || item.id)
                              }
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden">
                {pemasukan.length === 0 ? (
                  <p className="p-6 text-center text-ink-faint text-sm">Belum ada pemasukan.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {pemasukan.map((item) => (
                      <li key={item.id} className="p-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-ink">
                            {item.anggota?.nama_lengkap || "Tidak diketahui"}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-xs bg-brand-soft text-brand px-2 py-0.5 rounded-full">
                              {item.kategori}
                            </span>
                            {item.periode_bulan && (
                              <span className="text-xs text-ink-faint">Bln: {item.periode_bulan}</span>
                            )}
                          </div>
                          <p className="text-sm text-income font-semibold mt-1.5">
                            Rp {Number(item.jumlah).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <DeleteButton
                          label={item.anggota?.nama_lengkap || item.id}
                          onClick={() =>
                            hapusData("pemasukan", item.id, item.anggota?.nama_lengkap || item.id)
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            {/* Pengeluaran */}
            <Card className="overflow-hidden">
              <div className="p-4 bg-expense-soft border-b border-expense/20 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold text-expense">
                  Riwayat Pengeluaran
                </h2>
                <span className="text-sm text-expense font-medium">
                  {pengeluaran.length} entri
                </span>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-alt text-ink-muted">
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
                        <td colSpan={4} className="p-6 text-center text-ink-faint">
                          Belum ada pengeluaran.
                        </td>
                      </tr>
                    ) : (
                      pengeluaran.map((item) => (
                        <tr key={item.id} className="border-b border-border hover:bg-surface-alt/60 transition-colors">
                          <td className="p-3 text-ink-muted">{item.tanggal}</td>
                          <td className="p-3 font-medium text-ink">{item.item_barang}</td>
                          <td className="p-3 text-expense font-semibold">
                            Rp {Number(item.total_biaya).toLocaleString("id-ID")}
                          </td>
                          <td className="p-3 text-center">
                            <DeleteButton
                              label={item.item_barang}
                              onClick={() => hapusData("pengeluaran", item.id, item.item_barang)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden">
                {pengeluaran.length === 0 ? (
                  <p className="p-6 text-center text-ink-faint text-sm">Belum ada pengeluaran.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {pengeluaran.map((item) => (
                      <li key={item.id} className="p-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{item.item_barang}</p>
                          <p className="text-xs text-ink-faint mt-0.5">{item.tanggal}</p>
                          <p className="text-sm text-expense font-semibold mt-1.5">
                            Rp {Number(item.total_biaya).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <DeleteButton
                          label={item.item_barang}
                          onClick={() => hapusData("pengeluaran", item.id, item.item_barang)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
