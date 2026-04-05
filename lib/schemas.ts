import { z } from "zod";

export const PemasukanSchema = z.object({
  anggota_id: z.string().uuid("Pilih anggota yang valid"),
  kategori: z.enum([
    "Iuran Bulanan",
    "Sumbangan Awal",
    "Donasi Sukarela",
    "Denda Gotong-Royong",
    "Sumbangan Wajib",
  ]),
  jumlah: z
    .number({ invalid_type_error: "Jumlah harus berupa angka" })
    .positive("Jumlah harus lebih dari 0"),
  periode_bulan: z.string().nullable().optional(),
});

export const PengeluaranSchema = z.object({
  item_barang: z.string().min(1, "Nama item wajib diisi"),
  tanggal: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Tanggal tidak valid" }),
  vendor: z.string().optional(),
  harga_satuan: z
    .number({ invalid_type_error: "Harga satuan harus berupa angka" })
    .positive("Harga satuan harus lebih dari 0"),
  volume: z
    .number({ invalid_type_error: "Volume harus berupa angka" })
    .int()
    .min(1, "Volume minimal 1"),
  total_biaya: z.number().positive(),
  pembeli: z.string().min(1, "Nama pembeli wajib diisi"),
});

export const AnggotaSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
});

export type PemasukanInput = z.infer<typeof PemasukanSchema>;
export type PengeluaranInput = z.infer<typeof PengeluaranSchema>;
export type AnggotaInput = z.infer<typeof AnggotaSchema>;
