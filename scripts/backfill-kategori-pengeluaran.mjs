// Isi kategori untuk pengeluaran lama dari db/kategori-pengeluaran-awal.json.
//   npm run db:backfill-kategori            → uji coba, tidak mengubah apa pun
//   npm run db:backfill-kategori -- --apply → simpan, lalu jadikan kolom NOT NULL bila semua sudah terisi
// Hanya mengisi baris yang kategorinya masih kosong; kategori yang sudah ada tidak ditimpa.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const KATEGORI = [
  "Penerangan Jalan",
  "Kebersihan Lingkungan",
  "Fasilitas Umum",
  "Konsumsi",
  "Acara & Perayaan",
  "Sosial & Duka",
  "Administrasi & Lainnya",
];

const apply = process.argv.includes("--apply");
const peta = JSON.parse(readFileSync(new URL("../db/kategori-pengeluaran-awal.json", import.meta.url), "utf8"));

const salah = peta.filter((p) => !KATEGORI.includes(p.kategori));
if (salah.length) {
  console.error("Kategori tidak dikenal di file peta:", salah.map((p) => `${p.item}: ${p.kategori}`));
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const rupiah = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");

const rows = await sql`SELECT id::text, item_barang, kategori, total_biaya::float8 AS total_biaya FROM pengeluaran`;
const kategoriPeta = new Map(peta.map((p) => [p.id, p.kategori]));

const rencana = rows.filter((r) => r.kategori === null && kategoriPeta.has(r.id));
const tanpaPeta = rows.filter((r) => r.kategori === null && !kategoriPeta.has(r.id));
const sudahAda = rows.filter((r) => r.kategori !== null);

// Total per kategori setelah perubahan
const total = new Map();
for (const r of rows) {
  const k = r.kategori ?? kategoriPeta.get(r.id) ?? "Belum dikategorikan";
  const t = total.get(k) ?? { n: 0, sum: 0 };
  t.n += 1;
  t.sum += r.total_biaya;
  total.set(k, t);
}

console.log(apply ? "MODE: SIMPAN" : "MODE: UJI COBA (tidak ada yang diubah)");
console.log(`Pengeluaran di database: ${rows.length} · akan diisi: ${rencana.length} · sudah berkategori: ${sudahAda.length}`);
if (tanpaPeta.length) {
  console.log(`Belum berkategori & tidak ada di peta (${tanpaPeta.length}):`);
  for (const r of tanpaPeta) console.log(`  - ${r.item_barang} (${rupiah(r.total_biaya)})`);
}
console.log("\nTotal per kategori setelah perubahan:");
for (const [k, t] of [...total].sort((a, b) => b[1].sum - a[1].sum)) {
  console.log(`  ${k.padEnd(24)} ${String(t.n).padStart(3)} entri  ${rupiah(t.sum).padStart(14)}`);
}
console.log(`  ${"TOTAL".padEnd(24)} ${String(rows.length).padStart(3)} entri  ${rupiah(rows.reduce((s, r) => s + r.total_biaya, 0)).padStart(14)}`);

if (!apply) process.exit(0);

if (rencana.length) {
  const hasil = await sql.transaction(
    rencana.map((r) => sql`UPDATE pengeluaran SET kategori = ${kategoriPeta.get(r.id)} WHERE id = ${r.id} AND kategori IS NULL RETURNING id`)
  );
  console.log(`\n${hasil.reduce((s, h) => s + h.length, 0)} diperbarui.`);
}

const [{ kosong }] = await sql`SELECT count(*)::int AS kosong FROM pengeluaran WHERE kategori IS NULL`;
if (kosong === 0) {
  await sql`ALTER TABLE pengeluaran ALTER COLUMN kategori SET NOT NULL`;
  console.log("Semua pengeluaran berkategori — kolom kategori kini NOT NULL.");
} else {
  console.log(`${kosong} pengeluaran masih tanpa kategori — NOT NULL belum dipasang. Tambahkan ke file peta lalu jalankan lagi.`);
}
