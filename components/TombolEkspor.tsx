"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Button from "@/components/ui/Button";

export default function TombolEkspor({
  anggota,
  pemasukan,
  pengeluaran,
  totalPemasukan,
  totalPengeluaran,
  saldoKas,
}: any) {
  const buatPDFRingkasan = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN KEUANGAN SUKA DUKA LEGIAN", 14, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Ringkasan Arus Kas Warga", 14, 28);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Rincian Pengeluaran", 14, 42);

    const tableColumn = ["No", "Tanggal", "Item/Keperluan", "Volume", "Total Biaya"];
    const tableRows = pengeluaran.map((item: any, index: number) => [
      index + 1,
      item.tanggal || "-",
      item.item_barang,
      item.volume,
      `Rp ${item.total_biaya.toLocaleString("id-ID")}`,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 48,
      theme: "grid",
      headStyles: { fillColor: [177, 70, 31] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 48;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Total Pemasukan: Rp ${totalPemasukan.toLocaleString("id-ID")}`,
      14,
      finalY + 15
    );
    doc.text(
      `Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString("id-ID")}`,
      14,
      finalY + 23
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      `SISA SALDO KAS: Rp ${saldoKas.toLocaleString("id-ID")}`,
      14,
      finalY + 33
    );

    doc.save("Laporan_Kas_Ringkasan.pdf");
  };

  const buatPDFDetail = () => {
    const doc = new jsPDF("l");

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN KEPATUHAN IURAN WARGA", 14, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const bulanIni = new Date().toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    doc.text(`Suka Duka Legian - Status Pembayaran per ${bulanIni}`, 14, 28);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 283, 32);

    const tableColumn = [
      "No",
      "Nama Warga",
      `Iuran (${bulanIni})`,
      "Sumbangan Wajib",
      "Donasi Sukarela",
      "Denda",
    ];

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const tableRows = anggota.map((orang: any, index: number) => {
      const trxWarga = pemasukan.filter((p: any) => p.anggota_id === orang.id);

      const iuranBulanIni = trxWarga.find(
        (p: any) =>
          p.kategori === "Iuran Bulanan" &&
          p.periode_bulan &&
          p.periode_bulan.startsWith(yearMonth)
      );
      const statusIuran = iuranBulanIni ? "Lunas" : "Belum Bayar";

      const sumbanganWajib = trxWarga
        .filter((p: any) => p.kategori === "Sumbangan Wajib")
        .reduce((sum: number, p: any) => sum + Number(p.jumlah), 0);
      const donasi = trxWarga
        .filter((p: any) => p.kategori === "Donasi Sukarela")
        .reduce((sum: number, p: any) => sum + Number(p.jumlah), 0);
      const denda = trxWarga
        .filter((p: any) => p.kategori === "Denda Gotong-Royong")
        .reduce((sum: number, p: any) => sum + Number(p.jumlah), 0);

      return [
        index + 1,
        orang.nama_lengkap,
        statusIuran,
        sumbanganWajib > 0
          ? `Rp ${sumbanganWajib.toLocaleString("id-ID")}`
          : "-",
        donasi > 0 ? `Rp ${donasi.toLocaleString("id-ID")}` : "-",
        denda > 0 ? `Rp ${denda.toLocaleString("id-ID")}` : "-",
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      headStyles: { fillColor: [14, 107, 88] },
      didParseCell: function (data) {
        if (data.cell.raw === "Belum Bayar") {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = "bold";
        }
        if (data.cell.raw === "Lunas") {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    doc.save("Laporan_Detail_Pembayaran_Warga.pdf");
  };

  return (
    <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
      <Button onClick={buatPDFRingkasan} variant="secondary" size="sm" className="shrink-0">
        Cetak Kas
      </Button>
      <Button onClick={buatPDFDetail} variant="secondary" size="sm" className="shrink-0">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Cetak Detail (Landscape)
      </Button>
    </div>
  );
}
