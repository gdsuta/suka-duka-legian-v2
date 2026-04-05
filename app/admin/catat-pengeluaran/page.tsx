"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PengeluaranSchema } from "@/lib/schemas";
import { toast } from "sonner";
import Link from "next/link";

export default function CatatPengeluaran() {
  const supabase = createSupabaseBrowserClient();
  const [itemBarang, setItemBarang] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [vendor, setVendor] = useState("");
  const [hargaSatuan, setHargaSatuan] = useState("");
  const [volume, setVolume] = useState("1");
  const [pembeli, setPembeli] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const totalBiaya = (parseFloat(hargaSatuan) || 0) * (parseInt(volume) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = PengeluaranSchema.safeParse({
      item_barang: itemBarang,
      tanggal,
      vendor,
      harga_satuan: parseFloat(hargaSatuan),
      volume: parseInt(volume),
      total_biaya: totalBiaya,
      pembeli,
    });

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as any);
      toast.error("Mohon periksa isian form kembali.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("pengeluaran").insert([parsed.data]);
    setLoading(false);

    if (error) {
      toast.error("Gagal menyimpan: " + error.message);
    } else {
      toast.success("Pengeluaran berhasil dicatat!");
      setItemBarang("");
      setTanggal("");
      setVendor("");
      setHargaSatuan("");
      setVolume("1");
      setPembeli("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-1 text-gray-800">
          Catat Pengeluaran Kas
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Semua field yang ditandai * wajib diisi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Item / Keperluan *
            </label>
            <input
              type="text"
              required
              value={itemBarang}
              onChange={(e) => setItemBarang(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Contoh: Beli Lampu Jalan"
            />
            {fieldErrors.item_barang && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.item_barang[0]}
              </p>
            )}
          </div>

          {/* Tanggal & Vendor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Beli *
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              {fieldErrors.tanggal && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.tanggal[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Toko / Vendor
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="Contoh: Toko Bangunan Jaya"
              />
            </div>
          </div>

          {/* Harga Satuan & Volume */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Harga Satuan (Rp) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={hargaSatuan}
                onChange={(e) => setHargaSatuan(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="0"
              />
              {fieldErrors.harga_satuan && (
                <p className="text-red-500 text-xs mt-1">
                  {fieldErrors.harga_satuan[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Volume / Jumlah *
              </label>
              <input
                type="number"
                required
                min="1"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {/* Total otomatis */}
          <div className="bg-red-50 p-4 rounded-md border border-red-100">
            <p className="text-sm text-red-800 font-semibold">
              Total Biaya: Rp {totalBiaya.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Pembeli */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Pembeli / Penanggung Jawab *
            </label>
            <input
              type="text"
              required
              value={pembeli}
              onChange={(e) => setPembeli(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Contoh: Pak RT"
            />
            {fieldErrors.pembeli && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.pembeli[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-500 hover:underline text-sm">
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
