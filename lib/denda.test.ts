import { describe, expect, test } from "vitest";
import { susunGridDenda } from "@/lib/denda";

const A = { id: "a", nama_lengkap: "Ayu" };
const B = { id: "b", nama_lengkap: "Budi" };

const denda = (
  anggota_id: string | null,
  periode_bulan: string | null,
  jumlah = 25000,
  tanggal_bayar = "2026-09-11T02:00:00.000Z"
) => ({ anggota_id, kategori: "Denda Gotong-Royong", jumlah, periode_bulan, tanggal_bayar });

describe("susunGridDenda", () => {
  test("columns are kerja bakti dates oldest first; rows are all members in input order", () => {
    const g = susunGridDenda([A, B], [denda("b", "2026-08-16"), denda("a", "2026-05-03")]);
    expect(g.kolom.map((k) => k.tanggal)).toEqual(["2026-05-03", "2026-08-16"]);
    expect(g.baris.map((b) => b.nama)).toEqual(["Ayu", "Budi"]);
    expect(g.baris[0].sel["2026-05-03"]?.jumlah).toBe(25000);
    expect(g.baris[0].sel["2026-08-16"]).toBeUndefined();
  });

  test("ignores other categories and fines without a kerja bakti date", () => {
    const g = susunGridDenda(
      [A],
      [{ ...denda("a", "2026-05-01"), kategori: "Iuran Bulanan" }, denda("a", null)]
    );
    expect(g.kolom).toEqual([]);
    expect(g.baris[0].sel).toEqual({});
  });

  test("sums two payments by one member for the same date and keeps both payment dates oldest first", () => {
    const g = susunGridDenda(
      [A],
      [
        denda("a", "2026-06-14", 25000, "2026-09-12T01:00:00.000Z"),
        denda("a", "2026-06-14", 25000, "2026-07-24T01:00:00.000Z"),
      ]
    );
    expect(g.baris[0].sel["2026-06-14"]).toEqual({
      jumlah: 50000,
      tanggalBayar: ["2026-07-24T01:00:00.000Z", "2026-09-12T01:00:00.000Z"],
    });
    expect(g.kolom[0]).toEqual({ tanggal: "2026-06-14", jumlahPembayar: 1, total: 50000 });
  });

  test("a payment without a known member counts in the column total but adds no row", () => {
    const g = susunGridDenda(
      [A, B],
      [denda(null, "2026-05-03"), denda("zzz", "2026-05-03"), denda("a", "2026-05-03")]
    );
    expect(g.baris).toHaveLength(2);
    expect(g.kolom[0]).toEqual({ tanggal: "2026-05-03", jumlahPembayar: 1, total: 75000 });
  });

  test("a legacy Rp 0 fine is still a filled cell", () => {
    const g = susunGridDenda([A], [denda("a", "2026-03-01", 0)]);
    expect(g.baris[0].sel["2026-03-01"]).toEqual({ jumlah: 0, tanggalBayar: ["2026-09-11T02:00:00.000Z"] });
    expect(g.kolom[0].jumlahPembayar).toBe(1);
  });

  test("kolomTerakhir keeps only the most recent N dates", () => {
    const tanggal = ["2026-03-01", "2026-03-10", "2026-05-03", "2026-05-10", "2026-06-14", "2026-07-12", "2026-08-16", "2026-09-06"];
    const g = susunGridDenda([A], tanggal.map((t) => denda("a", t)), { kolomTerakhir: 6 });
    expect(g.kolom.map((k) => k.tanggal)).toEqual(tanggal.slice(2));
  });

  test("a periode_bulan with a time part is grouped by its date", () => {
    const g = susunGridDenda([A], [denda("a", "2026-05-03T00:00:00")]);
    expect(g.kolom.map((k) => k.tanggal)).toEqual(["2026-05-03"]);
  });
});
