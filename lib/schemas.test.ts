import { describe, expect, test } from "vitest";
import { PengeluaranSchema } from "@/lib/schemas";

const dasar = {
  item_barang: "Aqua",
  tanggal: "2026-09-06",
  harga_satuan: 55700,
  volume: 1,
  pembeli: "Bendahara",
};

describe("PengeluaranSchema kategori", () => {
  test("accepts a known expense category", () => {
    const r = PengeluaranSchema.safeParse({ ...dasar, kategori: "Konsumsi" });
    expect(r.success).toBe(true);
    expect(r.success && r.data.kategori).toBe("Konsumsi");
  });

  test("rejects a missing category with a clear message", () => {
    const r = PengeluaranSchema.safeParse(dasar);
    expect(r.success).toBe(false);
    expect(r.error?.flatten().fieldErrors.kategori).toEqual(["Pilih kategori pengeluaran"]);
  });

  test("rejects an unknown category with the same message", () => {
    const r = PengeluaranSchema.safeParse({ ...dasar, kategori: "Makan" });
    expect(r.success).toBe(false);
    expect(r.error?.flatten().fieldErrors.kategori).toEqual(["Pilih kategori pengeluaran"]);
  });
});

import { IuranSekaligusSchema } from "@/lib/schemas";
import { hariIni } from "@/lib/format";

const besok = () => {
  const d = new Date(`${hariIni()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};
const ID = "3f2eb1c3-d18e-46c2-97e7-1c81d6fd6ffb";
const ID2 = "60d2a431-cdae-42c8-8da3-4a43dd334a94";
const sah = { jumlah: 10000, tanggal_diterima: "2026-11-20", entri: [{ anggota_id: ID, bulan: "2026-11" }] };
const pesan = (input: unknown, field: string) => {
  const r = IuranSekaligusSchema.safeParse(input);
  return r.success ? undefined : r.error.flatten().fieldErrors[field as "entri"];
};

describe("IuranSekaligusSchema", () => {
  test("accepts a valid batch", () => {
    expect(IuranSekaligusSchema.safeParse(sah).success).toBe(true);
  });
  test("needs at least one ticked month", () => {
    expect(pesan({ ...sah, entri: [] }, "entri")).toEqual(["Centang minimal satu bulan"]);
  });
  test("rejects more than 600 months in one batch", () => {
    const entri = Array.from({ length: 601 }, (_, i) => ({ anggota_id: ID, bulan: `2026-${String((i % 12) + 1).padStart(2, "0")}` }));
    expect(IuranSekaligusSchema.safeParse({ ...sah, entri }).success).toBe(false);
  });
  test("rejects an invalid month", () => {
    expect(IuranSekaligusSchema.safeParse({ ...sah, entri: [{ anggota_id: ID, bulan: "2026-13" }] }).success).toBe(false);
  });
  test("amount must be above 0", () => {
    expect(pesan({ ...sah, jumlah: 0 }, "jumlah")).toEqual(["Jumlah harus lebih dari 0"]);
  });
  test("date received cannot be tomorrow (WITA)", () => {
    expect(pesan({ ...sah, tanggal_diterima: besok() }, "tanggal_diterima")).toEqual([
      "Tanggal diterima tidak boleh di masa depan",
    ]);
  });
  test("date received today (WITA) is accepted", () => {
    expect(IuranSekaligusSchema.safeParse({ ...sah, tanggal_diterima: hariIni() }).success).toBe(true);
  });
  test("repeated member-months in the input are kept once", () => {
    const r = IuranSekaligusSchema.parse({
      ...sah,
      entri: [{ anggota_id: ID, bulan: "2026-11" }, { anggota_id: ID, bulan: "2026-11" }, { anggota_id: ID2, bulan: "2026-11" }],
    });
    expect(r.entri).toHaveLength(2);
  });
});
