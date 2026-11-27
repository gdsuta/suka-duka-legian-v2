# Fines per kerja bakti + expense categories — design

Date: 2026-11-27 · Size: small change (two parts)

## Why
The app exists for check and balance. Members never log in; they read the public
dashboard and the PDF reports the treasurer posts in the community WhatsApp group.
The two questions they ask most cannot be answered from today's reports:

1. "Have I paid my kerja bakti fine?" The member report has a single lifetime
   "Denda" total, so "-" could mean "not absent" or "absent and unpaid".
2. "Where did the (donation/maintenance) money go?" Expenses are an
   uncategorised list of 40 lines in one shared pool.

## Goals
- A member finds their name and sees, per kerja bakti date, whether a fine
  payment is recorded.
- Members see spending summarised by purpose, with the full list still available.
- No extra work for the treasurer beyond one tap (expense category) per expense.

## Non-goals / anti-goals
- No absence list or announcements in the app (they stay in WhatsApp).
- No earmarked funds or per-fund balances (all money is one pool).
- Must not guess or silently change financial data: categories for existing
  expenses are set only from the table below, after the user confirms it.

## Approaches considered
**Fines:** (A) member × date grid — chosen; one glance answers "have I paid?",
same reading pattern as the existing iuran report. (B) one payer list per date —
simpler, but a member must scan every list for their name.
**Expenses:** (A) a stored category per expense — chosen; accurate, one tap.
(B) infer category from the item name — no input, but silently wrong at times,
which defeats a transparency report.

## Part 1 — fines grid
- Data: existing `pemasukan` rows with kategori `Denda Gotong-Royong`, grouped by
  `periode_bulan` (the kerja bakti date). No schema change, no form change.
- Rows: all members (alphabetical, as in the existing report). Columns: kerja
  bakti dates, oldest → newest. Cell: short amount when paid (e.g. "25rb", summed
  if several payments for one date), empty otherwise. Footer per column: number
  paid and total.
- Dashboard: the "Denda Gotong-Royong" tab in `DataTabs` shows the grid instead
  of a payment list; name search filters rows; name column sticky, dates scroll
  horizontally on phones.
- PDF "Laporan Detail Pembayaran Warga": the lifetime "Denda" column is replaced
  by a separate "Denda Kerja Bakti" grid section showing the 6 most recent dates.

## Part 2 — expense categories
- Fixed list `KATEGORI_PENGELUARAN` in `lib/config.ts` (proposed):
  Penerangan Jalan · Kebersihan Lingkungan · Fasilitas Umum · Konsumsi ·
  Acara & Perayaan · Sosial & Duka · Administrasi & Lainnya.
- Schema: `pengeluaran.kategori text NOT NULL`, added idempotently in
  `db/schema.sql`; Zod enum in `PengeluaranSchema`.
- Form: category chips (`ChipGroup`), required, no preselection.
- Backfill: a one-off script sets the 40 existing rows from the confirmed table
  below and prints per-category totals (must sum to Rp 7.450.700).
- Display: dashboard card "Ke mana uang dipakai" (mirrors `SumberPemasukan`);
  PDF cash report gets a per-category summary above the detail table, and a
  category column in it; expense rows show a category badge; Riwayat Transaksi
  gets a category filter for expenses.

### Proposed categories for existing expenses (to confirm)
| Category | Items (# by date) | Total |
|---|---|---|
| Penerangan Jalan | lamps, cables, MCB, isolasi, fitting, installation & labour (#4, 7, 8, 10–18, 20, 24–28) | Rp 2.915.000 |
| Kebersihan Lingkungan | grass cutter, blades, oil, fuel (#9, 19, 21, 22, 31, 32, 35, 39) | Rp 2.256.000 |
| Fasilitas Umum | Pembuatan Papan Nama Jalan (#2) | Rp 1.250.000 |
| Konsumsi | Aqua, kue, snack (#1, 6, 23, 29, 30, 33, 34, 36, 38, 40) | Rp 463.700 |
| Acara & Perayaan | Perlengkapan HUT RI (#37) | Rp 300.000 |
| Sosial & Duka | Beli Karangan Bunga (#3) | Rp 250.000 |
| Administrasi & Lainnya | Beli Buku dan Pulpen (#5) | Rp 16.000 |

Uncertain: #9 "Beli bahan bakar Pertalite" (9 Feb, before the grass cutter was
bought), #28 "Ongkos kerja" (3 Jun, day after lamp purchases), #31 "Bensin"
(14 Jun, a kerja bakti day).

## Decided with the user
- Past kerja bakti dates are not known exactly, so existing fine records are
  shown **as recorded** — no data is changed. "1 Mar", "10 Mar" and "10 May"
  appear as their own columns.
- Paying a fine later than the kerja bakti is normal. The grid groups by the
  kerja bakti date (`periode_bulan`), not the payment date. On the dashboard,
  each paid cell shows the payment date on tap/hover ("dibayar 11 Sep 2026");
  the PDF shows amounts only.
- Aim: records as clear as possible.

## Proposed (builder's call, user may override)
- Keeping future dates consistent: in the fine form, the date field gets
  quick-pick chips with the most recent kerja bakti dates already recorded, so
  a late payment is filed under the same date as the others instead of a
  slightly different one.
- Categories for the three uncertain expenses stay as in the table above.

## Builder's calls
Category badge colours reuse existing tokens; existing expenses cannot be
edited in the UI today, so a wrong category is fixed by delete + re-enter, as
with other fields; backfill runs only after the user approves it, since it
changes live data.
