# Fines Grid + Expense Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Members can see per kerja bakti date whether their fine payment is recorded, and see spending summarised by purpose.

**Architecture:** Pure, unit-tested functions in `lib/` (`lib/denda.ts`, additions to `lib/ringkasan.ts` and `lib/format.ts`) turn existing rows into a fines grid and per-category spending totals; UI (dashboard tabs/cards, PDF, forms) only renders them. Expense categories are a new nullable column `pengeluaran.kategori`, backfilled from a committed id→category map, then made NOT NULL.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Neon (`@neondatabase/serverless`), Zod 3, jsPDF + autotable, sonner; Vitest (new, dev only) for unit tests.

**Spec:** `docs/superpowers/specs/2026-11-27-denda-grid-and-expense-categories-design.md`

## Global Constraints

- Follow `CLAUDE.md`: colours only via tokens in `app/globals.css` (raw RGB only inside jsPDF); money via `formatRupiah` + `num`; icons from `lucide-react` with `aria-hidden`; touch targets ≥ 44px; sonner, never `alert/confirm`; every mutating Server Action starts with `await requireAdmin()`.
- Category list, exact strings and order: `Penerangan Jalan`, `Kebersihan Lingkungan`, `Fasilitas Umum`, `Konsumsi`, `Acara & Perayaan`, `Sosial & Duka`, `Administrasi & Lainnya`.
- Label for expenses without a category: `Belum dikategorikan`.
- Existing fine records are shown as recorded; no fine data is modified.
- Fines are grouped by `periode_bulan` (kerja bakti date), never by `tanggal_bayar`.
- PDF fines grid shows the 6 most recent kerja bakti dates.
- Backfill changes live data: run `--apply` only after the user says yes in chat.
- The column must exist in Neon before any code that selects `kategori` is pushed (Vercel deploys on push to `main`).
- Commits are local; push to `main` only at the end of Task 7 after the user confirms.

## Review Focus

1. A fine payment whose member was deleted / `anggota_id` is null → no row for it, but it still counts in that date's column total (totals must reconcile with money in). Test in Task 1.
2. Two fine payments by one member for the same date (e.g. paid in two parts) → one cell, amounts summed, both payment dates kept. Test in Task 1.
3. A legacy Rp 0 fine row → still a filled cell (it was recorded), shown as "Rp 0", not as empty/unpaid. Test in Task 1.
4. An expense recorded after `db:setup` but before backfill (kategori null) → appears under "Belum dikategorikan"; category totals still sum to total pengeluaran; backfill never overwrites an existing category. Tests in Task 6 and dry-run check in Task 7.
5. Deploy ordering → dashboard must not crash because the column is missing; verified by running `db:setup` in Task 4 and checking the column before the push in Task 7.

---

### Task 1: Fines grid model + test harness

**Files:**
- Modify: `package.json` (devDependency `vitest`, script `"test": "vitest run"`)
- Create: `vitest.config.ts` (alias `@` → project root, environment `node`)
- Create: `lib/denda.ts`
- Modify: `lib/format.ts` (add `formatRupiahRingkas`)
- Test: `lib/denda.test.ts`, `lib/format.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // lib/denda.ts
  export interface SelDenda { jumlah: number; tanggalBayar: string[] } // ISO timestamps, oldest first
  export interface KolomDenda { tanggal: string; jumlahPembayar: number; total: number } // tanggal = YYYY-MM-DD
  export interface BarisDenda { anggotaId: string; nama: string; sel: Record<string, SelDenda> } // key = KolomDenda.tanggal
  export interface GridDenda { kolom: KolomDenda[]; baris: BarisDenda[] }
  export function susunGridDenda(
    anggota: { id: string; nama_lengkap: string }[],
    pemasukan: Pick<Pemasukan, "anggota_id" | "kategori" | "jumlah" | "periode_bulan" | "tanggal_bayar">[],
    opsi?: { kolomTerakhir?: number }
  ): GridDenda
  // lib/format.ts
  export function formatRupiahRingkas(n: number): string // 25000 → "25rb", 1250000 → "1,25jt", 0 → "Rp 0"
  ```

- [ ] **Step 1: Install Vitest and add config** — `npm i -D vitest`; `vitest.config.ts` with `resolve.alias: { "@": fileURLToPath(new URL(".", import.meta.url)) }`; `"test": "vitest run"`. Run `npm test` → "No test files found" (exit code ≠ 0 is fine here).

- [ ] **Step 2: Write failing tests** in `lib/denda.test.ts`:

```ts
const A = { id: "a", nama_lengkap: "Ayu" }, B = { id: "b", nama_lengkap: "Budi" };
const d = (anggota_id: string | null, periode_bulan: string, jumlah = 25000, tanggal_bayar = "2026-09-11T02:00:00.000Z") =>
  ({ anggota_id, kategori: "Denda Gotong-Royong", jumlah, periode_bulan, tanggal_bayar });

test("columns are kerja bakti dates, oldest first, rows are all members in input order", () => {
  const g = susunGridDenda([A, B], [d("b", "2026-08-16"), d("a", "2026-05-03")]);
  expect(g.kolom.map((k) => k.tanggal)).toEqual(["2026-05-03", "2026-08-16"]);
  expect(g.baris.map((b) => b.nama)).toEqual(["Ayu", "Budi"]);
  expect(g.baris[0].sel["2026-08-16"]).toBeUndefined();
});
test("ignores other categories and rows without periode_bulan", () => { /* Iuran row + Denda with null periode → kolom = [] */ });
test("sums two payments for the same member and date, keeps both payment dates oldest first", () => {
  // d("a","2026-06-14",25000,"2026-09-12T…") + d("a","2026-06-14",25000,"2026-07-24T…")
  // → sel.jumlah 50000, tanggalBayar ["2026-07-24T…","2026-09-12T…"]; kolom[0].jumlahPembayar 1, total 50000
});
test("payment without a known member counts in the column total but adds no row", () => {
  // d(null,"2026-05-03") + d("zzz","2026-05-03") + d("a","2026-05-03") → baris.length 2, kolom[0].total 75000, jumlahPembayar 1
});
test("Rp 0 legacy fine is a filled cell", () => { /* jumlah 0 → sel defined with jumlah 0 */ });
test("kolomTerakhir keeps only the most recent N dates", () => { /* 8 dates, {kolomTerakhir: 6} → the last 6, ascending */ });
```

and in `lib/format.test.ts`: `formatRupiahRingkas(25000) === "25rb"`, `(50000) === "50rb"`, `(1250000) === "1,25jt"`, `(0) === "Rp 0"`, `(500) === "Rp 500"`.

- [ ] **Step 3: Run** `npm test` → FAIL (`susunGridDenda` / `formatRupiahRingkas` not exported).

- [ ] **Step 4: Implement** `susunGridDenda` (filter `kategori === "Denda Gotong-Royong"` and non-null `periode_bulan`, key = `periode_bulan.slice(0, 10)`; `jumlahPembayar` counts distinct known members with a cell) and `formatRupiahRingkas` (≥1 jt: up to 2 decimals, `id-ID` comma, suffix `jt`; ≥1 rb: suffix `rb`; else `formatRupiah`). `lib/denda.ts` imports only types.

- [ ] **Step 5: Run** `npm test` → all PASS; `npm run typecheck` → no errors.

- [ ] **Step 6: Commit** — `git add package.json package-lock.json vitest.config.ts lib/denda.ts lib/denda.test.ts lib/format.ts lib/format.test.ts && git commit -m "Add fines grid model and Vitest"`

### Task 2: Fines grid on the dashboard

**Files:**
- Create: `components/GridDenda.tsx` (client)
- Modify: `components/DataTabs.tsx` (tab `denda` renders `GridDenda`; label `Denda Kerja Bakti`)

**Interfaces:**
- Consumes: `susunGridDenda`, `GridDenda`, `formatRupiahRingkas` (Task 1)
- Produces: `export default function GridDenda({ grid, query }: { grid: GridDenda; query: string })`

- [ ] **Step 1: Build `GridDenda`.** Table: sticky first column `Nama Warga` (`sticky left-0 bg-surface`), one column per `kolom` with header `formatTanggal(k.tanggal)`, horizontal scroll on narrow screens (`overflow-x-auto`), rows filtered by `query` on `nama` (case-insensitive). Paid cell = a `<button>` (min 44×44) showing `formatRupiahRingkas(sel.jumlah)` in `text-income`; `aria-label` = `"{nama}, kerja bakti {formatTanggal(tanggal)}: {formatRupiah(jumlah)}, dibayar {dates}"`; same text as `title` for mouse hover; on click `toast(nama, { description: "Kerja bakti {tgl} · {formatRupiah} · dibayar {formatTanggal of each tanggalBayar, joined ', '}" })`. Empty cell: `<span aria-label="belum ada pembayaran">` with an em dash in `text-ink-faint`. `<tfoot>` row per column: `{jumlahPembayar} orang` and `formatRupiah(total)`. Empty grid → existing `EmptyState` with "Belum ada denda tercatat.". A one-line legend above: "Angka = denda yang sudah dibayar untuk kerja bakti tanggal tersebut. Ketuk untuk melihat tanggal bayar."

- [ ] **Step 2: Wire into `DataTabs`.** Keep the tab in the tablist (badge count = number of fine payments); when `tab.key === "denda"`, render the search box and `<GridDenda grid={useMemo(() => susunGridDenda(anggota, pemasukan), …)} query={deferredQuery} />` in place of the table/list and the "Tampilkan lebih banyak" button. Search placeholder stays "Cari nama…".

- [ ] **Step 3: Verify.** `npm run typecheck` clean; `npm run dev`, open `/`, tab "Denda Kerja Bakti": 8 date columns (1 Mar 2026 … 6 Sep 2026), footer for 16 Agu shows `9 orang` and `Rp 225.000`; at 390 px width the name column stays visible while dates scroll; tapping a cell shows the toast with payment date(s).

- [ ] **Step 4: Commit** — `git commit -am "Show fines as a members × kerja bakti grid on the dashboard"` (add the new file first).

### Task 3: Fines grid in the PDF + kerja bakti date chips in the income form

**Files:**
- Modify: `components/TombolEkspor.tsx` (`pdfDetail`)
- Modify: `app/admin/catat-pemasukan/page.tsx`, `components/forms/FormPemasukan.tsx`

**Interfaces:**
- Consumes: `susunGridDenda(anggota, pemasukan, { kolomTerakhir: 6 })`, `formatRupiahRingkas`
- Produces: `FormPemasukan` prop `tanggalKerjaBakti: string[]` (YYYY-MM-DD, newest first, max 4)

- [ ] **Step 1: PDF.** In `pdfDetail`, drop the `Denda` column from the existing table (header becomes `No, Nama Warga, Iuran {bulan}, Sumbangan Wajib, Donasi Sukarela`). After it, add heading "Denda Kerja Bakti (6 kegiatan terakhir)" and an autoTable: head `No, Nama Warga, …formatTanggal(each kolom)`, body cells `formatRupiahRingkas(sel.jumlah)` or `-`, foot `["", "Jumlah bayar", …"{n} org · {formatRupiahRingkas(total)}"]`; JADE text for paid cells; let autoTable page-break (`startY` = previous `finalY + 12`, or new page if `> 170` on landscape). If `kolom` is empty, print "Belum ada denda tercatat." instead.

- [ ] **Step 2: Date chips.** Page computes `tanggalKerjaBakti` = distinct `periode_bulan` of `Denda Gotong-Royong` rows, sorted desc, first 4. In the form's Denda branch, below the date input: "Kerja bakti sebelumnya:" + chip buttons (`h-8`, same style as the "Sering dipakai" amount chips, wrapped in a 44px-tall hit area) labelled `formatTanggal(t)`; click sets `tanggalDenda`; selected chip highlighted. Change the field hint to "Tanggal kerja bakti yang tidak dihadiri — pilih tanggal yang sama untuk pembayaran susulan."

- [ ] **Step 3: Verify.** `npm run typecheck`; generate the member PDF from the admin panel: no Denda column in the first table; second table has the 6 latest of the 8 dates — 3 Mei, 10 Mei, 14 Jun, 12 Jul, 16 Agu, 6 Sep — and a footer row. In `/admin/catat-pemasukan` choose "Denda Gotong-Royong": 4 chips (6 Sep, 16 Agu, 12 Jul, 14 Jun), clicking one fills the date.

- [ ] **Step 4: Commit** — `git commit -am "Add fines grid to member PDF and kerja bakti date shortcuts"`

### Task 4: Expense category data layer

**Files:**
- Modify: `lib/config.ts`, `db/schema.sql`, `lib/types.ts`, `lib/queries.ts` (`getPengeluaran`), `lib/schemas.ts`, `lib/actions/keuangan.ts` (`catatPengeluaran`)
- Test: `lib/schemas.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // lib/config.ts
  export const KATEGORI_PENGELUARAN = [/* the 7 strings, Global Constraints order */] as const;
  export type KategoriPengeluaran = (typeof KATEGORI_PENGELUARAN)[number];
  export const TANPA_KATEGORI = "Belum dikategorikan";
  export const WARNA_KATEGORI_PENGELUARAN: Record<KategoriPengeluaran | typeof TANPA_KATEGORI, string>;
  // Penerangan Jalan bg-gold · Kebersihan Lingkungan bg-brand · Fasilitas Umum bg-sky · Konsumsi bg-violet ·
  // Acara & Perayaan bg-expense · Sosial & Duka bg-ink-muted · Administrasi & Lainnya bg-ink-faint · Belum dikategorikan bg-border-strong
  // lib/types.ts — Pengeluaran gains: kategori: KategoriPengeluaran | null
  // lib/schemas.ts — PengeluaranSchema gains: kategori: z.enum(KATEGORI_PENGELUARAN, { errorMap: () => ({ message: "Pilih kategori pengeluaran" }) })
  ```

- [ ] **Step 1: Failing tests** in `lib/schemas.test.ts`: a valid expense with `kategori: "Konsumsi"` parses; without `kategori` → error on path `kategori` with message `Pilih kategori pengeluaran`; with `kategori: "Makan"` → same error.
- [ ] **Step 2: Run** `npm test` → FAIL.
- [ ] **Step 3: Implement** config, Zod field, type, `getPengeluaran` selects `kategori`, `catatPengeluaran` inserts `kategori`. In `db/schema.sql` after the `pengeluaran` table: `ALTER TABLE pengeluaran ADD COLUMN IF NOT EXISTS kategori text;` with a comment that the backfill script sets NOT NULL.
- [ ] **Step 4: Run** `npm test` → PASS; `npm run typecheck` → errors only in `FormPengeluaran.tsx` (missing `kategori`), fixed in Task 5.
- [ ] **Step 5: Add the column in Neon** — `npm run db:setup` (additive, nullable; the live site keeps working). Verify: `node --env-file=.env.local --input-type=module -e "import {neon} from '@neondatabase/serverless'; const s=neon(process.env.DATABASE_URL); console.log(await s\`SELECT count(*)::int n FROM information_schema.columns WHERE table_name='pengeluaran' AND column_name='kategori'\`)"` → `[ { n: 1 } ]`.
- [ ] **Step 6: Commit** — `git commit -am "Add expense category column, config and validation"` (add the test file).

### Task 5: Category in the expense form, tables and history

**Files:**
- Modify: `components/ui/ChipGroup.tsx` (allow empty selection: `value: T | ""`)
- Modify: `components/forms/FormPengeluaran.tsx`, `components/DataTabs.tsx` (pengeluaran tab), `components/RiwayatTransaksi.tsx`, `components/ui/Badge.tsx`

**Interfaces:**
- Consumes: `KATEGORI_PENGELUARAN`, `TANPA_KATEGORI` (Task 4)
- Produces: `TONE_KATEGORI_PENGELUARAN: Record<string, Tone>` in `Badge.tsx` (same mapping as Task 4 colours; Sosial & Duka, Administrasi & Lainnya, Belum dikategorikan → `neutral`)

- [ ] **Step 1: Form.** First field: `ChipGroup` legend "Kategori", required, no preselection (`""`), error from `fieldErrors.kategori`; sent as `kategori` to `catatPengeluaran`. After a successful save keep the chosen category (same shopping trip), like the income form does.
- [ ] **Step 2: Lists.** DataTabs pengeluaran tab: add column `Kategori` rendering `<Badge>` (`kategori ?? TANPA_KATEGORI`), include kategori in `search`. RiwayatTransaksi: the category `<select>` also shows for `pengeluaran` with `KATEGORI_PENGELUARAN` + `Belum dikategorikan`; reset filter when switching type; expense rows show the badge.
- [ ] **Step 3: Verify.** `npm run typecheck` clean; in dev, submitting the expense form without a category shows "Pilih kategori pengeluaran" under the chips; with a category it saves (then delete that test row via Riwayat Transaksi); existing rows show "Belum dikategorikan".
- [ ] **Step 4: Commit** — `git commit -am "Pick a category when recording expenses; show it in lists"`

### Task 6: "Where the money went" summaries

**Files:**
- Modify: `lib/ringkasan.ts`
- Create: `components/dashboard/RincianKategori.tsx`, `components/dashboard/PenggunaanDana.tsx`
- Modify: `components/dashboard/SumberPemasukan.tsx` (render via `RincianKategori`), `app/page.tsx`, `components/TombolEkspor.tsx` (`pdfRingkasan`)
- Test: `lib/ringkasan.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // lib/ringkasan.ts
  export interface KategoriTotal<K extends string> { kategori: K; total: number; jumlahEntri: number }
  export function ringkasPengeluaranPerKategori(
    pengeluaran: Pick<Pengeluaran, "kategori" | "total_biaya">[]
  ): KategoriTotal<KategoriPengeluaran | typeof TANPA_KATEGORI>[] // total > 0 only, sorted by total desc
  // Ringkasan gains: perKategoriPengeluaran (same type)
  // components/dashboard/RincianKategori.tsx
  export default function RincianKategori(props: {
    title: string; description: string; emptyText: string; totalSemua: number;
    items: { label: string; total: number; jumlahEntri: number; warna: string }[];
  })
  ```

- [ ] **Step 1: Failing tests** in `lib/ringkasan.test.ts`: groups and sorts desc (`[Konsumsi 10k, Penerangan 50k, Konsumsi 5k]` → `[{Penerangan Jalan, 50000, 1}, {Konsumsi, 15000, 2}]`); `kategori: null` → bucket `Belum dikategorikan`; sum of totals equals sum of `total_biaya`; `[]` → `[]`.
- [ ] **Step 2: Run** `npm test` → FAIL.
- [ ] **Step 3: Implement** the function, add `perKategoriPengeluaran` to `hitungRingkasan`. Extract the bar + list markup of `SumberPemasukan` into `RincianKategori` (no visual change); `PenggunaanDana({ r })` uses it with title "Ke Mana Uang Dipakai", description "Pengeluaran per keperluan dari total kas keluar", colours from `WARNA_KATEGORI_PENGELUARAN`, empty text "Belum ada pengeluaran.".
- [ ] **Step 4: Dashboard layout** (`app/page.tsx`): chart card full width; below it a `lg:grid-cols-2` row with `SumberPemasukan` and `PenggunaanDana`.
- [ ] **Step 5: PDF cash report.** Between the totals table and "Rincian Pengeluaran": heading "Pengeluaran per Keperluan" + table `Keperluan, Entri, Total, Porsi` from `ringkasPengeluaranPerKategori(pengeluaran)`; detail table gains `Kategori` column after `Item / Keperluan`.
- [ ] **Step 6: Run** `npm test` → PASS; `npm run typecheck` clean; dev: dashboard shows both cards side by side on desktop, stacked at 390 px; cash PDF shows the summary table.
- [ ] **Step 7: Commit** — `git commit -am "Add spending-by-category summaries to dashboard and cash report"` (add new files).

### Task 7: Backfill existing expenses, verify, ship

**Files:**
- Create: `db/kategori-pengeluaran-awal.json` (`[{ id, tanggal, item, kategori }]`, 40 entries, no buyer names)
- Create: `scripts/backfill-kategori-pengeluaran.mjs`; Modify: `package.json` (`"db:backfill-kategori": "node --env-file=.env.local scripts/backfill-kategori-pengeluaran.mjs"`)
- Modify: `CLAUDE.md` (constants line + scripts list), `README.md` (feature list)

- [ ] **Step 1: Mapping file.** Generate from `db/backup/pengeluaran.json`: sort by `tanggal` (stable), number 1–40, categories per spec table — Penerangan Jalan #4,7,8,10–18,20,24–28 · Kebersihan Lingkungan #9,19,21,22,31,32,35,39 · Fasilitas Umum #2 · Konsumsi #1,6,23,29,30,33,34,36,38,40 · Acara & Perayaan #37 · Sosial & Duka #3 · Administrasi & Lainnya #5. Check: 40 unique ids, every `kategori` in `KATEGORI_PENGELUARAN`.
- [ ] **Step 2: Script.** Default = dry run: loads the map, reads `id, item_barang, kategori, total_biaya` from Neon, prints planned updates (only rows where DB `kategori IS NULL`), rows in DB with null kategori not in the map, and per-category totals after the change plus the grand total. `--apply`: one `sql.transaction` of `UPDATE pengeluaran SET kategori = $1 WHERE id = $2 AND kategori IS NULL`; then if no nulls remain, `ALTER TABLE pengeluaran ALTER COLUMN kategori SET NOT NULL`, else print the remaining rows and skip it. Unknown category in the map → exit 1 before any write.
- [ ] **Step 3: Dry run** `npm run db:backfill-kategori` → 40 planned updates; totals Penerangan Jalan Rp 2.915.000 · Kebersihan Lingkungan Rp 2.256.000 · Fasilitas Umum Rp 1.250.000 · Konsumsi Rp 463.700 · Acara & Perayaan Rp 300.000 · Sosial & Duka Rp 250.000 · Administrasi & Lainnya Rp 16.000 · total Rp 7.450.700 (plus any expenses recorded since the migration, listed as unmapped).
- [ ] **Step 4: Ask the user** in chat, showing the dry-run totals and any unmapped rows; wait for yes.
- [ ] **Step 5: Apply** `npm run db:backfill-kategori -- --apply` → "40 diperbarui", NOT NULL set (or the list of rows still needing a category). Re-run dry run → 0 planned updates.
- [ ] **Step 6: Docs + full check.** Update `CLAUDE.md`/`README.md`; `npm test`, `npm run typecheck`, `npx next build` all pass; dev dashboard: no "Belum dikategorikan" bucket.
- [ ] **Step 7: Commit, then push after user OK** — `git add db/kategori-pengeluaran-awal.json scripts/backfill-kategori-pengeluaran.mjs package.json CLAUDE.md README.md docs/superpowers && git commit -m "Backfill expense categories and document"`; ask the user, then `git push origin main`.
