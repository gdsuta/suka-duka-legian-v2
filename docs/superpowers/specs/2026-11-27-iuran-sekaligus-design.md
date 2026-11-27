# Catat Iuran Sekaligus (batch iuran entry) — design

Date: 2026-11-27 · Size: small change

## Why
The treasurer is the only admin. She keeps iuran in a paper logbook laid out as
**one row per member, a mark under each month**, and copies it into the app in
rare catch-up sessions (all iuran so far was entered on 9 days). Members often
pay several months at once (most often 4; up to 10). Today she must save one
member-month at a time. Goal: copy a logbook page into the app in one pass, check
the total against the page, save once — with records that make it clear and
transparent who has paid and who hasn't.

## Goals
- A grid shaped like her logbook: members × months of one year; tap to tick.
- Paid vs unpaid is unmistakable: already-recorded months shown as such, unpaid
  months empty, and a per-month "N dari M sudah bayar" count.
- A running total to reconcile with the logbook page before saving.
- Saving is all-or-nothing; already-recorded member-months are never duplicated.
- A "Tanggal diterima" (date received) for the batch, so the monthly cash-flow
  chart reflects when money came in, not when it was typed.

## Non-goals / anti-goals
- No "bebas"/exempt marking (exemptions stopped).
- No reminders, arrears lists or anything that singles out non-payers
  (membership is voluntary). The screen only records what came in.
- No editing/deleting from the grid (Riwayat Transaksi already does that).
- The existing one-at-a-time income form stays as it is.
- Must not change historical data (the 17 old duplicate member-months stay).

## Approaches considered
1. **New page + one server action saving the whole batch in a single SQL
   statement — chosen.** Atomic; skips member-months already recorded and reports
   them; stores amount and date received per row; reuses the `pemasukan` table so
   dashboard/PDF need no change.
2. Loop the existing `catatPemasukan` per cell — rejected: a dropped connection
   saves half a page; no date received.
3. Unique DB index on (member, month) — rejected: 17 existing duplicates would
   have to be changed first.

## Design
**Entry point.** Bottom nav stays at 5 items (mobile limit). The "Catat
Pemasukan" page gets a two-option switch at the top — *Satu per satu* |
*Sekaligus (logbook)* — linking to the new route `/admin/catat-iuran`; the admin
panel on the dashboard gets a quick link too.

**Controls (top).** Tahun (current year −1 … +1, default current; via `?tahun=`),
Jumlah per bulan (default Rp 10.000, must be > 0), Tanggal diterima (default
today WITA, not in the future). Legend: "✓ abu-abu = sudah tercatat · kosong =
belum bayar · ✓ hijau = dicentang, belum disimpan".

**Grid.** Rows: all members alphabetically (name column sticky). Columns: Jan–Des
of the chosen year. Cells (44px targets):
- recorded → grey ✓, not tappable; tooltip/tap shows amount and date recorded;
- empty → "belum bayar" (screen-reader text), tap to tick;
- ticked → green ✓, tap again to untick.
Column footer: "N/M" members paid for that month (recorded + ticked, ticked part
highlighted). On phones it opens scrolled to the current month.

**Bottom bar (sticky).** "X bulan baru · Y warga · Rp Z" and **Simpan semua**
(disabled at 0). Leaving the page with unsaved ticks asks for confirmation
(browser's native leave-page prompt only).

**Saving.** Server action `catatIuranSekaligus` — `requireAdmin()` first; Zod:
`jumlah` positive ≤ 1e9, `tanggal_diterima` valid and not in the future,
`entri` 1–600 items of `{ anggota_id: uuid, bulan: "YYYY-MM" }` (duplicates in the
input collapsed). One `INSERT … SELECT FROM json_to_recordset(…)` that inserts
`kategori 'Iuran Bulanan'`, `periode_bulan = bulan-01`, `tanggal_bayar = tanggal
diterima 12:00 WITA`, only where the member exists and no iuran row exists for
that member-month; `RETURNING` the saved rows. Result message: "N bulan
tersimpan · Rp T"; if some were skipped: "M dilewati karena sudah tercatat: …"
(names + months). Then `revalidatePath`, so the green ticks become grey.

## Builder's calls
- Year range and route name as above; grid helpers (`susunGridIuran`,
  plan totals) are pure functions in `lib/` with unit tests, like `lib/denda.ts`.
- With one admin, a race between two simultaneous saves is not guarded beyond
  the NOT EXISTS check.
- SQL verified with a transaction forced to roll back, not by writing test rows
  to the live database.
