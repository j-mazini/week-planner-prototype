import { PDF_COLORS } from '@/lib/pdf-utils';
import type jsPDF from 'jspdf';
import type { AdhocWorksDTO } from '@/lib/adhoc-works-api';

function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format date string yyyy-MM-dd as "dd MMM yyyy" without timezone shift (parse as local date). */
function formatDateOnly(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const part = String(dateStr).trim().split("T")[0];
    const [y, m, d] = part.split("-").map(Number);
    if (!y || !m || !d) return "—";
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return "—";
    const day = String(d).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${monthNames[m - 1]} ${y}`;
  } catch {
    return "—";
  }
}

export async function exportAdhocWorksToPDF(
  data: AdhocWorksDTO[],
  weekStart: Date,
  weekEnd: Date
): Promise<Blob> {
  try {
    // Criar PDF sem header primeiro para aplicar background
    const JsPDFModule = await import('jspdf');
    const JsPDF = (JsPDFModule?.default ?? JsPDFModule) as typeof jsPDF;
    const pdf = new JsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 14;

    // Background gradiente suave (simulando o efeito das páginas)
    // Gradiente diagonal: slate-50 -> slate-100 -> slate-50
    const bgSoft = [248, 250, 252]; // slate-50
    const bgMedium = [241, 245, 249]; // slate-100
    
    // Criar gradiente diagonal usando múltiplas camadas
    const gradientSteps = 30;
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / (gradientSteps - 1);
      // Gradiente diagonal de canto superior esquerdo para inferior direito
      const diagonalRatio = (ratio * 0.7) + ((1 - ratio) * 0.3);
      const r = Math.round(bgSoft[0] + (bgMedium[0] - bgSoft[0]) * Math.sin(diagonalRatio * Math.PI));
      const g = Math.round(bgSoft[1] + (bgMedium[1] - bgSoft[1]) * Math.sin(diagonalRatio * Math.PI));
      const b = Math.round(bgSoft[2] + (bgMedium[2] - bgSoft[2]) * Math.sin(diagonalRatio * Math.PI));
      pdf.setFillColor(r, g, b);
      pdf.rect(0, (pageHeight / gradientSteps) * i, pageWidth, pageHeight / gradientSteps, 'F');
    }

    // Adicionar gradientes radiais sutis para efeito de profundidade (simulando blur)
    const radialGradient1 = [99, 102, 241]; // indigo-500
    const radialGradient2 = [236, 72, 153]; // pink-500
    const radialGradient3 = [14, 165, 233]; // sky-500
    
    // Criar círculos radiais suaves (simulando blur com múltiplas camadas)
    const createRadialGradient = (x: number, y: number, radius: number, color: number[]) => {
      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const currentRadius = (radius * i) / steps;
        const blendRatio = i / steps;
        const r = Math.round(color[0] * (1 - blendRatio) + bgSoft[0] * blendRatio);
        const g = Math.round(color[1] * (1 - blendRatio) + bgSoft[1] * blendRatio);
        const b = Math.round(color[2] * (1 - blendRatio) + bgSoft[2] * blendRatio);
        pdf.setFillColor(r, g, b);
        pdf.circle(x, y, currentRadius, 'F');
      }
    };

    // Adicionar blobs radiais sutis em posições estratégicas (simulando os gradientes das páginas)
    createRadialGradient(pageWidth * 0.18, pageHeight * 0.22, 35, radialGradient1);
    createRadialGradient(pageWidth * 0.82, pageHeight * 0.12, 30, radialGradient2);
    createRadialGradient(pageWidth * 0.72, pageHeight * 0.78, 32, radialGradient3);

    // Desenhar header com efeito translúcido (glass effect)
    const logoSize = 20;
    const headerHeight = 28;
    
    // Container do header com efeito glass (background translúcido)
    const glassHeaderBg = [255, 255, 255]; // Branco base
    const glassHeaderBgLight = [250, 252, 255]; // Branco com leve tom azul
    
    // Gradiente suave no header
    for (let i = 0; i < headerHeight; i++) {
      const ratio = i / headerHeight;
      const r = Math.round(glassHeaderBg[0] + (glassHeaderBgLight[0] - glassHeaderBg[0]) * ratio);
      const g = Math.round(glassHeaderBg[1] + (glassHeaderBgLight[1] - glassHeaderBg[1]) * ratio);
      const b = Math.round(glassHeaderBg[2] + (glassHeaderBgLight[2] - glassHeaderBg[2]) * ratio);
      pdf.setFillColor(r, g, b);
      pdf.rect(0, margin + i, pageWidth, 1, 'F');
    }
    
    // Borda removida do container do header conforme solicitado

    // Logo BA com efeito glass
    pdf.setFillColor(...PDF_COLORS.darkBlue);
    pdf.roundedRect(margin, margin, logoSize, logoSize, 2, 2, 'F');
    
    // Borda sutil no logo
    pdf.setDrawColor(59, 130, 246); // blue-500
    pdf.setLineWidth(0.2);
    pdf.roundedRect(margin, margin, logoSize, logoSize, 2, 2, 'S');

    pdf.setTextColor(...PDF_COLORS.white);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BA', margin + logoSize / 2, margin + logoSize / 2 + 3, { align: 'center' });

    // Informações da empresa - ajustar para não vazar
    const companyInfoX = margin + logoSize + 8;
    const maxCompanyInfoWidth = pageWidth - margin * 2 - logoSize - 8 - 75; // Deixar espaço para title box
    
    pdf.setTextColor(...PDF_COLORS.darkBlue);
    pdf.setFontSize(14); // Reduzido de 16 para 14
    pdf.setFont('helvetica', 'bold');
    const companyName = 'BA EXPRESS LIMITED';
    const companyNameWidth = pdf.getTextWidth(companyName) || 0;
    if (companyNameWidth > maxCompanyInfoWidth) {
      pdf.setFontSize(12);
    }
    pdf.text(companyName, companyInfoX, margin + 8);

    pdf.setFontSize(8); // Reduzido de 9 para 8
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...PDF_COLORS.textGray);
    pdf.text('20 The Laurels', companyInfoX, margin + 14);
    pdf.text('info@baexpress.co.uk', companyInfoX, margin + 19);
    pdf.text('VAT: GB238595859', companyInfoX, margin + 24);

    // Title box - sem background e sem borda
    const titleBoxWidth = 75;
    const titleBoxX = pageWidth - margin - titleBoxWidth;
    
    // Background e borda removidos conforme solicitado

    pdf.setTextColor(...PDF_COLORS.darkBlue);
    pdf.setFontSize(9); // Reduzido de 11 para 9
    pdf.setFont('helvetica', 'bold');
    // Quebrar título em duas linhas se necessário
    const titleText = 'ADHOC WORKS INVOICE MANAGEMENT';
    const titleWidth = pdf.getTextWidth(titleText) || 0;
    if (titleWidth > titleBoxWidth - 6) {
      // Dividir em duas linhas
      pdf.text('ADHOC WORKS', titleBoxX + titleBoxWidth / 2, margin + 8, { align: 'center' });
      pdf.text('INVOICE MANAGEMENT', titleBoxX + titleBoxWidth / 2, margin + 13, { align: 'center' });
    } else {
      pdf.text(titleText, titleBoxX + titleBoxWidth / 2, margin + 10, { align: 'center' });
    }

    pdf.setFontSize(7); // Reduzido de 8 para 7
    pdf.setFont('helvetica', 'normal');
    pdf.text('Adhoc Works Report', titleBoxX + titleBoxWidth / 2, margin + 27, { align: 'center' });

    let currentY = margin + headerHeight + 15;

    // Calculate totals
    const totalReceived = data.reduce(
      (s, r) => s + (r.adhocService.adhocReceivedPayment ?? 0),
      0
    );
    const totalVendor = data.reduce(
      (s, r) => s + (r.adhocService.adhocVendorPayment ?? 0),
      0
    );

    // Format period string
    const formatDateShort = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    };
    const periodStr = `${formatDateShort(weekStart)} - ${formatDateShort(weekEnd)} ${weekStart.getFullYear()}`;

    // Summary box com efeito translúcido (glass effect)
    const summaryData = [
      { label: 'Generated', value: new Date().toLocaleDateString('en-GB') },
      { label: 'Period', value: periodStr },
      { label: 'Total Records', value: data.length.toString() },
      { label: 'Total Received Payment', value: `£${formatCurrency(totalReceived)}` },
      { label: 'Total Vendor Payment', value: `£${formatCurrency(totalVendor)}` },
    ];

    // Criar summary box customizado com efeito glass
    const detailsBoxWidth = (pageWidth - margin * 3) / 2;
    const detailsBoxHeight = 10 + summaryData.length * 8;
    
    // Background translúcido (branco com leve tom azul)
    const glassBg = [255, 255, 255]; // Branco base
    const glassBgLight = [250, 252, 255]; // Branco com leve tom azul
    
    // Gradiente suave no box (simulando translucidez)
    for (let i = 0; i < detailsBoxHeight; i++) {
      const ratio = i / detailsBoxHeight;
      const r = Math.round(glassBg[0] + (glassBgLight[0] - glassBg[0]) * ratio);
      const g = Math.round(glassBg[1] + (glassBgLight[1] - glassBg[1]) * ratio);
      const b = Math.round(glassBg[2] + (glassBgLight[2] - glassBg[2]) * ratio);
      pdf.setFillColor(r, g, b);
      pdf.rect(margin, currentY + i, detailsBoxWidth, 1, 'F');
    }
    
    // Borda sutil para efeito glass
    const borderColor = [226, 232, 240]; // slate-200
    pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin, currentY, detailsBoxWidth, detailsBoxHeight, 3, 3, 'S');
    
    // Header do box com gradiente
    const headerGradient = [239, 246, 255]; // blue-50
    pdf.setFillColor(headerGradient[0], headerGradient[1], headerGradient[2]);
    pdf.roundedRect(margin, currentY, detailsBoxWidth, 8, 3, 3, 'F');
    
    // Borda superior do header
    pdf.setDrawColor(59, 130, 246); // blue-500
    pdf.setLineWidth(0.2);
    pdf.line(margin, currentY + 8, margin + detailsBoxWidth, currentY + 8);
    
    pdf.setTextColor(...PDF_COLORS.darkBlue);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', margin + 5, currentY + 5.5);

    pdf.setTextColor(...PDF_COLORS.textDark);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7); // Reduzido de 8 para 7
    summaryData.forEach((item, index) => {
      const label = item.label || '';
      const value = item.value || '';
      const fullText = `${label}: ${value}`;
      const maxTextWidth = detailsBoxWidth - 10;
      const textWidth = pdf.getTextWidth(fullText) || 0;
      
      if (textWidth > maxTextWidth) {
        // Truncar texto se necessário
        let truncatedText = fullText;
        while (pdf.getTextWidth(truncatedText) !== undefined && (pdf.getTextWidth(truncatedText) || 0) > maxTextWidth && truncatedText.length > 0) {
          truncatedText = truncatedText.slice(0, -1);
        }
        pdf.text(truncatedText + '...', margin + 5, currentY + 16 + index * 8);
      } else {
        pdf.text(fullText, margin + 5, currentY + 16 + index * 8);
      }
    });

    currentY += detailsBoxHeight + 15;

    // Table headers and data - ajustar larguras para evitar overflow
    const headers = ['Date', 'Vendor', 'Service Partner', 'Depot', 'Route', 'Adhoc Service', 'Service Type', 'Received', 'Vendor'];
    // Ajustar larguras: reduzir algumas e aumentar outras para melhor distribuição
    const columnWidths = [20, 32, 28, 24, 28, 32, 24, 28, 28];

    const tableData = data.map((row) => [
      formatDateOnly(row.operation?.date),
      String(row.fullName || "—"),
      String(row.servicePartnerName ?? "—"),
      String(row.operation?.depot ?? "—"),
      String(row.operation?.routeName ?? "—"),
      String(row.adhocService?.adhocName ?? "—"),
      String(row.adhocCategory?.name ?? "—"),
      `£${formatCurrency(row.adhocService?.adhocReceivedPayment)}`,
      `£${formatCurrency(row.adhocService?.adhocVendorPayment)}`,
    ]);

    if (tableData.length > 0) {
      // Desenhar tabela com efeito translúcido
      const rowHeight = 8;
      const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      
      // Header da tabela com gradiente
      const headerGradient = [239, 246, 255]; // blue-50
      pdf.setFillColor(headerGradient[0], headerGradient[1], headerGradient[2]);
      pdf.roundedRect(margin, currentY, totalWidth, rowHeight, 2, 2, 'F');
      
    // Borda do header
    const tableBorderColor = [226, 232, 240]; // slate-200
    pdf.setDrawColor(tableBorderColor[0], tableBorderColor[1], tableBorderColor[2]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, currentY, totalWidth, rowHeight, 2, 2, 'S');
      
      pdf.setTextColor(...PDF_COLORS.darkBlue);
      pdf.setFontSize(8); // Reduzido de 9 para 8
      pdf.setFont('helvetica', 'bold');
      let x = margin;
      headers.forEach((header, index) => {
        const headerText = String(header || '');
        const maxHeaderWidth = columnWidths[index] - 6;
        const headerWidth = pdf.getTextWidth(headerText) || 0;
        
        if (headerWidth > maxHeaderWidth) {
          // Reduzir fonte do header se necessário
          pdf.setFontSize(7);
          pdf.text(headerText, x + 2, currentY + 5.5);
          pdf.setFontSize(8);
        } else {
          pdf.text(headerText, x + 2, currentY + 5.5);
        }
        x += columnWidths[index];
        if (index < headers.length - 1) {
          pdf.setDrawColor(tableBorderColor[0], tableBorderColor[1], tableBorderColor[2]);
          pdf.line(x, currentY + 1, x, currentY + rowHeight - 1);
        }
      });

      currentY += rowHeight;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7); // Reduzido de 8 para 7

      // Dados da tabela com linhas alternadas (efeito translúcido)
      tableData.forEach((row, rowIndex) => {
        // Background alternado para efeito translúcido
        if (rowIndex % 2 === 0) {
          const rowBg = [255, 255, 255]; // Branco
          pdf.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        } else {
          const rowBg = [248, 250, 252]; // slate-50 (muito sutil)
          pdf.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        }
        pdf.rect(margin, currentY, totalWidth, rowHeight, 'F');

        // Borda da linha
        pdf.setDrawColor(tableBorderColor[0], tableBorderColor[1], tableBorderColor[2]);
        pdf.setLineWidth(0.2);
        pdf.rect(margin, currentY, totalWidth, rowHeight);

        pdf.setTextColor(...PDF_COLORS.textDark);
        x = margin;

        row.forEach((cell, cellIndex) => {
          const maxWidth = columnWidths[cellIndex] - 4; // Reduzido padding de 6 para 4
          let text = String(cell);
          const textWidth = pdf.getTextWidth(text);
          
          if (textWidth !== undefined && textWidth > maxWidth) {
            // Truncar texto mais agressivamente
            while (text.length > 0) {
              const testText = text + '...';
              const testWidth = pdf.getTextWidth(testText);
              if (testWidth !== undefined && testWidth > maxWidth) {
                text = text.slice(0, -1);
              } else {
                break;
              }
            }
            if (text.length > 0) {
              text += '...';
            } else {
              text = '...';
            }
          }

          pdf.text(String(text || ''), x + 2, currentY + 5.5); // Reduzido padding de 3 para 2
          x += columnWidths[cellIndex];

          if (cellIndex < row.length - 1) {
            pdf.setDrawColor(tableBorderColor[0], tableBorderColor[1], tableBorderColor[2]);
            pdf.line(x, currentY, x, currentY + rowHeight);
          }
        });

        currentY += rowHeight;
      });
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


