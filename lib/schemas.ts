import { z } from "zod";
import { KATEGORI_PEMASUKAN, KATEGORI_BERPERIODE } from "@/lib/config";

const tanggalValid = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
  .refine((val) => !isNaN(Date.parse(val)), { message: "Tanggal tidak valid" });

const uang = (label: string) =>
  z
    .number({ invalid_type_error: `${label} harus berupa angka`, required_error: `${label} wajib diisi` })
    .positive(`${label} harus lebih dari 0`)
    .max(1_000_000_000, `${label} terlalu besar`);

export const PemasukanSchema = z
  .object({
    anggota_id: z.string().uuid("Pilih anggota yang valid"),
    kategori: z.enum(KATEGORI_PEMASUKAN),
    jumlah: uang("Jumlah"),
    periode_bulan: tanggalValid.nullable().optional(),
  })
  .superRefine((val, ctx) => {
    const butuhPeriode = (KATEGORI_BERPERIODE as readonly string[]).includes(val.kategori);
    if (butuhPeriode && !val.periode_bulan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["periode_bulan"],
        message:
          val.kategori === "Iuran Bulanan"
            ? "Pilih bulan iuran"
            : "Pilih tanggal gotong-royong",
      });
    }
  })
  .transform((val) => ({
    ...val,
    periode_bulan: (KATEGORI_BERPERIODE as readonly string[]).includes(val.kategori)
      ? val.periode_bulan ?? null
      : null,
  }));

export const PengeluaranSchema = z.object({
  item_barang: z.string().trim().min(1, "Nama item wajib diisi").max(200),
  tanggal: tanggalValid,
  vendor: z.string().trim().max(200).optional(),
  harga_satuan: uang("Harga satuan"),
  volume: z
    .number({ invalid_type_error: "Volume harus berupa angka" })
    .int("Volume harus bilangan bulat")
    .min(1, "Volume minimal 1"),
  pembeli: z.string().trim().min(1, "Nama pembeli wajib diisi").max(200),
});

export const AnggotaSchema = z.object({
  nama_lengkap: z.string().trim().min(1, "Nama lengkap wajib diisi").max(200),
  alamat: z.string().trim().min(1, "Alamat wajib diisi").max(500),
});

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").max(200),
});

export const IdSchema = z.string().uuid();

export type PemasukanInput = z.input<typeof PemasukanSchema>;
export type PengeluaranInput = z.infer<typeof PengeluaranSchema>;
export type AnggotaInput = z.infer<typeof AnggotaSchema>;
