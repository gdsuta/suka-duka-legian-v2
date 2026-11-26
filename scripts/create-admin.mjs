// Membuat (atau mengganti password) akun admin.
// Pakai: npm run admin:create -- email@contoh.com "password-minimal-10-karakter"
import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL belum di-set. Isi di .env.local terlebih dahulu.");
  process.exit(1);
}

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Pakai: npm run admin:create -- email@contoh.com "password"');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password minimal 10 karakter.");
  process.exit(1);
}

// Format harus sama dengan lib/password.ts
const N = 16384, r = 8, p = 1, keyLen = 64;
const salt = randomBytes(16);
const hash = scryptSync(password, salt, keyLen, { N, r, p });
const passwordHash = `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${hash.toString("base64")}`;

const sql = neon(url);
const [row] = await sql.query(
  `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
   RETURNING email, (xmax = 0) AS created`,
  [email.trim().toLowerCase(), passwordHash]
);

console.log(row.created ? `Admin dibuat: ${row.email}` : `Password diperbarui: ${row.email}`);
