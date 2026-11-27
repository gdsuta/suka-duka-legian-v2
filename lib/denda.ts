import type { Pemasukan } from "@/lib/types";

/** Pembayaran denda satu anggota untuk satu kerja bakti */
export interface SelDenda {
  jumlah: number;
  /** Timestamp ISO tiap pembayaran, terlama dulu */
  tanggalBayar: string[];
}

export interface KolomDenda {
  /** Tanggal kerja bakti, YYYY-MM-DD */
  tanggal: string;
  /** Jumlah anggota terdaftar yang tercatat membayar */
  jumlahPembayar: number;
  /** Total uang denda untuk tanggal ini (termasuk pembayaran tanpa anggota terdaftar) */
  total: number;
}

export interface BarisDenda {
  anggotaId: string;
  nama: string;
  /** Kunci = KolomDenda.tanggal */
  sel: Record<string, SelDenda>;
}

export interface GridDenda {
  kolom: KolomDenda[];
  baris: BarisDenda[];
}

const KATEGORI_DENDA = "Denda Gotong-Royong";

/**
 * Susun tabel anggota × tanggal kerja bakti dari pembayaran denda.
 * Dikelompokkan menurut tanggal kerja bakti (`periode_bulan`), bukan tanggal bayar,
 * karena denda boleh dibayar belakangan.
 */
export function susunGridDenda(
  anggota: { id: string; nama_lengkap: string }[],
  pemasukan: Pick<Pemasukan, "anggota_id" | "kategori" | "jumlah" | "periode_bulan" | "tanggal_bayar">[],
  opsi: { kolomTerakhir?: number } = {}
): GridDenda {
  const baris: BarisDenda[] = anggota.map((a) => ({ anggotaId: a.id, nama: a.nama_lengkap, sel: {} }));
  const barisById = new Map(baris.map((b) => [b.anggotaId, b]));
  const total = new Map<string, number>();

  for (const p of pemasukan) {
    if (p.kategori !== KATEGORI_DENDA || !p.periode_bulan) continue;
    const tanggal = p.periode_bulan.slice(0, 10);
    const jumlah = Number(p.jumlah) || 0;
    total.set(tanggal, (total.get(tanggal) ?? 0) + jumlah);

    const b = p.anggota_id ? barisById.get(p.anggota_id) : undefined;
    if (!b) continue;
    const sel = (b.sel[tanggal] ??= { jumlah: 0, tanggalBayar: [] });
    sel.jumlah += jumlah;
    sel.tanggalBayar.push(p.tanggal_bayar);
  }

  for (const b of baris) {
    for (const sel of Object.values(b.sel)) sel.tanggalBayar.sort();
  }

  let tanggalUrut = [...total.keys()].sort();
  if (opsi.kolomTerakhir !== undefined) tanggalUrut = tanggalUrut.slice(-opsi.kolomTerakhir);

  const kolom = tanggalUrut.map((tanggal) => ({
    tanggal,
    jumlahPembayar: baris.filter((b) => b.sel[tanggal]).length,
    total: total.get(tanggal) ?? 0,
  }));

  if (opsi.kolomTerakhir !== undefined) {
    const tampil = new Set(tanggalUrut);
    for (const b of baris) {
      for (const t of Object.keys(b.sel)) if (!tampil.has(t)) delete b.sel[t];
    }
  }

  return { kolom, baris };
}
