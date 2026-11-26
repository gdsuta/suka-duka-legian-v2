// Membuat tabel di database Neon dari db/schema.sql.
// Pakai: npm run db:setup   (butuh DATABASE_URL di .env.local)
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL belum di-set. Isi di .env.local terlebih dahulu.");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

// Driver HTTP Neon menjalankan satu statement per query.
const statements = schema
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Skema siap (${statements.length} statement dijalankan).`);
