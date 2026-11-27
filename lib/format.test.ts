import { expect, test } from "vitest";
import { formatRupiahRingkas } from "@/lib/format";

test("formatRupiahRingkas shortens amounts for narrow cells", () => {
  expect(formatRupiahRingkas(25000)).toBe("25rb");
  expect(formatRupiahRingkas(50000)).toBe("50rb");
  expect(formatRupiahRingkas(1250000)).toBe("1,25jt");
  expect(formatRupiahRingkas(2000000)).toBe("2jt");
  expect(formatRupiahRingkas(0)).toBe("Rp 0");
  expect(formatRupiahRingkas(500)).toBe("Rp 500");
});

test("formatRupiahRingkas never rounds: falls back to the full amount when the short form is not exact", () => {
  expect(formatRupiahRingkas(1237500)).toBe("Rp 1.237.500");
  expect(formatRupiahRingkas(1175000)).toBe("Rp 1.175.000");
  expect(formatRupiahRingkas(237550)).toBe("Rp 237.550");
  expect(formatRupiahRingkas(999950)).toBe("Rp 999.950");
  expect(formatRupiahRingkas(37500)).toBe("37,5rb");
});
