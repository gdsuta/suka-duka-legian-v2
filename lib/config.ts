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

// Kategori pengeluaran — dipilih saat mencatat; dipakai untuk ringkasan "ke mana uang dipakai"
export const KATEGORI_PENGELUARAN = [
  "Penerangan Jalan",
  "Kebersihan Lingkungan",
  "Fasilitas Umum",
  "Konsumsi",
  "Acara & Perayaan",
  "Sosial & Duka",
  "Administrasi & Lainnya",
] as const;

export type KategoriPengeluaran = (typeof KATEGORI_PENGELUARAN)[number];

/** Label untuk pengeluaran yang belum punya kategori */
export const TANPA_KATEGORI = "Belum dikategorikan";

export const WARNA_KATEGORI_PENGELUARAN: Record<KategoriPengeluaran | typeof TANPA_KATEGORI, string> = {
  "Penerangan Jalan": "bg-gold",
  "Kebersihan Lingkungan": "bg-brand",
  "Fasilitas Umum": "bg-sky",
  Konsumsi: "bg-violet",
  "Acara & Perayaan": "bg-expense",
  "Sosial & Duka": "bg-ink-muted",
  "Administrasi & Lainnya": "bg-ink-faint",
  [TANPA_KATEGORI]: "bg-border-strong",
};
