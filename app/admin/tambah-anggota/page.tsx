"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AnggotaSchema } from "@/lib/schemas";
import { toast } from "sonner";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Field, { inputClass } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { ArrowLeftIcon } from "@/components/ui/icons";

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
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <Card className="max-w-xl mx-auto p-5 sm:p-6">
        <h1 className="font-heading text-xl sm:text-2xl font-semibold text-ink mb-1">
          Tambah Anggota Baru
        </h1>
        <p className="text-sm text-ink-muted mb-6">
          Semua field yang ditandai * wajib diisi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama Lengkap" htmlFor="nama" required error={fieldErrors.nama_lengkap?.[0]}>
            <input
              id="nama"
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className={inputClass}
              placeholder="Contoh: I Wayan Suka"
            />
          </Field>

          <Field label="Alamat Lengkap" htmlFor="alamat" required error={fieldErrors.alamat?.[0]}>
            <textarea
              id="alamat"
              required
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className={inputClass}
              placeholder="Contoh: Jl. Legian No. 10"
              rows={3}
            />
          </Field>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : "Simpan Anggota"}
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
