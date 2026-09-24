import { createPDFWithHeader, addSummaryBox, drawTable, PDF_COLORS } from '@/lib/pdf-utils';

interface InvoiceItem {
  id: number;
  recordId: string;
  subcontractor: string;
  period: string;
  amount: number;
  status: string;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export async function exportInvoicesToPDF(
  invoices: InvoiceItem[],
  periodFilter: string,
  statusFilter: string,
  searchTerm: string
): Promise<Blob> {
  try {
    const pdf = await createPDFWithHeader({
      title: 'Invoice Processing',
      subtitle: 'Invoice Report',
      orientation: 'landscape',
    });

    const margin = 14;
    let currentY = margin + 40;

    // Summary box
    const totalAmount = invoices.reduce((sum, item) => sum + (item.amount || 0), 0);
    const pendingVerification = invoices
      .filter((item) => item.status === 'Pending Verification' || item.status === 'Pending')
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    const readyForInvoicing = invoices
      .filter((item) => item.status === 'Ready for Invoicing' || item.status === 'Approved')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const summaryData = [
      { label: 'Generated', value: new Date().toLocaleDateString('en-GB') },
      { label: 'Total Invoices', value: invoices.length.toString() },
      { label: 'Total Amount', value: CURRENCY_FORMATTER.format(totalAmount) },
      { label: 'Pending Verification', value: CURRENCY_FORMATTER.format(pendingVerification) },
      { label: 'Ready for Invoicing', value: CURRENCY_FORMATTER.format(readyForInvoicing) },
    ];

    if (periodFilter !== 'all') {
      summaryData.push({ label: 'Period Filter', value: periodFilter });
    }
    if (statusFilter !== 'all') {
      summaryData.push({ label: 'Status Filter', value: statusFilter });
    }
    if (searchTerm) {
      summaryData.push({ label: 'Search Term', value: searchTerm });
    }

    currentY = addSummaryBox(pdf, currentY, summaryData);
    currentY += 15;

    // Table headers and data
    const headers = ['Record ID', 'Vendor', 'Period', 'Amount', 'Status'];
    const columnWidths = [40, 60, 40, 50, 50];
    
    const tableData = invoices.map((invoice) => [
      String(invoice.recordId || '-'),
      String(invoice.subcontractor || '-'),
      String(invoice.period || '-'),
      CURRENCY_FORMATTER.format(invoice.amount || 0),
      String(invoice.status || '-'),
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

