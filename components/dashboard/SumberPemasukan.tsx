import RincianKategori from "@/components/dashboard/RincianKategori";
import { WARNA_KATEGORI } from "@/lib/config";
import type { Ringkasan } from "@/lib/ringkasan";

export default function SumberPemasukan({ r }: { r: Ringkasan }) {
  return (
    <RincianKategori
      title="Sumber Pemasukan"
      description="Porsi tiap kategori dari total kas masuk"
      emptyText="Belum ada pemasukan."
      totalSemua={r.totalMasuk}
      items={r.perKategori.map((k) => ({
        label: k.kategori,
        total: k.total,
        jumlahEntri: k.jumlahEntri,
        warna: WARNA_KATEGORI[k.kategori],
      }))}
    />
  );
}
