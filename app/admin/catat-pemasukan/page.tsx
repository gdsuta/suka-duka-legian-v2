"use client";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PemasukanSchema } from "@/lib/schemas";
import { KATEGORI_PEMASUKAN } from "@/lib/config";
import { toast } from "sonner";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Field, { inputClass } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { ArrowLeftIcon } from "@/components/ui/icons";

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
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <Card className="max-w-xl mx-auto p-5 sm:p-6">
        <h1 className="font-heading text-xl sm:text-2xl font-semibold text-ink mb-1">
          Catat Pemasukan Kas
        </h1>
        <p className="text-sm text-ink-muted mb-6">
          Semua field yang ditandai * wajib diisi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama Anggota" htmlFor="anggota_id" required error={fieldErrors.anggota_id?.[0]}>
            <select
              id="anggota_id"
              required
              value={anggotaId}
              onChange={(e) => setAnggotaId(e.target.value)}
              className={inputClass}
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
          </Field>

          <Field label="Kategori Pemasukan" htmlFor="kategori" required>
            <select
              id="kategori"
              required
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className={inputClass}
            >
              {KATEGORI_PEMASUKAN.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Jumlah (Rp)" htmlFor="jumlah" required error={fieldErrors.jumlah?.[0]}>
            <input
              id="jumlah"
              type="number"
              required
              min="1"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              className={inputClass}
              placeholder="Contoh: 50000"
            />
          </Field>

          {showPeriode && (
            <Field
              label="Untuk Periode Bulan"
              htmlFor="periode"
              required
              hint="Pilih tanggal 1 pada bulan iuran tersebut."
            >
              <input
                id="periode"
                type="date"
                required
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className={inputClass}
              />
            </Field>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : "Simpan Pemasukan"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand transition-colors">
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
