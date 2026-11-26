import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import FormPengeluaran from "@/components/forms/FormPengeluaran";
import { getPengeluaran } from "@/lib/queries";

export const metadata: Metadata = { title: "Catat Pengeluaran" };

export default async function CatatPengeluaranPage() {
  const pengeluaran = await getPengeluaran();
  const saranPembeli = [...new Set(pengeluaran.map((p) => p.pembeli).filter(Boolean) as string[])].sort();

  return (
    <>
      <PageHeader title="Catat Pengeluaran" description="Belanja barang atau biaya kegiatan komunitas." />
      <FormPengeluaran saranPembeli={saranPembeli} />
    </>
  );
}
