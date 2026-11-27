import { describe, expect, test } from "vitest";
import {
  jumlahBayarPerBulan,
  kunciCentang,
  ringkasCentang,
  susunGridIuran,
  tahunIuran,
  tanggalBayarWita,
} from "@/lib/iuran";

const A = { id: "a", nama_lengkap: "Ayu" };
const B = { id: "b", nama_lengkap: "Budi" };

const iuran = (
  anggota_id: string | null,
  periode_bulan: string,
  jumlah = 10000,
  tanggal_bayar = "2026-09-11T02:00:00.000Z",
  kategori = "Iuran Bulanan"
) => ({ anggota_id, kategori, jumlah, periode_bulan, tanggal_bayar });

describe("susunGridIuran", () => {
  test("12 months of the chosen year, all members in input order, only that year's iuran", () => {
    const g = susunGridIuran([A, B], [iuran("a", "2026-10-01"), iuran("a", "2025-10-01")], 2026);
    expect(g.bulan).toEqual([
      "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06",
      "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12",
    ]);
    expect(g.baris.map((b) => b.nama)).toEqual(["Ayu", "Budi"]);
    expect(Object.keys(g.baris[0].tercatat)).toEqual(["2026-10"]);
    expect(g.baris[1].tercatat).toEqual({});
  });

  test("a historical duplicate for one member-month is one recorded cell with amounts summed", () => {
    const g = susunGridIuran(
      [A],
      [iuran("a", "2026-03-01", 10000, "2026-03-30T01:00:00.000Z"), iuran("a", "2026-03-01", 10000, "2026-05-12T01:00:00.000Z")],
      2026
    );
    expect(g.baris[0].tercatat["2026-03"]).toEqual({ jumlah: 20000, tanggalBayar: "2026-05-12T01:00:00.000Z" });
  });

  test("a Rp 0 iuran is still a recorded cell", () => {
    const g = susunGridIuran([A], [iuran("a", "2026-02-01", 0)], 2026);
    expect(g.baris[0].tercatat["2026-02"]?.jumlah).toBe(0);
  });

  test("ignores other categories and unknown members", () => {
    const g = susunGridIuran(
      [A],
      [iuran("a", "2026-04-01", 25000, undefined, "Denda Gotong-Royong"), iuran("zzz", "2026-04-01"), iuran(null, "2026-04-01")],
      2026
    );
    expect(g.baris[0].tercatat).toEqual({});
  });
});

describe("ringkasCentang", () => {
  test("counts months, distinct members and total; repeated keys count once", () => {
    expect(
      ringkasCentang([kunciCentang("a", "2026-10"), kunciCentang("a", "2026-11"), kunciCentang("b", "2026-11"), kunciCentang("b", "2026-11")], 10000)
    ).toEqual({ jumlahBulan: 3, jumlahWarga: 2, total: 30000 });
  });

  test("nothing ticked is all zero", () => {
    expect(ringkasCentang([], 10000)).toEqual({ jumlahBulan: 0, jumlahWarga: 0, total: 0 });
  });
});

describe("jumlahBayarPerBulan", () => {
  test("per month: members already recorded and members ticked now", () => {
    const g = susunGridIuran([A, B], [iuran("a", "2026-10-01")], 2026);
    const r = jumlahBayarPerBulan(g, [kunciCentang("b", "2026-10")]);
    expect(r["2026-10"]).toEqual({ tercatat: 1, dicentang: 1 });
    expect(r["2026-11"]).toEqual({ tercatat: 0, dicentang: 0 });
    expect(Object.keys(r)).toHaveLength(12);
  });
});

test("tanggalBayarWita stores the date received at 12:00 WITA", () => {
  expect(tanggalBayarWita("2026-11-27")).toBe("2026-11-27T04:00:00.000Z");
});

import { pulihkanCentang } from "@/lib/iuran";

describe("pulihkanCentang (restore unsaved ticks after leaving the page)", () => {
  const g = susunGridIuran([A, B], [iuran("a", "2026-10-01")], 2026);
  test("keeps valid ticks", () => {
    expect([...pulihkanCentang(JSON.stringify(["b|2026-10", "a|2026-11"]), g)].sort()).toEqual(["a|2026-11", "b|2026-10"]);
  });
  test("drops ticks that have since been recorded, unknown members and other years", () => {
    expect([...pulihkanCentang(JSON.stringify(["a|2026-10", "zzz|2026-10", "b|2025-10"]), g)]).toEqual([]);
  });
  test("garbage or empty storage gives no ticks", () => {
    expect(pulihkanCentang("{oops", g).size).toBe(0);
    expect(pulihkanCentang(null, g).size).toBe(0);
    expect(pulihkanCentang(JSON.stringify({ a: 1 }), g).size).toBe(0);
  });
});

describe("tahunIuran", () => {
  test("years that have iuran, plus the current year, newest first", () => {
    const p = [iuran("a", "2024-05-01"), iuran("a", "2025-01-01"), iuran("b", "2025-02-01"), iuran("a", "2023-01-01", 5, "x", "Donasi Sukarela")];
    expect(tahunIuran(p, 2026)).toEqual([2026, 2025, 2024]);
    expect(tahunIuran([], 2026)).toEqual([2026]);
  });
});
