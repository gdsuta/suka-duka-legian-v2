"use client";
import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AnggotaSchema } from "@/lib/schemas";
import { toast } from "sonner";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { ArrowLeftIcon, PencilIcon, TrashIcon, WarningIcon } from "@/components/ui/icons";

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
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-semibold text-ink">Kelola Anggota</h1>
            <p className="text-sm text-ink-muted mt-1">
              Edit atau hapus anggota yang keluar dari komunitas.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-brand transition-colors self-start sm:self-auto"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Stats bar */}
        <Card className="p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div>
            <p className="text-xs text-ink-muted font-medium">Total Anggota</p>
            <p className="text-2xl font-semibold text-ink">
              {anggotaList.length}
            </p>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari nama atau alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={inputClass}
              aria-label="Cari anggota"
            />
          </div>
        </Card>

        {/* Data */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-4 sm:p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-surface-alt rounded animate-pulse"
                />
              ))}
            </div>
          ) : filteredAnggota.length === 0 ? (
            <div className="p-10 text-center text-ink-faint">
              {searchQuery
                ? `Tidak ada anggota yang cocok dengan "${searchQuery}".`
                : "Belum ada data anggota."}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="w-full text-sm hidden sm:table">
                <thead className="bg-surface-alt border-b border-border">
                  <tr>
                    <th className="p-4 text-left font-semibold text-ink-muted w-8">No</th>
                    <th className="p-4 text-left font-semibold text-ink-muted">Nama Lengkap</th>
                    <th className="p-4 text-left font-semibold text-ink-muted">Alamat</th>
                    <th className="p-4 text-center font-semibold text-ink-muted w-40">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnggota.map((anggota, index) => (
                    <tr
                      key={anggota.id}
                      className={`border-b border-border transition-colors ${
                        editingId === anggota.id ? "bg-brand-soft" : "hover:bg-surface-alt/60"
                      }`}
                    >
                      <td className="p-4 text-ink-faint">{index + 1}</td>

                      {editingId === anggota.id ? (
                        <>
                          <td className="p-3">
                            <input
                              type="text"
                              value={editNama}
                              onChange={(e) => setEditNama(e.target.value)}
                              className={`${inputClass} min-h-9 py-1.5`}
                              placeholder="Nama lengkap"
                              autoFocus
                              aria-label="Nama lengkap"
                            />
                            {fieldErrors.nama_lengkap && (
                              <p className="text-expense text-xs mt-1">{fieldErrors.nama_lengkap[0]}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={editAlamat}
                              onChange={(e) => setEditAlamat(e.target.value)}
                              className={`${inputClass} min-h-9 py-1.5`}
                              placeholder="Alamat"
                              aria-label="Alamat"
                            />
                            {fieldErrors.alamat && (
                              <p className="text-expense text-xs mt-1">{fieldErrors.alamat[0]}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2 justify-center">
                              <Button size="sm" onClick={() => saveEdit(anggota.id)} disabled={saving}>
                                {saving ? "..." : "Simpan"}
                              </Button>
                              <Button size="sm" variant="secondary" onClick={cancelEdit}>
                                Batal
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 font-medium text-ink">{anggota.nama_lengkap}</td>
                          <td className="p-4 text-ink-muted">
                            {anggota.alamat || <span className="italic text-ink-faint">Tidak ada</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => startEdit(anggota)}
                                aria-label={`Edit ${anggota.nama_lengkap}`}
                                className="inline-flex items-center gap-1 bg-gold-soft text-gold px-3 py-1.5 rounded text-xs font-semibold hover:bg-gold-soft/70 transition-colors"
                              >
                                <PencilIcon className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(anggota)}
                                aria-label={`Hapus ${anggota.nama_lengkap}`}
                                className="inline-flex items-center gap-1 bg-expense-soft text-expense px-3 py-1.5 rounded text-xs font-semibold hover:bg-expense-soft/70 transition-colors"
                              >
                                <TrashIcon className="h-3.5 w-3.5" /> Hapus
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card list */}
              <ul className="sm:hidden divide-y divide-border">
                {filteredAnggota.map((anggota) => (
                  <li
                    key={anggota.id}
                    className={`p-4 ${editingId === anggota.id ? "bg-brand-soft" : ""}`}
                  >
                    {editingId === anggota.id ? (
                      <div className="space-y-2.5">
                        <div>
                          <input
                            type="text"
                            value={editNama}
                            onChange={(e) => setEditNama(e.target.value)}
                            className={inputClass}
                            placeholder="Nama lengkap"
                            autoFocus
                            aria-label="Nama lengkap"
                          />
                          {fieldErrors.nama_lengkap && (
                            <p className="text-expense text-xs mt-1">{fieldErrors.nama_lengkap[0]}</p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            value={editAlamat}
                            onChange={(e) => setEditAlamat(e.target.value)}
                            className={inputClass}
                            placeholder="Alamat"
                            aria-label="Alamat"
                          />
                          {fieldErrors.alamat && (
                            <p className="text-expense text-xs mt-1">{fieldErrors.alamat[0]}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(anggota.id)} disabled={saving} className="flex-1">
                            {saving ? "..." : "Simpan"}
                          </Button>
                          <Button size="sm" variant="secondary" onClick={cancelEdit} className="flex-1">
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{anggota.nama_lengkap}</p>
                          <p className="text-sm text-ink-muted mt-0.5">
                            {anggota.alamat || <span className="italic text-ink-faint">Tidak ada alamat</span>}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => startEdit(anggota)}
                            aria-label={`Edit ${anggota.nama_lengkap}`}
                            className="p-2.5 rounded-md bg-gold-soft text-gold"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(anggota)}
                            aria-label={`Hapus ${anggota.nama_lengkap}`}
                            className="p-2.5 rounded-md bg-expense-soft text-expense"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        {/* Info note */}
        <p className="flex items-center justify-center gap-1.5 text-xs text-ink-faint mt-4 text-center">
          <WarningIcon className="h-3.5 w-3.5 shrink-0" />
          Menghapus anggota yang memiliki riwayat pembayaran akan menghapus
          seluruh data transaksinya secara permanen.
        </p>
      </div>
    </div>
  );
}
