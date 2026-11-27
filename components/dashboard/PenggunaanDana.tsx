import RincianKategori from "@/components/dashboard/RincianKategori";
import { WARNA_KATEGORI_PENGELUARAN } from "@/lib/config";
import type { Ringkasan } from "@/lib/ringkasan";

/** "Ke mana uang dipakai" — pengeluaran per keperluan */
export default function PenggunaanDana({ r }: { r: Ringkasan }) {
  return (
    <RincianKategori
      title="Ke Mana Uang Dipakai"
      description="Pengeluaran per keperluan dari total kas keluar"
      emptyText="Belum ada pengeluaran."
      totalSemua={r.totalKeluar}
      items={r.perKategoriPengeluaran.map((k) => ({
        label: k.kategori,
        total: k.total,
        jumlahEntri: k.jumlahEntri,
        warna: WARNA_KATEGORI_PENGELUARAN[k.kategori],
      }))}
    />
  );
}
