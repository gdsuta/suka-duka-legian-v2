import "server-only";
import { db } from "@/lib/db";
import type {
  Anggota,
  Pemasukan,
  PemasukanDenganNama,
  Pengeluaran,
} from "@/lib/types";

// Kolom dikonversi di SQL agar hasilnya tipe JS sederhana (string/number),
// bukan Date/string-numeric, dan aman dikirim ke Client Components.
const ISO = `'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'`;

export async function getAnggota(): Promise<Anggota[]> {
  return (await db().query(
    `SELECT id, nama_lengkap, alamat,
            to_char(created_at AT TIME ZONE 'UTC', ${ISO}) AS created_at
     FROM anggota
     ORDER BY nama_lengkap ASC`
  )) as Anggota[];
}

export async function getPemasukan(): Promise<PemasukanDenganNama[]> {
  return (await db().query(
    `SELECT p.id, p.anggota_id, p.kategori,
            p.jumlah::float8 AS jumlah,
            to_char(p.periode_bulan, 'YYYY-MM-DD') AS periode_bulan,
            to_char(p.tanggal_bayar AT TIME ZONE 'UTC', ${ISO}) AS tanggal_bayar,
            a.nama_lengkap AS nama_anggota
     FROM pemasukan p
     LEFT JOIN anggota a ON a.id = p.anggota_id
     ORDER BY p.tanggal_bayar DESC`
  )) as PemasukanDenganNama[];
}

export async function getPengeluaran(): Promise<Pengeluaran[]> {
  return (await db().query(
    `SELECT id, item_barang,
            to_char(tanggal, 'YYYY-MM-DD') AS tanggal,
            vendor,
            harga_satuan::float8 AS harga_satuan,
            volume,
            total_biaya::float8 AS total_biaya,
            pembeli,
            kategori
     FROM pengeluaran
     ORDER BY tanggal DESC NULLS LAST, item_barang ASC`
  )) as Pengeluaran[];
}

export async function countPemasukanAnggota(anggotaId: string): Promise<number> {
  const rows = await db()`SELECT count(*)::int AS n FROM pemasukan WHERE anggota_id = ${anggotaId}`;
  return rows[0]?.n ?? 0;
}

export type { Anggota, Pemasukan, Pengeluaran };
