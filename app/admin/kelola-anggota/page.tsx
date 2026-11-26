import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import KelolaAnggota, { type BarisAnggota } from "@/components/KelolaAnggota";
import { getAnggota, getPemasukan } from "@/lib/queries";
import { JUMLAH_ANGGOTA_MAKSIMAL } from "@/lib/config";

export const metadata: Metadata = { title: "Kelola Anggota" };

export default async function KelolaAnggotaPage() {
  const [anggota, pemasukan] = await Promise.all([getAnggota(), getPemasukan()]);

  const stat = new Map<string, { n: number; total: number }>();
  for (const p of pemasukan) {
    if (!p.anggota_id) continue;
    const s = stat.get(p.anggota_id) ?? { n: 0, total: 0 };
    s.n += 1;
    s.total += p.jumlah;
    stat.set(p.anggota_id, s);
  }

  const rows: BarisAnggota[] = anggota.map((a) => ({
    id: a.id,
    nama_lengkap: a.nama_lengkap,
    alamat: a.alamat,
    jumlahTransaksi: stat.get(a.id)?.n ?? 0,
    totalBayar: stat.get(a.id)?.total ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Kelola Anggota"
        description={`${anggota.length} dari ${JUMLAH_ANGGOTA_MAKSIMAL} kuota anggota terdaftar.`}
        action={
          <Button href="/admin/tambah-anggota">
            <UserPlus aria-hidden />
            Tambah Anggota
          </Button>
        }
      />
      <KelolaAnggota anggota={rows} />
    </>
  );
}
