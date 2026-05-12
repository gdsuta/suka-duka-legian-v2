"use client";
import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AnggotaSchema } from "@/lib/schemas";
import { toast } from "sonner";
import Link from "next/link";

interface Anggota {
  id: string;
  nama_lengkap: string;
  alamat: string;
  created_at: string;
}

export default function KelolaAnggota() {
  const supabase = createSupabaseBrowserClient();
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editAlamat, setEditAlamat] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAnggota = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("anggota")
      .select("*")
      .order("nama_lengkap", { ascending: true });

    if (error) {
      toast.error("Gagal memuat data anggota: " + error.message);
    } else {
      setAnggotaList(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnggota();
  }, [fetchAnggota]);

  // --- EDIT ---
  const startEdit = (anggota: Anggota) => {
    setEditingId(anggota.id);
    setEditNama(anggota.nama_lengkap);
    setEditAlamat(anggota.alamat || "");
    setFieldErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNama("");
    setEditAlamat("");
    setFieldErrors({});
  };

  const saveEdit = async (id: string) => {
    setFieldErrors({});

    const parsed = AnggotaSchema.safeParse({
      nama_lengkap: editNama,
      alamat: editAlamat,
    });

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as any);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("anggota")
      .update(parsed.data)
      .eq("id", id);
    setSaving(false);

    if (error) {
      toast.error("Gagal memperbarui data: " + error.message);
    } else {
      toast.success("Data anggota berhasil diperbarui.");
      setEditingId(null);
      fetchAnggota();
    }
  };

  // --- DELETE ---
  const handleDelete = async (anggota: Anggota) => {
    // Cek dulu apakah anggota ini punya riwayat pemasukan
    const { count, error: checkError } = await supabase
      .from("pemasukan")
      .select("id", { count: "exact", head: true })
      .eq("anggota_id", anggota.id);

    if (checkError) {
      toast.error("Gagal memeriksa data: " + checkError.message);
      return;
    }

    const jumlahTrx = count || 0;

    if (jumlahTrx > 0) {
      // Anggota punya riwayat pembayaran — tampilkan peringatan khusus
      toast.warning(
        `"${anggota.nama_lengkap}" memiliki ${jumlahTrx} riwayat pembayaran.`,
        {
          description:
            "Menghapus anggota ini akan menghapus SEMUA riwayat pembayarannya secara permanen. Aksi ini tidak dapat dibatalkan.",
          duration: 10000,
          action: {
            label: "Hapus Semua",
            onClick: () => deleteWithRecords(anggota),
          },
          cancel: {
            label: "Batal",
            onClick: () => {},
          },
        }
      );
    } else {
      // Anggota tidak punya riwayat — hapus langsung dengan konfirmasi
      toast.warning(`Hapus "${anggota.nama_lengkap}" dari daftar anggota?`, {
        description: "Aksi ini tidak dapat dibatalkan.",
        action: {
          label: "Ya, Hapus",
          onClick: () => deleteAnggota(anggota.id, anggota.nama_lengkap),
        },
        cancel: {
          label: "Batal",
          onClick: () => {},
        },
      });
    }
  };

  const deleteWithRecords = async (anggota: Anggota) => {
    // Hapus riwayat pemasukan dulu (FK constraint), lalu hapus anggota
    const { error: errorPemasukan } = await supabase
      .from("pemasukan")
      .delete()
      .eq("anggota_id", anggota.id);

    if (errorPemasukan) {
      toast.error("Gagal menghapus riwayat pemasukan: " + errorPemasukan.message);
      return;
    }

    deleteAnggota(anggota.id, anggota.nama_lengkap);
  };

  const deleteAnggota = async (id: string, nama: string) => {
    const { error } = await supabase.from("anggota").delete().eq("id", id);

    if (error) {
      toast.error("Gagal menghapus anggota: " + error.message);
    } else {
      toast.success(`"${nama}" berhasil dihapus dari daftar anggota.`);
      fetchAnggota();
    }
  };

  // Filter berdasarkan pencarian
  const filteredAnggota = anggotaList.filter(
    (a) =>
      a.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.alamat || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kelola Anggota</h1>
            <p className="text-sm text-gray-500 mt-1">
              Edit atau hapus anggota yang keluar dari komunitas.
            </p>
          </div>
          <Link
            href="/"
            className="text-blue-500 hover:underline text-sm font-medium self-start sm:self-auto"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>

        {/* Stats bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Anggota</p>
            <p className="text-2xl font-bold text-gray-800">
              {anggotaList.length}
            </p>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari nama atau alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : filteredAnggota.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              {searchQuery
                ? `Tidak ada anggota yang cocok dengan "${searchQuery}".`
                : "Belum ada data anggota."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-600 w-8">
                    No
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-600">
                    Nama Lengkap
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-600">
                    Alamat
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-600 w-36">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAnggota.map((anggota, index) => (
                  <tr
                    key={anggota.id}
                    className={`border-b transition ${
                      editingId === anggota.id
                        ? "bg-indigo-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-4 text-gray-500">{index + 1}</td>

                    {editingId === anggota.id ? (
                      // --- MODE EDIT (inline) ---
                      <>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editNama}
                            onChange={(e) => setEditNama(e.target.value)}
                            className="w-full border border-indigo-300 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Nama lengkap"
                            autoFocus
                          />
                          {fieldErrors.nama_lengkap && (
                            <p className="text-red-500 text-xs mt-1">
                              {fieldErrors.nama_lengkap[0]}
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editAlamat}
                            onChange={(e) => setEditAlamat(e.target.value)}
                            className="w-full border border-indigo-300 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Alamat"
                          />
                          {fieldErrors.alamat && (
                            <p className="text-red-500 text-xs mt-1">
                              {fieldErrors.alamat[0]}
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => saveEdit(anggota.id)}
                              disabled={saving}
                              className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-60"
                            >
                              {saving ? "..." : "Simpan"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-gray-300 transition"
                            >
                              Batal
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // --- MODE TAMPIL ---
                      <>
                        <td className="p-4 font-medium text-gray-800">
                          {anggota.nama_lengkap}
                        </td>
                        <td className="p-4 text-gray-500">
                          {anggota.alamat || (
                            <span className="italic text-gray-300">
                              Tidak ada
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => startEdit(anggota)}
                              className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-amber-200 transition"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(anggota)}
                              className="bg-red-100 text-red-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-200 transition"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Info note */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          ⚠️ Menghapus anggota yang memiliki riwayat pembayaran akan menghapus
          seluruh data transaksinya secara permanen.
        </p>
      </div>
    </div>
  );
}