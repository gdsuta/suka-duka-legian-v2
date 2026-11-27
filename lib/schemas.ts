import { z } from "zod";
import { KATEGORI_PEMASUKAN, KATEGORI_BERPERIODE, KATEGORI_PENGELUARAN } from "@/lib/config";
import { hariIni } from "@/lib/format";

// Tanggal kalender yang benar-benar ada (Date.parse menerima "2026-02-30", jadi cek bolak-balik)
const tanggalValid = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
  .refine(
    (val) => {
      const [y, m, d] = val.split("-").map(Number);
      const t = new Date(Date.UTC(y, m - 1, d));
      return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
    },
    { message: "Tanggal tidak valid" }
  );

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
  kategori: z.enum(KATEGORI_PENGELUARAN, { errorMap: () => ({ message: "Pilih kategori pengeluaran" }) }),
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

/** Catat Iuran Sekaligus: banyak anggota × bulan dalam satu simpan */
export const IuranSekaligusSchema = z.object({
  jumlah: z
    .number({ invalid_type_error: "Jumlah harus berupa angka", required_error: "Jumlah wajib diisi" })
    .positive("Jumlah harus lebih dari 0")
    .max(1_000_000_000, "Jumlah terlalu besar"),
  // Bandingkan sebagai string YYYY-MM-DD dengan hari ini di WITA (bukan jam server UTC)
  tanggal_diterima: tanggalValid
    .refine((t) => t <= hariIni(), { message: "Tanggal diterima tidak boleh di masa depan" })
    // Cegah salah ketik tahun (mis. 2006) yang akan merusak grafik arus kas publik
    .refine((t) => t >= `${Number(hariIni().slice(0, 4)) - 1}-01-01`, {
      message: "Tanggal diterima terlalu lama (paling awal 1 Januari tahun lalu)",
    }),
  entri: z
    .array(
      z.object({
        anggota_id: z.string().uuid("Anggota tidak valid"),
        bulan: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Bulan tidak valid"),
      })
    )
    .min(1, "Centang minimal satu bulan")
    .max(600, "Terlalu banyak dalam satu kali simpan (maks. 600 bulan)")
    .transform((entri) => {
      const lihat = new Set<string>();
      return entri.filter((e) => {
        const k = `${e.anggota_id}|${e.bulan}`;
        if (lihat.has(k)) return false;
        lihat.add(k);
        return true;
      });
    }),
});

export type PemasukanInput = z.input<typeof PemasukanSchema>;
export type PengeluaranInput = z.infer<typeof PengeluaranSchema>;
export type AnggotaInput = z.infer<typeof AnggotaSchema>;
export type IuranSekaligusInput = z.infer<typeof IuranSekaligusSchema>;
