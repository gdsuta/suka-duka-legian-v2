import { KATEGORI_PEMASUKAN, type KategoriPemasukan } from "@/lib/config";
import { bulanIni, kunciBulan } from "@/lib/format";
import type { Anggota, Pemasukan, Pengeluaran } from "@/lib/types";

export interface Ringkasan {
  totalMasuk: number;
  totalKeluar: number;
  saldo: number;
  masukBulanIni: number;
  keluarBulanIni: number;
  bulanIni: string; // YYYY-MM
  jumlahAnggota: number;
  /** Anggota yang sudah membayar Iuran Bulanan untuk bulan ini */
  lunasBulanIni: number;
  perKategori: { kategori: KategoriPemasukan; total: number; jumlahEntri: number }[];
}

export function hitungRingkasan(
  anggota: Anggota[],
  pemasukan: Pemasukan[],
  pengeluaran: Pengeluaran[]
): Ringkasan {
  const bulan = bulanIni();

  let totalMasuk = 0;
  let masukBulanIni = 0;
  const perKategori = new Map<string, { total: number; jumlahEntri: number }>();
  const lunas = new Set<string>();

  for (const p of pemasukan) {
    const jumlah = Number(p.jumlah) || 0;
    totalMasuk += jumlah;
    if (kunciBulan(p.tanggal_bayar) === bulan) masukBulanIni += jumlah;

    const k = perKategori.get(p.kategori) ?? { total: 0, jumlahEntri: 0 };
    k.total += jumlah;
    k.jumlahEntri += 1;
    perKategori.set(p.kategori, k);

    if (p.kategori === "Iuran Bulanan" && p.anggota_id && p.periode_bulan?.startsWith(bulan)) {
      lunas.add(p.anggota_id);
    }
  }

  let totalKeluar = 0;
  let keluarBulanIni = 0;
  for (const k of pengeluaran) {
    const biaya = Number(k.total_biaya) || 0;
    totalKeluar += biaya;
    if (kunciBulan(k.tanggal) === bulan) keluarBulanIni += biaya;
  }

  return {
    totalMasuk,
    totalKeluar,
    saldo: totalMasuk - totalKeluar,
    masukBulanIni,
    keluarBulanIni,
    bulanIni: bulan,
    jumlahAnggota: anggota.length,
    lunasBulanIni: lunas.size,
    perKategori: KATEGORI_PEMASUKAN.map((kategori) => ({
      kategori,
      total: perKategori.get(kategori)?.total ?? 0,
      jumlahEntri: perKategori.get(kategori)?.jumlahEntri ?? 0,
    }))
      .filter((k) => k.total > 0)
      .sort((a, b) => b.total - a.total),
  };
}

/** Pemasukan & pengeluaran per bulan, urut kronologis — untuk grafik */
export function arusKasBulanan(pemasukan: Pemasukan[], pengeluaran: Pengeluaran[]) {
  const map = new Map<string, { pemasukan: number; pengeluaran: number }>();
  const tambah = (key: string | null, field: "pemasukan" | "pengeluaran", n: number) => {
    if (!key) return;
    const row = map.get(key) ?? { pemasukan: 0, pengeluaran: 0 };
    row[field] += n;
    map.set(key, row);
  };

  for (const p of pemasukan) tambah(kunciBulan(p.tanggal_bayar), "pemasukan", Number(p.jumlah) || 0);
  for (const k of pengeluaran) tambah(kunciBulan(k.tanggal), "pengeluaran", Number(k.total_biaya) || 0);

  // Isi bulan tanpa transaksi dengan 0 agar sumbu waktu tidak melompat
  const keys = [...map.keys()].sort();
  if (keys.length > 1) {
    let [y, m] = keys[0].split("-").map(Number);
    const akhir = keys[keys.length - 1];
    for (let key = keys[0]; key < akhir; ) {
      if (!map.has(key)) map.set(key, { pemasukan: 0, pengeluaran: 0 });
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
      key = `${y}-${String(m).padStart(2, "0")}`;
    }
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => {
      const [y, m] = key.split("-").map(Number);
      const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("id-ID", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      });
      return { key, bulan: label, ...v };
    });
}
