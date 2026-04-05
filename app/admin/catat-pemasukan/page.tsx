"use client";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PemasukanSchema } from "@/lib/schemas";
import { KATEGORI_PEMASUKAN } from "@/lib/config";
import { toast } from "sonner";
import Link from "next/link";

export default function CatatPemasukan() {
  const supabase = createSupabaseBrowserClient();
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const [anggotaId, setAnggotaId] = useState("");
  const [kategori, setKategori] = useState<string>("Iuran Bulanan");
  const [jumlah, setJumlah] = useState("");
  const [periode, setPeriode] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchAnggota = async () => {
      const { data } = await supabase
        .from("anggota")
        .select("id, nama_lengkap")
        .order("nama_lengkap", { ascending: true });
      if (data) setAnggotaList(data);
    };
    fetchAnggota();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validasi Zod di sisi klien sebelum kirim ke Supabase
    const parsed = PemasukanSchema.safeParse({
      anggota_id: anggotaId,
      kategori,
      jumlah: parseFloat(jumlah),
      periode_bulan: periode || null,
    });

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as any);
      toast.error("Mohon periksa isian form kembali.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("pemasukan").insert([parsed.data]);
    setLoading(false);

    if (error) {
      toast.error("Gagal menyimpan: " + error.message);
    } else {
      toast.success("Pemasukan berhasil dicatat!");
      setJumlah("");
      setPeriode("");
    }
  };

  const showPeriode =
    kategori === "Iuran Bulanan" || kategori === "Denda Gotong-Royong";

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-1 text-gray-800">
          Catat Pemasukan Kas
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Semua field yang ditandai * wajib diisi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Anggota */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Anggota *
            </label>
            <select
              required
              value={anggotaId}
              onChange={(e) => setAnggotaId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="" disabled>
                -- Pilih Anggota --
              </option>
              {anggotaList.map((orang) => (
                <option key={orang.id} value={orang.id}>
                  {orang.nama_lengkap}
                </option>
              ))}
            </select>
            {fieldErrors.anggota_id && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.anggota_id[0]}
              </p>
            )}
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kategori Pemasukan *
            </label>
            <select
              required
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              {KATEGORI_PEMASUKAN.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Jumlah (Rp) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Contoh: 50000"
            />
            {fieldErrors.jumlah && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.jumlah[0]}
              </p>
            )}
          </div>

          {/* Periode Bulan — muncul untuk Iuran Bulanan & Denda */}
          {showPeriode && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Untuk Periode Bulan *
              </label>
              <input
                type="date"
                required
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pilih tanggal 1 pada bulan iuran tersebut.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Pemasukan"}
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
