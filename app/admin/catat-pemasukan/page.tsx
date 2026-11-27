import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ModeCatat from "@/components/ui/ModeCatat";
import FormPemasukan from "@/components/forms/FormPemasukan";
import { getAnggota, getPemasukan } from "@/lib/queries";
import type { KategoriPemasukan } from "@/lib/config";

export const metadata: Metadata = { title: "Catat Pemasukan" };

export default async function CatatPemasukanPage() {
  const [anggota, pemasukan] = await Promise.all([getAnggota(), getPemasukan()]);

  // 3 nominal paling sering per kategori
  const hitung = new Map<string, Map<number, number>>();
  for (const p of pemasukan) {
    if (p.jumlah <= 0) continue;
    const m = hitung.get(p.kategori) ?? new Map<number, number>();
    m.set(p.jumlah, (m.get(p.jumlah) ?? 0) + 1);
    hitung.set(p.kategori, m);
  }
  const nominalUmum: Partial<Record<KategoriPemasukan, number[]>> = {};
  for (const [kategori, m] of hitung) {
    nominalUmum[kategori as KategoriPemasukan] = [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([n]) => n)
      .sort((a, b) => a - b);
  }

  const iuranTercatat = pemasukan
    .filter((p) => p.kategori === "Iuran Bulanan" && p.anggota_id && p.periode_bulan)
    .map((p) => `${p.anggota_id}|${p.periode_bulan!.slice(0, 7)}`);

  // Tanggal kerja bakti yang sudah tercatat — pintasan agar denda susulan masuk ke tanggal yang sama
  const tanggalKerjaBakti = [
    ...new Set(
      pemasukan
        .filter((p) => p.kategori === "Denda Gotong-Royong" && p.periode_bulan)
        .map((p) => p.periode_bulan!.slice(0, 10))
    ),
  ]
    .sort()
    .reverse()
    .slice(0, 4);

  return (
    <>
      <PageHeader title="Catat Pemasukan" description="Iuran, sumbangan, donasi, atau denda dari anggota." />
      <ModeCatat aktif="satu" />
      <FormPemasukan
        anggota={anggota.map(({ id, nama_lengkap }) => ({ id, nama_lengkap }))}
        nominalUmum={nominalUmum}
        iuranTercatat={iuranTercatat}
        tanggalKerjaBakti={tanggalKerjaBakti}
      />
    </>
  );
}
