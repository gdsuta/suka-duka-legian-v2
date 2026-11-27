import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ModeCatat from "@/components/ui/ModeCatat";
import GridIuran from "@/components/forms/GridIuran";
import { bulanIni } from "@/lib/format";
import { susunGridIuran } from "@/lib/iuran";
import { getAnggota, getPemasukan } from "@/lib/queries";

export const metadata: Metadata = { title: "Catat Iuran Sekaligus" };

export default async function CatatIuranPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const tahunIni = Number(bulanIni().slice(0, 4));
  const pilihanTahun = [tahunIni - 1, tahunIni, tahunIni + 1];
  const diminta = Number((await searchParams).tahun);
  const tahun = pilihanTahun.includes(diminta) ? diminta : tahunIni;

  const [anggota, pemasukan] = await Promise.all([getAnggota(), getPemasukan()]);
  const grid = susunGridIuran(anggota, pemasukan, tahun);

  return (
    <>
      <PageHeader
        title="Catat Iuran Sekaligus"
        description="Salin halaman buku catatan: centang bulan yang sudah dibayar, cek total, lalu simpan sekaligus."
      />
      <ModeCatat aktif="sekaligus" />
      <GridIuran key={tahun} grid={grid} tahun={tahun} pilihanTahun={pilihanTahun} />
    </>
  );
}
