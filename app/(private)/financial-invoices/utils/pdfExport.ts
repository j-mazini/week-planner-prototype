import { createPDFWithHeader, addSummaryBox, drawTable, PDF_COLORS } from '@/lib/pdf-utils';
import type { Invoice } from '../types';
import { formatDate, formatCurrency, getMonthYear } from '../utils';

export async function exportInvoicesToPDF(
  invoices: Invoice[],
  userTypeId: number,
  selectedMonth: Date | null
): Promise<Blob> {
  try {
    const pdf = await createPDFWithHeader({
      title: 'Financial Invoices',
      subtitle: 'Invoices Report',
      orientation: 'landscape',
    });

    const margin = 14;
    let currentY = margin + 40;

    // Summary box
    const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.totalPayment || 0), 0);
    const summaryData = [
      { label: 'Generated', value: new Date().toLocaleDateString('en-GB') },
      { label: 'Total Invoices', value: invoices.length.toString() },
      { label: 'Total Amount', value: formatCurrency(totalAmount.toString()) },
    ];

    if (selectedMonth) {
      const period = getMonthYear(selectedMonth);
      summaryData.push({ label: 'Period', value: `${period.month}/${period.year}` });
    }

    currentY = addSummaryBox(pdf, currentY, summaryData);
    currentY += 15;

    // Table headers and data
    const headers = ['Record ID', 'Vendor', 'Service Partner', 'Period', 'Created On', 'Amount'];
    const columnWidths = [35, 55, 45, 35, 35, 45];

    const tableData = invoices.map((invoice) => [
      String(invoice.invoiceNumber || '-'),
      String(invoice.courier || '-'),
      String(invoice.servicePartnerName || '-'),
      formatDate(invoice.referenceDate),
      formatDate(invoice.invoiceCreatedOn),
      formatCurrency(invoice.totalPayment?.toString() || '0'),
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
