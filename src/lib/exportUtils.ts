import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Reservation } from '../types';

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  totalReservations: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  pendingCount: number;
  lastReservationDate: string;
  lastReservationTime: string;
  totalSpent: number;
  reservations: Reservation[];
}

export interface ReportStats {
  totalReservations: number;
  totalCustomers: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  completedCount: number;
  totalRevenue: number;
  tableStats: { tableName: string; count: number; percentage: number }[];
}

// Helper: Format Rupiah Currency
export function formatRupiah(amount: number): string {
  if (!amount || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Helper: Format Date for Display (e.g. 8 September 2026)
export function formatIndoDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${day} ${months[monthIndex]} ${year}`;
    }
  } catch (_) {}
  return dateStr;
}

// Helper: Download Blob as File
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// 1. EXPORT REPORT RESERVASI (PDF, EXCEL, CSV)
// ============================================================

export function exportReportPDF(
  periodTitle: string,
  stats: ReportStats,
  reservations: Reservation[],
  businessName = 'EPIC MAHJONG',
  location = 'Alam Sutera'
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Colors: Dark Slate & Amber
  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate-900
  const accentColor: [number, number, number] = [217, 119, 6]; // Amber-600

  // 1. Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(businessName.toUpperCase(), 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(location, 14, 18);

  doc.setFontSize(8);
  doc.text('EXCLUSIVE AUTOMATIC MAHJONG VENUE', 14, 23);

  // Badge Periode
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(253, 230, 138); // Amber-200
  doc.text('REPORT RESERVASI', pageWidth - 14, 13, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(241, 245, 249);
  doc.text(periodTitle, pageWidth - 14, 19, { align: 'right' });

  // 2. Summary Statistics Box
  let startY = 34;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, startY, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('RINGKASAN STATISTIK RESERVASI', 18, startY + 6);

  // Stat Columns
  const statY = startY + 12;
  const colWidth = (pageWidth - 36) / 5;

  // Total Booking
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(String(stats.totalReservations), 18, statY + 4);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Booking', 18, statY + 9);

  // Confirmed
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(String(stats.confirmedCount), 18 + colWidth, statY + 4);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Confirmed', 18 + colWidth, statY + 9);

  // Completed
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246); // Blue
  doc.text(String(stats.completedCount), 18 + colWidth * 2, statY + 4);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Completed', 18 + colWidth * 2, statY + 9);

  // Pending
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11); // Amber
  doc.text(String(stats.pendingCount), 18 + colWidth * 3, statY + 4);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Pending', 18 + colWidth * 3, statY + 9);

  // Total Customer / Revenue
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 102, 241); // Indigo
  doc.text(String(stats.totalCustomers), 18 + colWidth * 4, statY + 4);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Customer Unique`, 18 + colWidth * 4, statY + 9);

  // 3. Table of Reservations
  const tableData = reservations.map((r, index) => [
    index + 1,
    r.booking_code,
    `${formatIndoDate(r.reservation_date)}\n${r.reservation_time} WIB`,
    r.table_name || r.table_id,
    `${r.customer_name}\n${r.customer_phone}`,
    `${r.guest_count} Pax`,
    r.status,
    formatRupiah(r.nominal || (r.status === 'CONFIRMED' || r.status === 'COMPLETED' ? (r.table_id === 'tbl-05' ? 250000 : 150000) : 0))
  ]);

  autoTable(doc, {
    startY: startY + 28,
    head: [['No', 'Booking Code', 'Waktu', 'Meja', 'Customer', 'Pax', 'Status', 'Nominal']],
    body: tableData.length > 0 ? tableData : [['-', 'Tidak ada reservasi untuk periode ini', '', '', '', '', '', '']],
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [248, 250, 252],
      fontStyle: 'bold',
      fontSize: 8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 28 },
      3: { cellWidth: 22 },
      4: { cellWidth: 42 },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 24, halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 6) {
        const text = String(data.cell.raw);
        if (text === 'CONFIRMED') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'COMPLETED') {
          data.cell.styles.textColor = [59, 130, 246];
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'PENDING') {
          data.cell.styles.textColor = [217, 119, 6];
        } else if (text === 'CANCELLED') {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  // 4. Footer on each page
  const totalPages = (doc as any).internal.getNumberOfPages();
  const printDateStr = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(new Date());

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated by EPIC MAHJONG • Dicetak: ${printDateStr}`, 14, pageHeight - 7);
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }

  const cleanFilename = `Report_Reservasi_${periodTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(cleanFilename);
}

export function exportReportExcel(
  periodTitle: string,
  stats: ReportStats,
  reservations: Reservation[]
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Detail Reservasi
  const rows = reservations.map((r, i) => {
    const nominal = r.nominal || (r.status === 'CONFIRMED' || r.status === 'COMPLETED' ? (r.table_id === 'tbl-05' ? 250000 : 150000) : 0);
    return {
      'No': i + 1,
      'Booking Code': r.booking_code,
      'Tanggal': r.reservation_date,
      'Jam': r.reservation_time,
      'Meja': r.table_name || r.table_id,
      'Nama Customer': r.customer_name,
      'Nomor WhatsApp': r.customer_phone,
      'Pax': r.guest_count,
      'Status': r.status,
      'Nominal (IDR)': nominal,
      'Catatan': r.notes || '-',
      'Waktu Dibuat': r.created_at
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 18 }, // Booking Code
    { wch: 12 }, // Tanggal
    { wch: 8 },  // Jam
    { wch: 15 }, // Meja
    { wch: 22 }, // Nama
    { wch: 16 }, // Phone
    { wch: 6 },  // Pax
    { wch: 12 }, // Status
    { wch: 14 }, // Nominal
    { wch: 25 }, // Catatan
    { wch: 20 }  // Created
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Reservasi');

  // Sheet 2: Ringkasan
  const summaryData = [
    { 'Kategori': 'Periode Laporan', 'Nilai': periodTitle },
    { 'Kategori': 'Total Booking', 'Nilai': stats.totalReservations },
    { 'Kategori': 'Total Customer Unique', 'Nilai': stats.totalCustomers },
    { 'Kategori': 'Booking Confirmed', 'Nilai': stats.confirmedCount },
    { 'Kategori': 'Booking Completed', 'Nilai': stats.completedCount },
    { 'Kategori': 'Booking Pending', 'Nilai': stats.pendingCount },
    { 'Kategori': 'Booking Cancelled', 'Nilai': stats.cancelledCount },
    { 'Kategori': 'Total Estimasi Pendapatan', 'Nilai': formatRupiah(stats.totalRevenue) },
    { 'Kategori': 'Tanggal Export', 'Nilai': new Date().toISOString() }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  const cleanFilename = `Report_Reservasi_${periodTitle.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, cleanFilename);
}

export function exportReportCSV(
  periodTitle: string,
  reservations: Reservation[]
) {
  const headers = [
    'No',
    'Booking Code',
    'Tanggal',
    'Jam',
    'Meja',
    'Nama Customer',
    'Nomor WhatsApp',
    'Pax',
    'Status',
    'Nominal',
    'Catatan',
    'Waktu Dibuat'
  ];

  const lines = reservations.map((r, i) => {
    const nominal = r.nominal || (r.status === 'CONFIRMED' || r.status === 'COMPLETED' ? (r.table_id === 'tbl-05' ? 250000 : 150000) : 0);
    return [
      i + 1,
      `"${r.booking_code}"`,
      `"${r.reservation_date}"`,
      `"${r.reservation_time}"`,
      `"${r.table_name || r.table_id}"`,
      `"${(r.customer_name || '').replace(/"/g, '""')}"`,
      `"${r.customer_phone}"`,
      r.guest_count,
      `"${r.status}"`,
      nominal,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      `"${r.created_at}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...lines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const cleanFilename = `Report_Reservasi_${periodTitle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
  downloadBlob(blob, cleanFilename);
}

// ============================================================
// 2. EXPORT DATABASE CUSTOMER (EXCEL, CSV, PDF)
// ============================================================

export function exportCustomersExcel(
  customers: CustomerRecord[],
  scopeTitle = 'Seluruh Customer'
) {
  const wb = XLSX.utils.book_new();

  const rows = customers.map((c, i) => ({
    'No': i + 1,
    'Nama Customer': c.name,
    'Nomor WhatsApp': c.phone,
    'Total Reservasi': c.totalReservations,
    'Booking Selesai / Confirmed': c.confirmedCount + c.completedCount,
    'Booking Pending': c.pendingCount,
    'Booking Cancelled': c.cancelledCount,
    'Reservasi Terakhir': `${c.lastReservationDate} ${c.lastReservationTime}`,
    'Estimasi Total Transaksi (IDR)': c.totalSpent
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 25 },
    { wch: 16 },
    { wch: 16 },
    { wch: 22 },
    { wch: 26 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Database Customer');
  const cleanFilename = `Database_Customer_${scopeTitle.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, cleanFilename);
}

export function exportCustomersCSV(
  customers: CustomerRecord[],
  scopeTitle = 'Seluruh Customer'
) {
  const headers = [
    'No',
    'Nama Customer',
    'Nomor WhatsApp',
    'Total Reservasi',
    'Confirmed/Completed',
    'Pending',
    'Cancelled',
    'Reservasi Terakhir',
    'Total Transaksi'
  ];

  const lines = customers.map((c, i) => [
    i + 1,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.phone}"`,
    c.totalReservations,
    c.confirmedCount + c.completedCount,
    c.pendingCount,
    c.cancelledCount,
    `"${c.lastReservationDate} ${c.lastReservationTime}"`,
    c.totalSpent
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...lines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const cleanFilename = `Database_Customer_${scopeTitle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
  downloadBlob(blob, cleanFilename);
}

export function exportCustomersPDF(
  customers: CustomerRecord[],
  scopeTitle = 'Seluruh Customer',
  businessName = 'EPIC MAHJONG',
  location = 'Alam Sutera'
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(businessName.toUpperCase(), 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(location, 14, 18);

  doc.setFontSize(8);
  doc.text('DATABASE PELANGGAN TERDAFTAR', 14, 23);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(253, 230, 138);
  doc.text('DATABASE CUSTOMER', pageWidth - 14, 13, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(241, 245, 249);
  doc.text(`${scopeTitle} (${customers.length} Orang)`, pageWidth - 14, 19, { align: 'right' });

  const tableData = customers.map((c, i) => [
    i + 1,
    c.name,
    c.phone,
    c.totalReservations,
    c.confirmedCount + c.completedCount,
    `${formatIndoDate(c.lastReservationDate)}\n${c.lastReservationTime || ''}`,
    formatRupiah(c.totalSpent)
  ]);

  autoTable(doc, {
    startY: 34,
    head: [['No', 'Nama Customer', 'Nomor WhatsApp', 'Total Booking', 'Selesai/Deal', 'Reservasi Terakhir', 'Total Belanja']],
    body: tableData.length > 0 ? tableData : [['-', 'Belum ada data customer', '', '', '', '', '']],
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [248, 250, 252],
      fontStyle: 'bold',
      fontSize: 8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 32 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 32 },
      6: { cellWidth: 26, halign: 'right' }
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const totalPages = (doc as any).internal.getNumberOfPages();
  const printDateStr = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(new Date());

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated by EPIC MAHJONG • Dicetak: ${printDateStr}`, 14, pageHeight - 7);
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }

  const cleanFilename = `Database_Customer_${scopeTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(cleanFilename);
}
