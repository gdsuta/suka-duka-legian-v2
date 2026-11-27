// Teks SQL untuk Catat Iuran Sekaligus — modul biasa (tanpa impor) agar bisa diuji langsung dengan Node.
/**
 * Satu pernyataan SQL: simpan semua anggota×bulan yang belum tercatat, lewati yang sudah ada.
 * `tabel` hanya nama tabel tetap (dipakai untuk uji pada salinan sementara), bukan input pengguna.
 */
export function sqlIuranSekaligus(tabel: "pemasukan" | "pemasukan_uji" = "pemasukan"): string {
  return `
    WITH masuk AS (
      SELECT DISTINCT e.anggota_id, (e.bulan || '-01')::date AS periode
      FROM json_to_recordset($1::json) AS e(anggota_id uuid, bulan text)
    ), baru AS (
      INSERT INTO ${tabel} (anggota_id, kategori, jumlah, periode_bulan, tanggal_bayar)
      SELECT m.anggota_id, 'Iuran Bulanan', $2, m.periode, $3::timestamptz
      FROM masuk m
      WHERE EXISTS (SELECT 1 FROM anggota a WHERE a.id = m.anggota_id)
        AND NOT EXISTS (SELECT 1 FROM ${tabel} p
                        WHERE p.kategori = 'Iuran Bulanan' AND p.anggota_id = m.anggota_id AND p.periode_bulan = m.periode)
      RETURNING anggota_id, periode_bulan
    )
    SELECT to_char(m.periode, 'YYYY-MM') AS bulan, a.nama_lengkap AS nama, (b.anggota_id IS NOT NULL) AS disimpan
    FROM masuk m
    LEFT JOIN baru b ON b.anggota_id = m.anggota_id AND b.periode_bulan = m.periode
    LEFT JOIN anggota a ON a.id = m.anggota_id`;
}
