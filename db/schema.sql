-- Suka Duka Legian — skema database (Neon Postgres)
-- Jalankan sekali di database baru: `npm run db:setup` (atau tempel di Neon SQL Editor).
-- Aman dijalankan ulang (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS anggota (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_lengkap text NOT NULL,
  alamat       text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pemasukan (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anggota_id    uuid REFERENCES anggota(id),
  kategori      text NOT NULL,
  -- >= 0: data lama berisi entri Rp 0 (mis. anggota dibebaskan). Form baru tetap wajib > 0.
  jumlah        numeric NOT NULL CHECK (jumlah >= 0),
  periode_bulan date,
  tanggal_bayar timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pemasukan_anggota_idx ON pemasukan (anggota_id);
CREATE INDEX IF NOT EXISTS pemasukan_kategori_idx ON pemasukan (kategori);

CREATE TABLE IF NOT EXISTS pengeluaran (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_barang  text NOT NULL,
  tanggal      date,
  vendor       text,
  harga_satuan numeric,
  volume       integer DEFAULT 1,
  total_biaya  numeric NOT NULL CHECK (total_biaya > 0),
  pembeli      text
);
-- Kategori keperluan (lib/config.ts → KATEGORI_PENGELUARAN). Ditambahkan 2026-11;
-- `npm run db:backfill-kategori` mengisi data lama lalu menjadikannya NOT NULL.
ALTER TABLE pengeluaran ADD COLUMN IF NOT EXISTS kategori text;

-- Akun admin (login email + password, hash scrypt)
CREATE TABLE IF NOT EXISTS admin_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Catatan percobaan login, untuk membatasi tebakan password
CREATE TABLE IF NOT EXISTS login_attempts (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email        text NOT NULL,
  success      boolean NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_email_time_idx
  ON login_attempts (email, attempted_at DESC);
