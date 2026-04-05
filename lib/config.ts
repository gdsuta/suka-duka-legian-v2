// Ubah nilai ini di satu tempat jika batas anggota berubah
export const JUMLAH_ANGGOTA_MAKSIMAL = 40;

export const KATEGORI_PEMASUKAN = [
  "Iuran Bulanan",
  "Sumbangan Awal",
  "Donasi Sukarela",
  "Denda Gotong-Royong",
  "Sumbangan Wajib",
] as const;

export type KategoriPemasukan = (typeof KATEGORI_PEMASUKAN)[number];
