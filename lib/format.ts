const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Rp 1.250.000 */
export function formatRupiah(n: number | null | undefined): string {
  // Intl memakai spasi tak-putus; ganti dengan spasi biasa agar konsisten di PDF.
  return rupiahFormatter.format(Number(n) || 0).replace(/ /g, " ");
}

/** Rp 1,2 jt · Rp 450 rb — untuk sumbu grafik dan ruang sempit */
export function formatRupiahSingkat(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `Rp ${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  if (abs >= 1_000) return `Rp ${Math.round(n / 1_000)} rb`;
  return `Rp ${n}`;
}

/** 25rb · 1,25jt — untuk sel tabel yang sempit (grid denda) */
export function formatRupiahRingkas(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })}jt`;
  }
  if (abs >= 1_000) {
    return `${(n / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}rb`;
  }
  return formatRupiah(n);
}

const TANGGAL_SAJA =/^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Kolom `date` ("YYYY-MM-DD") tidak punya jam/zona — tampilkan apa adanya (UTC)
 * agar tidak bergeser sehari. Timestamp lengkap ditampilkan dalam WITA.
 */
function parseDate(value: string | null | undefined): { d: Date; timeZone: string } | null {
  if (!value) return null;
  const m = TANGGAL_SAJA.exec(value);
  const d = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : new Date(value);
  if (isNaN(d.getTime())) return null;
  return { d, timeZone: m ? "UTC" : "Asia/Makassar" };
}

/** 9 Feb 2026 */
export function formatTanggal(value: string | null | undefined): string {
  const parsed = parseDate(value);
  if (!parsed) return "—";
  return parsed.d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: parsed.timeZone,
  });
}

/** Februari 2026 — untuk kolom periode_bulan */
export function formatPeriode(value: string | null | undefined): string {
  const parsed = parseDate(value);
  if (!parsed) return "—";
  return parsed.d.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: parsed.timeZone,
  });
}

/** "2026-03" — kunci bulan untuk pengelompokan grafik, dalam WITA */
export function kunciBulan(value: string | null | undefined): string | null {
  const parsed = parseDate(value);
  if (!parsed) return null;
  return parsed.d
    .toLocaleDateString("en-CA", { timeZone: parsed.timeZone })
    .slice(0, 7);
}

/** Tanggal hari ini (WITA) dalam format YYYY-MM-DD, untuk default input date */
export function hariIni(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" });
}

/** Bulan ini (WITA) dalam format YYYY-MM, untuk default input month */
export function bulanIni(): string {
  return hariIni().slice(0, 7);
}
