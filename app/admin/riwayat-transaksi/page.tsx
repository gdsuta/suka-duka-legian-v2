import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import RiwayatTransaksi from "@/components/RiwayatTransaksi";
import { getPemasukan, getPengeluaran } from "@/lib/queries";

export const metadata: Metadata = { title: "Riwayat Transaksi" };

export default async function RiwayatTransaksiPage() {
  const [pemasukan, pengeluaran] = await Promise.all([getPemasukan(), getPengeluaran()]);
  return (
    <>
      <PageHeader title="Riwayat Transaksi" description="Telusuri, saring, dan hapus catatan pemasukan maupun pengeluaran." />
      <RiwayatTransaksi pemasukan={pemasukan} pengeluaran={pengeluaran} />
    </>
  );
}
