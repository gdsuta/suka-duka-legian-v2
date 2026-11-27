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
