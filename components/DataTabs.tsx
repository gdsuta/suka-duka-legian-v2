"use client";
import { useState } from "react";

export default function DataTabs({ anggota, pemasukan, pengeluaran }: any) {
  const [activeTab, setActiveTab] = useState("warga");

  const getNamaWarga = (id: string) => {
    const orang = anggota.find((a: any) => a.id === id);
    return orang ? orang.nama_lengkap : "Tidak diketahui";
  };

  const iuranBulanan = pemasukan
    .filter((p: any) => p.kategori === "Iuran Bulanan")
    .sort(
      (a: any, b: any) =>
        new Date(b.tanggal_bayar).getTime() -
        new Date(a.tanggal_bayar).getTime()
    );

  const denda = pemasukan
    .filter((p: any) => p.kategori === "Denda Gotong-Royong")
    .sort(
      (a: any, b: any) =>
        new Date(b.tanggal_bayar).getTime() -
        new Date(a.tanggal_bayar).getTime()
    );

  const sumbanganWajib = pemasukan
    .filter((p: any) => p.kategori === "Sumbangan Wajib")
    .sort(
      (a: any, b: any) =>
        new Date(b.tanggal_bayar).getTime() -
        new Date(a.tanggal_bayar).getTime()
    );

  // NEW — Donasi Sukarela
  const donasiSukarela = pemasukan
    .filter((p: any) => p.kategori === "Donasi Sukarela")
    .sort(
      (a: any, b: any) =>
        new Date(b.tanggal_bayar).getTime() -
        new Date(a.tanggal_bayar).getTime()
    );

  const totalDonasiSukarela = donasiSukarela.reduce(
    (sum: number, p: any) => sum + Number(p.jumlah),
    0
  );

  const tabs = [
    { key: "warga",      label: "Daftar Warga" },
    { key: "iuran",      label: "Iuran Bulanan" },
    { key: "denda",      label: "Denda Gotong-Royong" },
    { key: "sumbangan",  label: "Sumbangan Wajib" },
    { key: "donasi",     label: "Donasi Sukarela" },   // NEW
    { key: "pengeluaran",label: "Pengeluaran" },
  ];

  const baseTabClass =
    "px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap";
  const activeTabClass = `${baseTabClass} border-blue-600 text-blue-600 bg-blue-50/50`;
  const inactiveTabClass = `${baseTabClass} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">

      {/* Tab Menu */}
      <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={activeTab === key ? activeTabClass : inactiveTabClass}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-gray-600 text-sm border-b">
              <th className="p-4 font-semibold">No</th>

              {activeTab === "warga" && (
                <>
                  <th className="p-4 font-semibold">Nama Lengkap</th>
                  <th className="p-4 font-semibold">Alamat</th>
                </>
              )}

              {(activeTab === "iuran" || activeTab === "denda") && (
                <>
                  <th className="p-4 font-semibold">Nama Warga</th>
                  <th className="p-4 font-semibold">Periode</th>
                  <th className="p-4 font-semibold">Jumlah</th>
                </>
              )}

              {(activeTab === "sumbangan" || activeTab === "donasi") && (
                <>
                  <th className="p-4 font-semibold">Nama Warga</th>
                  <th className="p-4 font-semibold">Jumlah</th>
                  <th className="p-4 font-semibold">Tanggal</th>
                </>
              )}

              {activeTab === "pengeluaran" && (
                <>
                  <th className="p-4 font-semibold">Tanggal</th>
                  <th className="p-4 font-semibold">Item Barang</th>
                  <th className="p-4 font-semibold">Total Biaya</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>

            {/* Tab: Daftar Warga */}
            {activeTab === "warga" &&
              (anggota.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-400">
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                anggota.map((orang: any, index: number) => (
                  <tr key={orang.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{index + 1}</td>
                    <td className="p-4 font-medium text-gray-800">
                      {orang.nama_lengkap}
                    </td>
                    <td className="p-4 text-gray-600">{orang.alamat}</td>
                  </tr>
                ))
              ))}

            {/* Tab: Iuran Bulanan */}
            {activeTab === "iuran" &&
              (iuranBulanan.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    Belum ada data Iuran Bulanan.
                  </td>
                </tr>
              ) : (
                iuranBulanan.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{index + 1}</td>
                    <td className="p-4 font-medium text-gray-800">
                      {getNamaWarga(item.anggota_id)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {item.periode_bulan || "-"}
                    </td>
                    <td className="p-4 text-green-600 font-semibold">
                      Rp {Number(item.jumlah).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ))}

            {/* Tab: Denda Gotong-Royong */}
            {activeTab === "denda" &&
              (denda.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    Belum ada data Denda Gotong-Royong.
                  </td>
                </tr>
              ) : (
                denda.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{index + 1}</td>
                    <td className="p-4 font-medium text-gray-800">
                      {getNamaWarga(item.anggota_id)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {item.periode_bulan || "-"}
                    </td>
                    <td className="p-4 text-green-600 font-semibold">
                      Rp {Number(item.jumlah).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ))}

            {/* Tab: Sumbangan Wajib */}
            {activeTab === "sumbangan" &&
              (sumbanganWajib.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    Belum ada data Sumbangan Wajib.
                  </td>
                </tr>
              ) : (
                sumbanganWajib.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{index + 1}</td>
                    <td className="p-4 font-medium text-gray-800">
                      {getNamaWarga(item.anggota_id)}
                    </td>
                    <td className="p-4 text-green-600 font-semibold">
                      Rp {Number(item.jumlah).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {item.tanggal_bayar
                        ? new Date(item.tanggal_bayar).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" }
                          )
                        : "-"}
                    </td>
                  </tr>
                ))
              ))}

            {/* Tab: Donasi Sukarela — NEW */}
            {activeTab === "donasi" &&
              (donasiSukarela.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    Belum ada data Donasi Sukarela.
                  </td>
                </tr>
              ) : (
                <>
                  {donasiSukarela.map((item: any, index: number) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{index + 1}</td>
                      <td className="p-4 font-medium text-gray-800">
                        {getNamaWarga(item.anggota_id)}
                      </td>
                      <td className="p-4 text-green-600 font-semibold">
                        Rp {Number(item.jumlah).toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {item.tanggal_bayar
                          ? new Date(item.tanggal_bayar).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short", year: "numeric" }
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-green-50 border-t-2 border-green-200">
                    <td colSpan={2} className="p-4 font-bold text-gray-700">
                      Total Donasi Sukarela
                    </td>
                    <td className="p-4 font-bold text-green-700">
                      Rp {totalDonasiSukarela.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {donasiSukarela.length} entri
                    </td>
                  </tr>
                </>
              ))}

            {/* Tab: Pengeluaran */}
            {activeTab === "pengeluaran" &&
              (pengeluaran.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    Belum ada data Pengeluaran.
                  </td>
                </tr>
              ) : (
                [...pengeluaran].reverse().map((item: any, index: number) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{index + 1}</td>
                    <td className="p-4 text-gray-600">{item.tanggal}</td>
                    <td className="p-4 font-medium text-gray-800">
                      {item.item_barang}
                    </td>
                    <td className="p-4 text-red-600 font-semibold">
                      Rp {Number(item.total_biaya).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}