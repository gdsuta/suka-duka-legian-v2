"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatPeriode, formatRupiah } from "@/lib/format";
import { tanggalBayarWita } from "@/lib/iuran";
import { sqlIuranSekaligus } from "@/lib/iuran-sql";
import { IdSchema, IuranSekaligusSchema, PemasukanSchema, PengeluaranSchema } from "@/lib/schemas";
import type { ActionResult, IuranSekaligusResult } from "@/lib/types";

function segarkan() {
  revalidatePath("/", "layout");
}

function gagal(err: unknown): ActionResult {
  console.error(err);
  const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
  return { ok: false, message: `Gagal menyimpan: ${message}` };
}

export async function catatPemasukan(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = PemasukanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Mohon periksa isian form kembali.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { anggota_id, kategori, jumlah, periode_bulan } = parsed.data;
  try {
    await db()`
      INSERT INTO pemasukan (anggota_id, kategori, jumlah, periode_bulan)
      VALUES (${anggota_id}, ${kategori}, ${jumlah}, ${periode_bulan})`;
  } catch (err) {
    return gagal(err);
  }

  segarkan();
  return { ok: true, message: "Pemasukan berhasil dicatat." };
}

export async function catatPengeluaran(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = PengeluaranSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Mohon periksa isian form kembali.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { kategori, item_barang, tanggal, vendor, harga_satuan, volume, pembeli } = parsed.data;
  // Total dihitung di server — jangan percaya angka dari browser
  const total_biaya = harga_satuan * volume;

  try {
    await db()`
      INSERT INTO pengeluaran (kategori, item_barang, tanggal, vendor, harga_satuan, volume, total_biaya, pembeli)
      VALUES (${kategori}, ${item_barang}, ${tanggal}, ${vendor || null}, ${harga_satuan}, ${volume}, ${total_biaya}, ${pembeli})`;
  } catch (err) {
    return gagal(err);
  }

  segarkan();
  return { ok: true, message: "Pengeluaran berhasil dicatat." };
}

export async function hapusTransaksi(
  tabel: "pemasukan" | "pengeluaran",
  id: string
): Promise<ActionResult> {
  await requireAdmin();
  if (!IdSchema.safeParse(id).success) {
    return { ok: false, message: "ID transaksi tidak valid." };
  }

  try {
    const rows =
      tabel === "pemasukan"
        ? await db()`DELETE FROM pemasukan WHERE id = ${id} RETURNING id`
        : await db()`DELETE FROM pengeluaran WHERE id = ${id} RETURNING id`;
    if (rows.length === 0) {
      return { ok: false, message: "Data tidak ditemukan (mungkin sudah dihapus)." };
    }
  } catch (err) {
    return gagal(err);
  }

  segarkan();
  return { ok: true, message: "Data berhasil dihapus." };
}

export async function catatIuranSekaligus(input: unknown): Promise<IuranSekaligusResult> {
  await requireAdmin();

  const parsed = IuranSekaligusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Mohon periksa isian kembali.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { jumlah, tanggal_diterima, entri } = parsed.data;
  let rows: { bulan: string; nama: string | null; disimpan: boolean }[];
  try {
    rows = (await db().query(sqlIuranSekaligus(), [
      JSON.stringify(entri),
      jumlah,
      tanggalBayarWita(tanggal_diterima),
    ])) as typeof rows;
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
    return { ok: false, message: `Gagal menyimpan: ${message}` };
  }

  const disimpan = rows.filter((r) => r.disimpan).length;
  const dilewati = rows
    .filter((r) => !r.disimpan)
    .map((r) => ({ nama: r.nama ?? "Anggota tidak ditemukan", bulan: formatPeriode(`${r.bulan}-01`) }))
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));

  if (disimpan > 0) segarkan();

  const message =
    disimpan === 0
      ? "Tidak ada yang baru — semua sudah tercatat."
      : `${disimpan} bulan tersimpan · ${formatRupiah(disimpan * jumlah)}`;
  return { ok: true, message, disimpan, dilewati };
}
