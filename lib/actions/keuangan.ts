"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { IdSchema, PemasukanSchema, PengeluaranSchema } from "@/lib/schemas";
import type { ActionResult } from "@/lib/types";

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

  const { item_barang, tanggal, vendor, harga_satuan, volume, pembeli } = parsed.data;
  // Total dihitung di server — jangan percaya angka dari browser
  const total_biaya = harga_satuan * volume;

  try {
    await db()`
      INSERT INTO pengeluaran (item_barang, tanggal, vendor, harga_satuan, volume, total_biaya, pembeli)
      VALUES (${item_barang}, ${tanggal}, ${vendor || null}, ${harga_satuan}, ${volume}, ${total_biaya}, ${pembeli})`;
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
