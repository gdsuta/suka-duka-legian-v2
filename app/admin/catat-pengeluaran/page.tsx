"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PengeluaranSchema } from "@/lib/schemas";
import { toast } from "sonner";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Field, { inputClass } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { ArrowLeftIcon } from "@/components/ui/icons";

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
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <Card className="max-w-xl mx-auto p-5 sm:p-6">
        <h1 className="font-heading text-xl sm:text-2xl font-semibold text-ink mb-1">
          Catat Pengeluaran Kas
        </h1>
        <p className="text-sm text-ink-muted mb-6">
          Semua field yang ditandai * wajib diisi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama Item / Keperluan" htmlFor="item_barang" required error={fieldErrors.item_barang?.[0]}>
            <input
              id="item_barang"
              type="text"
              required
              value={itemBarang}
              onChange={(e) => setItemBarang(e.target.value)}
              className={inputClass}
              placeholder="Contoh: Beli Lampu Jalan"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tanggal Beli" htmlFor="tanggal" required error={fieldErrors.tanggal?.[0]}>
              <input
                id="tanggal"
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Toko / Vendor" htmlFor="vendor">
              <input
                id="vendor"
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className={inputClass}
                placeholder="Contoh: Toko Bangunan Jaya"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Harga Satuan (Rp)" htmlFor="harga_satuan" required error={fieldErrors.harga_satuan?.[0]}>
              <input
                id="harga_satuan"
                type="number"
                required
                min="1"
                value={hargaSatuan}
                onChange={(e) => setHargaSatuan(e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </Field>
            <Field label="Volume / Jumlah" htmlFor="volume" required>
              <input
                id="volume"
                type="number"
                required
                min="1"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="bg-expense-soft p-4 rounded-md border border-expense/20">
            <p className="text-sm text-expense font-semibold">
              Total Biaya: Rp {totalBiaya.toLocaleString("id-ID")}
            </p>
          </div>

          <Field label="Nama Pembeli / Penanggung Jawab" htmlFor="pembeli" required error={fieldErrors.pembeli?.[0]}>
            <input
              id="pembeli"
              type="text"
              required
              value={pembeli}
              onChange={(e) => setPembeli(e.target.value)}
              className={inputClass}
              placeholder="Contoh: Pak RT"
            />
          </Field>

          <Button type="submit" variant="danger" disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
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
