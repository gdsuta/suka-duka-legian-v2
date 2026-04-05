"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AnggotaSchema } from "@/lib/schemas";
import { toast } from "sonner";
import Link from "next/link";

export default function TambahAnggota() {
  const supabase = createSupabaseBrowserClient();
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = AnggotaSchema.safeParse({ nama_lengkap: nama, alamat });

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as any);
      toast.error("Mohon periksa isian form kembali.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("anggota").insert([parsed.data]);
    setLoading(false);

    if (error) {
      toast.error("Gagal menyimpan: " + error.message);
    } else {
      toast.success("Anggota baru berhasil ditambahkan!");
      setNama("");
      setAlamat("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-1 text-gray-800">
          Tambah Anggota Baru
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Semua field yang ditandai * wajib diisi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Contoh: I Wayan Suka"
            />
            {fieldErrors.nama_lengkap && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.nama_lengkap[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alamat Lengkap *
            </label>
            <textarea
              required
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Contoh: Jl. Legian No. 10"
              rows={3}
            />
            {fieldErrors.alamat && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.alamat[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Anggota"}
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
