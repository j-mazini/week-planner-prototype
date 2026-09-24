import type jsPDF from 'jspdf';

let jsPdfCtorPromise: Promise<typeof jsPDF> | null = null;

/**
 * Fetches the BA Express logo from the public folder and returns it as a base64 data URL.
 */
export async function loadLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch('/logo-ba-express.png', { cache: 'no-store' });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
export async function getJsPDFConstructor(): Promise<typeof jsPDF> {
  if (!jsPdfCtorPromise) {
    jsPdfCtorPromise = import('jspdf').then((m) => (m?.default ?? m) as unknown as typeof jsPDF);
  }
  return jsPdfCtorPromise;
}

// Cores padrão do BA Express
export const PDF_COLORS = {
  darkBlue: [30, 58, 138] as [number, number, number],
  lightBlue: [239, 246, 255] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  borderGray: [200, 200, 200] as [number, number, number],
  textGray: [100, 100, 100] as [number, number, number],
  textDark: [50, 50, 50] as [number, number, number],
};

export interface PDFHeaderOptions {
  title: string;
  reportNumber?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
}

/**
 * Cria um PDF com o header padrão do BA Express
 */
export async function createPDFWithHeader(options: PDFHeaderOptions): Promise<jsPDF> {
  const { title, reportNumber, subtitle, orientation = 'landscape', format = 'a4' } = options;

  const JsPDF = await getJsPDFConstructor();
  const pdf: jsPDF = new JsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  const pageWidth = pdf.internal.pageSize.width;
  const margin = 14;

  // Logo e header
  const logoSize = 20;
  pdf.setFillColor(...PDF_COLORS.darkBlue);
  pdf.rect(margin, margin, logoSize, logoSize, 'F');

  pdf.setTextColor(...PDF_COLORS.white);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BA', margin + logoSize / 2, margin + logoSize / 2 + 3, { align: 'center' });

  pdf.setTextColor(...PDF_COLORS.darkBlue);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BA EXPRESS LIMITED', margin + logoSize + 8, margin + 8);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...PDF_COLORS.textGray);
  pdf.text('20 The Laurels', margin + logoSize + 8, margin + 14);
  pdf.text('info@baexpress.co.uk', margin + logoSize + 8, margin + 19);
  pdf.text('VAT: GB238595859', margin + logoSize + 8, margin + 24);

  // Title box
  const titleBoxWidth = 70;
  const titleBoxHeight = subtitle ? 30 : 25;
  const titleBoxX = pageWidth - margin - titleBoxWidth;
  pdf.setFillColor(...PDF_COLORS.lightBlue);
  pdf.roundedRect(titleBoxX, margin, titleBoxWidth, titleBoxHeight, 2, 2, 'F');

  pdf.setTextColor(...PDF_COLORS.darkBlue);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title.toUpperCase(), titleBoxX + titleBoxWidth / 2, margin + 10, { align: 'center' });

  if (reportNumber) {
    pdf.setFontSize(9);
    pdf.text(reportNumber, titleBoxX + titleBoxWidth / 2, margin + 18, { align: 'center' });
  }

  if (subtitle) {
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(subtitle, titleBoxX + titleBoxWidth / 2, margin + 25, { align: 'center' });
  }

  return pdf;
}

/**
 * Adiciona uma caixa de resumo ao PDF
 */
export function addSummaryBox(
  pdf: jsPDF,
  startY: number,
  summaryData: Array<{ label: string; value: string }>
): number {
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 14;
  const detailsBoxWidth = (pageWidth - margin * 3) / 2;
  const detailsBoxHeight = 10 + summaryData.length * 8;

  // Summary box
  pdf.setFillColor(...PDF_COLORS.lightBlue);
  pdf.roundedRect(margin, startY, detailsBoxWidth, detailsBoxHeight, 2, 2, 'F');

  pdf.setFillColor(...PDF_COLORS.darkBlue);
  pdf.roundedRect(margin, startY, detailsBoxWidth, 8, 2, 2, 'F');
  pdf.setTextColor(...PDF_COLORS.white);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary', margin + 5, startY + 5.5);

  pdf.setTextColor(...PDF_COLORS.textDark);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  summaryData.forEach((item, index) => {
    pdf.text(`${item.label}: ${item.value}`, margin + 5, startY + 16 + index * 8);
  });

  return startY + detailsBoxHeight;
}

/**
 * Desenha uma tabela no PDF
 */
export function drawTable(
  pdf: jsPDF,
  startY: number,
  headers: string[],
  data: string[][],
  columnWidths: number[],
  options?: {
    margin?: number;
    rowHeight?: number;
    headerBackground?: [number, number, number];
    headerTextColor?: [number, number, number];
    borderColor?: [number, number, number];
    textColor?: [number, number, number];
  }
): number {
  const {
    margin = 14,
    rowHeight = 8,
    headerBackground = PDF_COLORS.darkBlue,
    headerTextColor = PDF_COLORS.white,
    borderColor = PDF_COLORS.borderGray,
    textColor = PDF_COLORS.textDark,
  } = options || {};

  const pageHeight = pdf.internal.pageSize.height;
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  let currentY = startY;

  // Verificar se precisa de nova página
  if (currentY > pageHeight - 30) {
    pdf.addPage();
    currentY = margin;
  }

  // Cabeçalho da tabela
  pdf.setFillColor(...headerBackground);
  pdf.rect(margin, currentY, totalWidth, rowHeight, 'F');

  pdf.setTextColor(...headerTextColor);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  let x = margin;
  headers.forEach((header, index) => {
    pdf.text(header, x + 3, currentY + 5.5);
    x += columnWidths[index];
    if (index < headers.length - 1) {
      pdf.setDrawColor(...headerTextColor);
      pdf.line(x, currentY + 1, x, currentY + rowHeight - 1);
    }
  });

  currentY += rowHeight;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  // Dados da tabela
  data.forEach((row) => {
    // Verificar se precisa de nova página
    if (currentY + rowHeight > pageHeight - 20) {
      pdf.addPage();
      currentY = margin;
      // Redesenhar cabeçalho
      pdf.setFillColor(...headerBackground);
      pdf.rect(margin, currentY, totalWidth, rowHeight, 'F');
      pdf.setTextColor(...headerTextColor);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      x = margin;
      headers.forEach((header, index) => {
        pdf.text(header, x + 3, currentY + 5.5);
        x += columnWidths[index];
        if (index < headers.length - 1) {
          pdf.setDrawColor(...headerTextColor);
          pdf.line(x, currentY + 1, x, currentY + rowHeight - 1);
        }
      });
      currentY += rowHeight;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
    }

    pdf.setFillColor(...PDF_COLORS.white);
    pdf.rect(margin, currentY, totalWidth, rowHeight, 'F');

    pdf.setDrawColor(...borderColor);
    pdf.rect(margin, currentY, totalWidth, rowHeight);

    pdf.setTextColor(...textColor);
    x = margin;

    row.forEach((cell, cellIndex) => {
      const maxWidth = columnWidths[cellIndex] - 6;
      let text = String(cell);
      if (pdf.getTextWidth(text) > maxWidth) {
        while (pdf.getTextWidth(text + '...') > maxWidth && text.length > 0) {
          text = text.slice(0, -1);
        }
        text += '...';
      }

      pdf.text(text, x + 3, currentY + 5.5);
      x += columnWidths[cellIndex];

      if (cellIndex < row.length - 1) {
        pdf.setDrawColor(...borderColor);
        pdf.line(x, currentY, x, currentY + rowHeight);
      }
    });

    currentY += rowHeight;
  });

  return currentY;
}


