import { describe, expect, test } from "vitest";
import { ringkasPengeluaranPerKategori } from "@/lib/ringkasan";

describe("ringkasPengeluaranPerKategori", () => {
  test("groups by category and sorts by total, largest first", () => {
    const r = ringkasPengeluaranPerKategori([
      { kategori: "Konsumsi", total_biaya: 10000 },
      { kategori: "Penerangan Jalan", total_biaya: 50000 },
      { kategori: "Konsumsi", total_biaya: 5000 },
    ]);
    expect(r).toEqual([
      { kategori: "Penerangan Jalan", total: 50000, jumlahEntri: 1 },
      { kategori: "Konsumsi", total: 15000, jumlahEntri: 2 },
    ]);
  });

  test("expenses without a category go to 'Belum dikategorikan' and totals still reconcile", () => {
    const rows = [
      { kategori: null, total_biaya: 7000 },
      { kategori: "Konsumsi" as const, total_biaya: 3000 },
    ];
    const r = ringkasPengeluaranPerKategori(rows);
    expect(r).toContainEqual({ kategori: "Belum dikategorikan", total: 7000, jumlahEntri: 1 });
    expect(r.reduce((s, k) => s + k.total, 0)).toBe(10000);
  });

  test("no expenses gives an empty list", () => {
    expect(ringkasPengeluaranPerKategori([])).toEqual([]);
  });
});
