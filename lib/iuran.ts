import type { Pemasukan } from "@/lib/types";

/** Iuran yang sudah tercatat untuk satu anggota di satu bulan */
export interface CatatanIuran {
  /** Dijumlahkan bila ada catatan ganda (data lama) */
  jumlah: number;
  /** Timestamp ISO pencatatan terbaru */
  tanggalBayar: string;
}

export interface BarisIuran {
  anggotaId: string;
  nama: string;
  /** Kunci = "YYYY-MM" */
  tercatat: Record<string, CatatanIuran>;
}

export interface GridIuran {
  /** 12 bulan tahun terpilih: "YYYY-01" … "YYYY-12" */
  bulan: string[];
  baris: BarisIuran[];
}

const KATEGORI_IURAN = "Iuran Bulanan";

/** Tabel anggota × bulan, seperti buku catatan bendahara. */
export function susunGridIuran(
  anggota: { id: string; nama_lengkap: string }[],
  pemasukan: Pick<Pemasukan, "anggota_id" | "kategori" | "jumlah" | "periode_bulan" | "tanggal_bayar">[],
  tahun: number
): GridIuran {
  const bulan = Array.from({ length: 12 }, (_, i) => `${tahun}-${String(i + 1).padStart(2, "0")}`);
  const baris: BarisIuran[] = anggota.map((a) => ({ anggotaId: a.id, nama: a.nama_lengkap, tercatat: {} }));
  const barisById = new Map(baris.map((b) => [b.anggotaId, b]));
  const awalan = `${tahun}-`;

  for (const p of pemasukan) {
    if (p.kategori !== KATEGORI_IURAN || !p.periode_bulan || !p.periode_bulan.startsWith(awalan)) continue;
    const b = p.anggota_id ? barisById.get(p.anggota_id) : undefined;
    if (!b) continue;
    const kunci = p.periode_bulan.slice(0, 7);
    const ada = b.tercatat[kunci];
    if (ada) {
      ada.jumlah += Number(p.jumlah) || 0;
      if (p.tanggal_bayar > ada.tanggalBayar) ada.tanggalBayar = p.tanggal_bayar;
    } else {
      b.tercatat[kunci] = { jumlah: Number(p.jumlah) || 0, tanggalBayar: p.tanggal_bayar };
    }
  }

  return { bulan, baris };
}

/** Kunci sel yang dicentang: "anggotaId|YYYY-MM" */
export const kunciCentang = (anggotaId: string, bulan: string) => `${anggotaId}|${bulan}`;

const pecahKunci = (kunci: string) => {
  const i = kunci.lastIndexOf("|");
  return { anggotaId: kunci.slice(0, i), bulan: kunci.slice(i + 1) };
};

/** Ringkasan untuk bilah bawah: jumlah bulan baru, jumlah warga, dan total uang. */
export function ringkasCentang(centang: Iterable<string>, jumlahPerBulan: number) {
  const unik = new Set(centang);
  const warga = new Set([...unik].map((k) => pecahKunci(k).anggotaId));
  return { jumlahBulan: unik.size, jumlahWarga: warga.size, total: unik.size * jumlahPerBulan };
}

/** Per bulan: berapa anggota sudah tercatat membayar, dan berapa yang baru dicentang. */
export function jumlahBayarPerBulan(grid: GridIuran, centang: Iterable<string>) {
  const hasil: Record<string, { tercatat: number; dicentang: number }> = {};
  for (const b of grid.bulan) hasil[b] = { tercatat: 0, dicentang: 0 };
  for (const baris of grid.baris) {
    for (const b of Object.keys(baris.tercatat)) if (hasil[b]) hasil[b].tercatat += 1;
  }
  for (const k of new Set(centang)) {
    const { bulan } = pecahKunci(k);
    if (hasil[bulan]) hasil[bulan].dicentang += 1;
  }
  return hasil;
}

/** Tanggal diterima (YYYY-MM-DD) → timestamp pukul 12:00 WITA (UTC+8). */
export function tanggalBayarWita(tanggal: string): string {
  return `${tanggal}T04:00:00.000Z`;
}
