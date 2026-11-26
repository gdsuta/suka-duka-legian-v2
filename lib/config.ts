// Ubah nilai ini di satu tempat jika batas anggota berubah
export const JUMLAH_ANGGOTA_MAKSIMAL = 50;

export const KATEGORI_PEMASUKAN = [
  "Iuran Bulanan",
  "Sumbangan Awal",
  "Donasi Sukarela",
  "Denda Gotong-Royong",
  "Sumbangan Wajib",
] as const;

export type KategoriPemasukan = (typeof KATEGORI_PEMASUKAN)[number];

// Kategori yang wajib mengisi periode_bulan:
// - Iuran Bulanan: bulan iuran (disimpan sebagai tanggal 1 bulan tersebut)
// - Denda Gotong-Royong: tanggal kegiatan gotong-royong
export const KATEGORI_BERPERIODE = ["Iuran Bulanan", "Denda Gotong-Royong"] as const;

// Warna & urutan tampilan tiap kategori di dashboard (kelas token Tailwind)
export const WARNA_KATEGORI: Record<KategoriPemasukan, string> = {
  "Iuran Bulanan": "bg-brand",
  "Sumbangan Wajib": "bg-gold",
  "Sumbangan Awal": "bg-sky",
  "Denda Gotong-Royong": "bg-expense",
  "Donasi Sukarela": "bg-violet",
};
