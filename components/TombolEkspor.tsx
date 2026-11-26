"use client";
import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { Anggota, Pemasukan, Pengeluaran } from "@/lib/types";

interface Props {
  anggota: Anggota[];
  pemasukan: Pemasukan[];
  pengeluaran: Pengeluaran[];
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoKas: number;
}

const JADE: [number, number, number] = [14, 107, 88];
const MERAH: [number, number, number] = [180, 35, 24];

// jsPDF (~350 KB) hanya dimuat saat tombol ditekan
async function muatPdf() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  return { jsPDF, autoTable };
}

function kepala(doc: import("jspdf").jsPDF, judul: string, sub: string, lebar: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(judul, 14, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(sub, 14, 27);
  doc.text(
    `Dicetak ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" })}`,
    lebar - 14,
    27,
    { align: "right" }
  );
  doc.setTextColor(0);
  doc.setDrawColor(200);
  doc.setLineWidth(0.4);
  doc.line(14, 31, lebar - 14, 31);
}

export default function TombolEkspor(props: Props) {
  const [sibuk, setSibuk] = useState<"kas" | "detail" | null>(null);

  const jalankan = async (jenis: "kas" | "detail", fn: () => Promise<void>) => {
    setSibuk(jenis);
    try {
      await fn();
      toast.success("Laporan PDF berhasil diunduh.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat PDF. Coba lagi.");
    } finally {
      setSibuk(null);
    }
  };

  const pdfRingkasan = () =>
    jalankan("kas", async () => {
      const { jsPDF, autoTable } = await muatPdf();
      const { pengeluaran, totalPemasukan, totalPengeluaran, saldoKas } = props;
      const doc = new jsPDF();
      kepala(doc, "LAPORAN KEUANGAN SUKA DUKA LEGIAN", "Ringkasan Arus Kas Warga", 210);

      autoTable(doc, {
        startY: 38,
        theme: "plain",
        body: [
          ["Total Pemasukan", formatRupiah(totalPemasukan)],
          ["Total Pengeluaran", formatRupiah(totalPengeluaran)],
          ["Sisa Saldo Kas", formatRupiah(saldoKas)],
        ],
        styles: { fontSize: 11, cellPadding: 2 },
        columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
        tableWidth: 100,
        didParseCell: (d) => {
          if (d.row.index === 2) d.cell.styles.textColor = JADE;
        },
      });

      const y = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Rincian Pengeluaran", 14, y);

      const urut = [...pengeluaran].sort((a, b) => (a.tanggal ?? "").localeCompare(b.tanggal ?? ""));
      autoTable(doc, {
        startY: y + 4,
        head: [["No", "Tanggal", "Item / Keperluan", "Vol.", "Total Biaya"]],
        body: urut.map((item, i) => [
          i + 1,
          formatTanggal(item.tanggal),
          item.item_barang,
          item.volume ?? 1,
          formatRupiah(item.total_biaya),
        ]),
        foot: [["", "", "Total", "", formatRupiah(totalPengeluaran)]],
        theme: "grid",
        headStyles: { fillColor: MERAH },
        footStyles: { fillColor: [245, 247, 249], textColor: 20 },
        columnStyles: { 0: { cellWidth: 12 }, 3: { halign: "center" }, 4: { halign: "right" } },
        styles: { fontSize: 9.5 },
      });

      doc.save("Laporan_Kas_Ringkasan.pdf");
    });

  const pdfDetail = () =>
    jalankan("detail", async () => {
      const { jsPDF, autoTable } = await muatPdf();
      const { anggota, pemasukan } = props;
      const doc = new jsPDF("l");

      const sekarang = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" });
      const yearMonth = sekarang.slice(0, 7);
      const bulanIni = new Date(`${yearMonth}-01T00:00:00Z`).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });

      kepala(doc, "LAPORAN KEPATUHAN IURAN WARGA", `Suka Duka Legian — status pembayaran per ${bulanIni}`, 297);

      const jumlahKat = (rows: Pemasukan[], k: string) =>
        rows.filter((p) => p.kategori === k).reduce((s, p) => s + Number(p.jumlah), 0);

      const body = anggota.map((orang, i) => {
        const trx = pemasukan.filter((p) => p.anggota_id === orang.id);
        const lunas = trx.some(
          (p) => p.kategori === "Iuran Bulanan" && p.periode_bulan?.startsWith(yearMonth)
        );
        const wajib = jumlahKat(trx, "Sumbangan Wajib");
        const donasi = jumlahKat(trx, "Donasi Sukarela");
        const denda = jumlahKat(trx, "Denda Gotong-Royong");
        return [
          i + 1,
          orang.nama_lengkap,
          lunas ? "Lunas" : "Belum Bayar",
          wajib > 0 ? formatRupiah(wajib) : "-",
          donasi > 0 ? formatRupiah(donasi) : "-",
          denda > 0 ? formatRupiah(denda) : "-",
        ];
      });

      autoTable(doc, {
        startY: 38,
        head: [["No", "Nama Warga", `Iuran ${bulanIni}`, "Sumbangan Wajib", "Donasi Sukarela", "Denda"]],
        body,
        theme: "grid",
        headStyles: { fillColor: JADE },
        styles: { fontSize: 9.5 },
        columnStyles: { 0: { cellWidth: 12 }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } },
        didParseCell: (d) => {
          if (d.section !== "body") return;
          if (d.cell.raw === "Belum Bayar") {
            d.cell.styles.textColor = MERAH;
            d.cell.styles.fontStyle = "bold";
          } else if (d.cell.raw === "Lunas") {
            d.cell.styles.textColor = JADE;
            d.cell.styles.fontStyle = "bold";
          }
        },
      });

      doc.save("Laporan_Detail_Pembayaran_Warga.pdf");
    });

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Button variant="secondary" onClick={pdfRingkasan} loading={sibuk === "kas"} disabled={sibuk !== null}>
        {sibuk !== "kas" && <FileText aria-hidden />}
        Laporan Kas (PDF)
      </Button>
      <Button variant="secondary" onClick={pdfDetail} loading={sibuk === "detail"} disabled={sibuk !== null}>
        {sibuk !== "detail" && <FileSpreadsheet aria-hidden />}
        Kepatuhan Iuran (PDF)
      </Button>
    </div>
  );
}
