"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { countPemasukanAnggota } from "@/lib/queries";
import { AnggotaSchema, IdSchema } from "@/lib/schemas";
import type { ActionResult } from "@/lib/types";

function segarkan() {
  revalidatePath("/", "layout");
}

function invalid(error: import("zod").ZodError): ActionResult {
  return {
    ok: false,
    message: "Mohon periksa isian form kembali.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

export async function tambahAnggota(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = AnggotaSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { nama_lengkap, alamat } = parsed.data;
  try {
    await db()`INSERT INTO anggota (nama_lengkap, alamat) VALUES (${nama_lengkap}, ${alamat})`;
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Gagal menyimpan anggota." };
  }

  segarkan();
  return { ok: true, message: `${nama_lengkap} berhasil ditambahkan.` };
}

export async function ubahAnggota(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!IdSchema.safeParse(id).success) return { ok: false, message: "ID anggota tidak valid." };
  const parsed = AnggotaSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { nama_lengkap, alamat } = parsed.data;
  try {
    const rows = await db()`
      UPDATE anggota SET nama_lengkap = ${nama_lengkap}, alamat = ${alamat}
      WHERE id = ${id} RETURNING id`;
    if (rows.length === 0) return { ok: false, message: "Anggota tidak ditemukan." };
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Gagal memperbarui data anggota." };
  }

  segarkan();
  return { ok: true, message: "Data anggota berhasil diperbarui." };
}

/** Jumlah riwayat pembayaran — dipakai untuk peringatan sebelum menghapus. */
export async function hitungRiwayatAnggota(id: string): Promise<number> {
  await requireAdmin();
  if (!IdSchema.safeParse(id).success) return 0;
  return countPemasukanAnggota(id);
}

/** Menghapus anggota beserta seluruh riwayat pembayarannya (satu transaksi). */
export async function hapusAnggota(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!IdSchema.safeParse(id).success) return { ok: false, message: "ID anggota tidak valid." };

  const sql = db();
  try {
    const [, deleted] = await sql.transaction([
      sql`DELETE FROM pemasukan WHERE anggota_id = ${id}`,
      sql`DELETE FROM anggota WHERE id = ${id} RETURNING nama_lengkap`,
    ]);
    if (deleted.length === 0) return { ok: false, message: "Anggota tidak ditemukan." };
    segarkan();
    return { ok: true, message: `${deleted[0].nama_lengkap} berhasil dihapus.` };
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Gagal menghapus anggota." };
  }
}
