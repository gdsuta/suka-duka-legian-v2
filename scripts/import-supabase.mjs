// Mengimpor salinan data Supabase (db/backup/*.json) ke database Neon.
// Pakai: npm run db:import   (butuh DATABASE_URL di .env.local)
//
// Aman dijalankan ulang: baris dengan id yang sudah ada dilewati.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL belum di-set. Isi di .env.local terlebih dahulu.");
  process.exit(1);
}

const sql = neon(url);
const load = (name) =>
  JSON.parse(
    readFileSync(new URL(`../db/backup/${name}.json`, import.meta.url), "utf8")
  );

const anggota = load("anggota");
const pemasukan = load("pemasukan");
const pengeluaran = load("pengeluaran");

// Timestamp Supabase tidak punya zona waktu dan disimpan dalam UTC.
const asUtc = (ts) => (ts && !/[zZ]|[+-]\d\d:?\d\d$/.test(ts) ? `${ts}Z` : ts);
for (const a of anggota) a.created_at = asUtc(a.created_at);
for (const p of pemasukan) p.tanggal_bayar = asUtc(p.tanggal_bayar);

// Satu transaksi: semua tabel masuk, atau tidak sama sekali.
const results = await sql.transaction([
  sql.query(
    `INSERT INTO anggota (id, nama_lengkap, alamat, created_at)
     SELECT id, nama_lengkap, alamat, COALESCE(created_at, now())
     FROM json_populate_recordset(NULL::anggota, $1::json)
     ON CONFLICT (id) DO NOTHING
     RETURNING id`,
    [JSON.stringify(anggota)]
  ),
  sql.query(
    `INSERT INTO pemasukan (id, anggota_id, kategori, jumlah, periode_bulan, tanggal_bayar)
     SELECT id, anggota_id, kategori, jumlah, periode_bulan, COALESCE(tanggal_bayar, now())
     FROM json_populate_recordset(NULL::pemasukan, $1::json)
     ON CONFLICT (id) DO NOTHING
     RETURNING id`,
    [JSON.stringify(pemasukan)]
  ),
  sql.query(
    `INSERT INTO pengeluaran (id, item_barang, tanggal, vendor, harga_satuan, volume, total_biaya, pembeli)
     SELECT id, item_barang, tanggal, vendor, harga_satuan, volume, total_biaya, pembeli
     FROM json_populate_recordset(NULL::pengeluaran, $1::json)
     ON CONFLICT (id) DO NOTHING
     RETURNING id`,
    [JSON.stringify(pengeluaran)]
  ),
]);

const [ia, ip, ik] = results.map((r) => r.length);
console.log(`Anggota:     ${ia} baru dari ${anggota.length} di backup`);
console.log(`Pemasukan:   ${ip} baru dari ${pemasukan.length} di backup`);
console.log(`Pengeluaran: ${ik} baru dari ${pengeluaran.length} di backup`);

// Verifikasi total di database cocok dengan backup
const [totals] = await sql.query(`
  SELECT
    (SELECT count(*)::int FROM anggota) AS anggota,
    (SELECT count(*)::int FROM pemasukan) AS pemasukan,
    (SELECT count(*)::int FROM pengeluaran) AS pengeluaran,
    (SELECT COALESCE(sum(jumlah), 0)::float8 FROM pemasukan) AS total_masuk,
    (SELECT COALESCE(sum(total_biaya), 0)::float8 FROM pengeluaran) AS total_keluar
`);
const sum = (rows, key) => rows.reduce((s, r) => s + Number(r[key]), 0);
console.log("\nIsi database sekarang:", totals);
console.log("Total di backup:", {
  total_masuk: sum(pemasukan, "jumlah"),
  total_keluar: sum(pengeluaran, "total_biaya"),
});
