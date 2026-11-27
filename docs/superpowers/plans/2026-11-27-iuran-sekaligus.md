# Catat Iuran Sekaligus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A logbook-shaped grid (members × months) where the treasurer ticks paid months, checks a running total, and saves the whole page at once.

**Architecture:** Pure, unit-tested helpers in `lib/iuran.ts` build the grid and totals; a Zod schema plus one Server Action save the batch with a single data-modifying SQL statement that skips already-recorded member-months; a client grid component renders it on a new route `/admin/catat-iuran`.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Neon (`@neondatabase/serverless`), Zod 3, sonner, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-27-iuran-sekaligus-design.md`

## Global Constraints

- `CLAUDE.md` rules: tokens only (no raw hex), `formatRupiah` + `num` for money, lucide icons `aria-hidden`, 44px touch targets, sonner (no `alert/confirm`), `requireAdmin()` first in the action, `revalidatePath("/", "layout")` after saving.
- Category stored: `Iuran Bulanan`; `periode_bulan` = `YYYY-MM-01`; `tanggal_bayar` = date received at 12:00 WITA = `YYYY-MM-DDT04:00:00.000Z`.
- Defaults: amount Rp 10.000; year = current WITA year; date received = `hariIni()`; year options current −1 … +1.
- Limits: `jumlah` > 0 and ≤ 1.000.000.000; `entri` 1–600 items; date received not after today (WITA).
- Legend copy: `✓ abu-abu = sudah tercatat · kosong = belum bayar · ✓ hijau = dicentang, belum disimpan`.
- Messages: success `"{N} bulan tersimpan · {formatRupiah(total)}"`; skipped `"{M} dilewati karena sudah tercatat: {nama} ({bulan}), …"`.
- Bottom nav stays 5 items. Entry points: switch *Satu per satu* | *Sekaligus (logbook)* on Catat Pemasukan and Catat Iuran pages; quick link in `PanelAdmin`.
- No "bebas", no reminders/arrears lists, no historical data changes, existing single form unchanged.
- Work on branch `feature/iuran-sekaligus`; merge/push to `main` only after the user says so.

## Review Focus

1. A member-month recorded elsewhere (single form) between page load and save → skipped, named in the message, grid refreshes; nothing duplicated. Test: rolled-back SQL check in Task 2 with an existing row.
2. Date received = today late in the evening WITA (server clock in UTC) → must be accepted, not rejected as "future". Test in Task 2 (`hariIni()` value passes).
3. A historical duplicate or Rp 0 iuran for a member-month → shown once as recorded (grey), counted once in the "N/M" footer. Test in Task 1.
4. Changing the year with unsaved ticks → ticks must not silently vanish. Year select is disabled while ticks are pending, with hint "Simpan atau batalkan centang dulu". Checked in Task 3 browser step.
5. Double-tapping Simpan → one save only; button disabled while pending, and a second request would skip everything anyway. Checked in Task 3.

---

### Task 1: Grid model

**Files:** Create `lib/iuran.ts`; Test `lib/iuran.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface CatatanIuran { jumlah: number; tanggalBayar: string } // summed jumlah, latest tanggal_bayar
  export interface BarisIuran { anggotaId: string; nama: string; tercatat: Record<string, CatatanIuran> } // key "YYYY-MM"
  export interface GridIuran { bulan: string[]; baris: BarisIuran[] } // bulan = 12 keys "YYYY-01".."YYYY-12"
  export function susunGridIuran(
    anggota: { id: string; nama_lengkap: string }[],
    pemasukan: Pick<Pemasukan, "anggota_id" | "kategori" | "jumlah" | "periode_bulan" | "tanggal_bayar">[],
    tahun: number
  ): GridIuran
  export const kunciCentang = (anggotaId: string, bulan: string) => `${anggotaId}|${bulan}`;
  export function ringkasCentang(centang: Iterable<string>, jumlahPerBulan: number):
    { jumlahBulan: number; jumlahWarga: number; total: number }
  export function jumlahBayarPerBulan(grid: GridIuran, centang: Iterable<string>):
    Record<string, { tercatat: number; dicentang: number }>
  export function tanggalBayarWita(tanggal: string): string // "2026-11-27" → "2026-11-27T04:00:00.000Z"
  ```

- [ ] **Step 1: Failing tests** (`lib/iuran.test.ts`):
  - `susunGridIuran` gives 12 months `2026-01…2026-12`, all members in input order, only `Iuran Bulanan` rows of that year.
  - Two rows for the same member-month (historical duplicate) → one `tercatat` entry, `jumlah` summed (10000+10000 → 20000).
  - A Rp 0 row → `tercatat` entry with `jumlah: 0` (still recorded).
  - Rows for unknown `anggota_id` / other years / other categories ignored.
  - `ringkasCentang(["a|2026-10","a|2026-11","b|2026-11"], 10000)` → `{ jumlahBulan: 3, jumlahWarga: 2, total: 30000 }`; duplicates in input counted once.
  - `jumlahBayarPerBulan` for 2 members, a recorded in Oct, b ticked in Oct → `{"2026-10": {tercatat: 1, dicentang: 1}}` and zeros for other months.
  - `tanggalBayarWita("2026-11-27") === "2026-11-27T04:00:00.000Z"`.
- [ ] **Step 2:** `npm test` → FAIL (module missing).
- [ ] **Step 3:** Implement in `lib/iuran.ts` (type-only imports, like `lib/denda.ts`).
- [ ] **Step 4:** `npm test` → all pass; `npx tsc --noEmit` clean.
- [ ] **Step 5:** Commit `"Add batch iuran grid model"`.

### Task 2: Schema + Server Action

**Files:** Modify `lib/schemas.ts`, `lib/types.ts`, `lib/actions/keuangan.ts`; Test `lib/schemas.test.ts`

**Interfaces:**
- Consumes: `tanggalBayarWita` (Task 1), `hariIni` (`lib/format.ts`)
- Produces:
  ```ts
  // lib/schemas.ts
  export const IuranSekaligusSchema // { jumlah: number; tanggal_diterima: "YYYY-MM-DD"; entri: { anggota_id: uuid; bulan: "YYYY-MM" }[] }
  // lib/types.ts
  export type IuranSekaligusResult =
    | { ok: true; message: string; disimpan: number; dilewati: { nama: string; bulan: string }[] }
    | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };
  // lib/actions/keuangan.ts
  export async function catatIuranSekaligus(input: unknown): Promise<IuranSekaligusResult>
  ```

- [ ] **Step 1: Failing tests** in `lib/schemas.test.ts` (`IuranSekaligusSchema`): valid input parses; `entri: []` → error `"Centang minimal satu bulan"`; 601 items → error; `bulan: "2026-13"` → error; `jumlah: 0` → error `"Jumlah harus lebih dari 0"`; `tanggal_diterima` = tomorrow (WITA) → error `"Tanggal diterima tidak boleh di masa depan"`; `tanggal_diterima = hariIni()` → valid; duplicate entries in input → parsed `entri` has them once.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Implement** the schema (dedupe via `.transform`, future check compares the string to `hariIni()`), the result type, and the action: `requireAdmin()`, `safeParse`, then one statement via `db().query(text, [JSON.stringify(entri), jumlah, tanggalBayarWita(tanggal_diterima)])`:

```sql
WITH masuk AS (
  SELECT DISTINCT e.anggota_id, (e.bulan || '-01')::date AS periode
  FROM json_to_recordset($1::json) AS e(anggota_id uuid, bulan text)
), baru AS (
  INSERT INTO pemasukan (anggota_id, kategori, jumlah, periode_bulan, tanggal_bayar)
  SELECT m.anggota_id, 'Iuran Bulanan', $2, m.periode, $3::timestamptz
  FROM masuk m
  WHERE EXISTS (SELECT 1 FROM anggota a WHERE a.id = m.anggota_id)
    AND NOT EXISTS (SELECT 1 FROM pemasukan p
                    WHERE p.kategori = 'Iuran Bulanan' AND p.anggota_id = m.anggota_id AND p.periode_bulan = m.periode)
  RETURNING anggota_id, periode_bulan
)
SELECT to_char(m.periode, 'YYYY-MM') AS bulan, a.nama_lengkap AS nama, (b.anggota_id IS NOT NULL) AS disimpan
FROM masuk m
LEFT JOIN baru b ON b.anggota_id = m.anggota_id AND b.periode_bulan = m.periode
LEFT JOIN anggota a ON a.id = m.anggota_id
```
  Messages per Global Constraints (`bulan` shown via `formatPeriode`); skipped list sorted by name; when nothing saved: `ok: true`, message `"Tidak ada yang baru — semua sudah tercatat."`. Then `revalidatePath("/", "layout")`.
- [ ] **Step 4:** `npm test` → pass; `npx tsc --noEmit` clean.
  Export the statement text as `sqlIuranSekaligus(tabel = "pemasukan"): string` (table name is a fixed identifier, never user input) so it can be checked against a copy.
- [ ] **Step 5: SQL check without touching live data:** one `sql.transaction` of `[CREATE TEMP TABLE pemasukan_uji (LIKE pemasukan INCLUDING ALL) ON COMMIT DROP, INSERT INTO pemasukan_uji SELECT * FROM pemasukan, sql.query(sqlIuranSekaligus("pemasukan_uji"), [entri, 10000, tanggalBayarWita(hariIni())])]` with 3 entries: a member-month already recorded, a new one, and the new one repeated. Expected: third result = 2 rows, `disimpan` `[false, true]`; live `pemasukan` row count unchanged before/after.
- [ ] **Step 6:** Commit `"Add batch iuran schema and server action"`.

### Task 3: Page, grid UI and entry points

**Files:** Create `app/admin/catat-iuran/page.tsx`, `components/forms/GridIuran.tsx` (client), `components/ui/ModeCatat.tsx`; Modify `app/admin/catat-pemasukan/page.tsx`, `components/dashboard/PanelAdmin.tsx`

**Interfaces:**
- Consumes: Task 1 helpers, `catatIuranSekaligus` (Task 2), `formatPeriode`, `formatTanggal`, `formatRupiah`, `hariIni`, `InputRupiah`, `Card`, `Button`, `PageHeader`
- Produces: `GridIuran({ grid, tahun, pilihanTahun }: { grid: GridIuran; tahun: number; pilihanTahun: number[] })`; `ModeCatat({ aktif }: { aktif: "satu" | "sekaligus" })` — two links styled like the Riwayat type toggle (`aria-current="page"` on the active one).

- [ ] **Step 1: Page** — server component; reads `searchParams.tahun` (clamped to current−1…current+1, default current WITA year), loads `getAnggota()` + `getPemasukan()` in `Promise.all`, renders `PageHeader` ("Catat Iuran Sekaligus", description "Salin halaman buku catatan: centang bulan yang sudah dibayar, cek total, lalu simpan sekaligus."), `ModeCatat aktif="sekaligus"`, `GridIuran`.
- [ ] **Step 2: GridIuran** — controls row: Tahun `<select>` (navigates to `?tahun=`; disabled with hint "Simpan atau batalkan centang dulu" while ticks exist), Jumlah per bulan (`InputRupiah`, default "10000"), Tanggal diterima (`type="date"`, `max={hariIni()}`). Legend line (exact copy). Table: sticky name column; 12 month headers (short month name, e.g. "Okt"); cells 44px: recorded → grey ✓ button that toasts `"{nama} · {formatPeriode} · {formatRupiah(jumlah)} · dicatat {formatTanggal(tanggalBayar)}"`; empty → button `aria-pressed=false`, sr-only "belum bayar"; ticked → green ✓ `aria-pressed=true`. Footer row per month: `"{tercatat+dicentang}/{baris.length}"` with the ticked part in brand colour. On mount, scroll horizontally so the current month is visible. Sticky bottom bar: `"{jumlahBulan} bulan baru · {jumlahWarga} warga"` + `formatRupiah(total)` + "Batalkan" (clears ticks) + "Simpan semua" (`loading` while pending, disabled at 0). On success: toast message (+ skipped list as description), clear ticks, `router.refresh()`. `beforeunload` prompt while ticks exist.
- [ ] **Step 3: Entry points** — `ModeCatat aktif="satu"` above `FormPemasukan`; `PanelAdmin` gets `{ href: "/admin/catat-iuran", label: "Iuran Sekaligus", desc: "Salin buku catatan iuran", icon: CalendarCheck, tone: "bg-brand-soft text-brand" }`.
- [ ] **Step 4: Verify** — `npx tsc --noEmit`; dev server + headless browser (local admin cookie): at 390px and 1280px the grid shows 41 rows × 12 months for 2026 with recorded cells grey and the current month in view; ticking 3 cells shows "3 bulan baru · 2 warga · Rp 30.000"; year select disabled while ticked; Batalkan clears. Do **not** press Simpan against live data.
- [ ] **Step 5:** Commit `"Add Catat Iuran Sekaligus page"`.

### Task 4: Docs, checks, review, ship

- [ ] **Step 1:** `CLAUDE.md` (route list + `lib/iuran.ts`) and `README.md` (feature line) updated.
- [ ] **Step 2:** `npm test`, `npx tsc --noEmit`, `npx next build` all pass.
- [ ] **Step 3:** Commit `"Document batch iuran entry"`; final whole-branch review; ask the user before merging to `main` and pushing.
