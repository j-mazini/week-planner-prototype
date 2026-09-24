import { createPDFWithHeader, addSummaryBox, drawTable, PDF_COLORS } from '@/lib/pdf-utils';
import type { DisplayDeduction } from '../types';

const formatCurrency = (val: number | string | null | undefined) => {
  if (val === undefined || val === null || val === '') return '£0.00';
  const num = typeof val === 'string' ? parseFloat(val) : Number(val);
  if (isNaN(num)) return '£0.00';
  return `£${num.toFixed(2)}`;
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateString;
  }
};

export async function exportDeductionsToPDF(
  deductions: DisplayDeduction[],
  currentMonth: Date,
  activeKpiFilter: string,
  searchQuery: string
): Promise<Blob> {
  try {
    const pdf = await createPDFWithHeader({
      title: 'Deductions, Disbursements & Recharges',
      subtitle: 'Deductions Report',
      orientation: 'landscape',
    });

    const margin = 14;
    let currentY = margin + 40;

    // Summary box
    const totalAmount = deductions.reduce((sum, item) => sum + (item.amount || 0), 0);
    const summaryData = [
      { label: 'Generated', value: new Date().toLocaleDateString('en-GB') },
      { label: 'Total Entries', value: deductions.length.toString() },
      { label: 'Total Amount', value: formatCurrency(totalAmount) },
      { label: 'Month', value: currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) },
    ];

    if (activeKpiFilter !== 'all') {
      summaryData.push({ label: 'Type Filter', value: activeKpiFilter });
    }
    if (searchQuery) {
      summaryData.push({ label: 'Search Term', value: searchQuery });
    }

    currentY = addSummaryBox(pdf, currentY, summaryData);
    currentY += 15;

    // Table headers and data
    const headers = ['ID', 'Date', 'Courier Name', 'Type', 'Amount', 'Status'];
    const columnWidths = [30, 40, 60, 50, 40, 40];
    
    const tableData = deductions.map((deduction) => [
      String(deduction.id || '-'),
      formatDate(deduction.dateOfIncident),
      String(deduction.courierName || '-'),
      String(deduction.type || '-'),
      formatCurrency(deduction.amount),
      String(deduction.status || '-'),
    ]);

    if (tableData.length > 0) {
      drawTable(pdf, currentY, headers, tableData, columnWidths);
    } else {
      // Se não houver dados, mostrar mensagem
      pdf.setFontSize(10);
      pdf.setTextColor(...PDF_COLORS.textDark);
      pdf.text('No data available', margin, currentY);
    }

    // Converter PDF para ArrayBuffer e criar Blob
    const pdfData = pdf.output('arraybuffer');
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

