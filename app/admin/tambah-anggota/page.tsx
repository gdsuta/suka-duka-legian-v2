import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import FormAnggota from "@/components/forms/FormAnggota";
import { getAnggota } from "@/lib/queries";

export const metadata: Metadata = { title: "Tambah Anggota" };

export default async function TambahAnggotaPage() {
  const anggota = await getAnggota();
  return (
    <>
      <PageHeader
        title="Tambah Anggota"
        description="Daftarkan warga baru ke Suka Duka Legian."
        backHref="/admin/kelola-anggota"
        backLabel="Kelola Anggota"
      />
      <FormAnggota jumlahAnggota={anggota.length} />
    </>
  );
}
