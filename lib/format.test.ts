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
