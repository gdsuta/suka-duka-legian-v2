import type { KategoriPemasukan } from "@/lib/config";

export interface Anggota {
  id: string;
  nama_lengkap: string;
  alamat: string | null;
  created_at: string; // ISO 8601 (UTC)
}

export interface Pemasukan {
  id: string;
  anggota_id: string | null;
  kategori: KategoriPemasukan | string;
  jumlah: number;
  periode_bulan: string | null; // YYYY-MM-DD
  tanggal_bayar: string; // ISO 8601 (UTC)
}

export interface PemasukanDenganNama extends Pemasukan {
  nama_anggota: string | null;
}

export interface Pengeluaran {
  id: string;
  item_barang: string;
  tanggal: string | null; // YYYY-MM-DD
  vendor: string | null;
  harga_satuan: number | null;
  volume: number | null;
  total_biaya: number;
  pembeli: string | null;
}

/** Hasil standar Server Action untuk form. */
export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };
