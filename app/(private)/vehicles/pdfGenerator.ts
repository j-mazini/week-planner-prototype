import { Vehicle } from './types';
import { formatDate } from './utils';
import { loadJsPDF } from '@/lib/lazy-imports';

interface PDFGeneratorParams {
  vehicles: Vehicle[];
  statusFilter: string;
  fuelTypeFilter: string;
  searchTerm: string;
}

export const generateVehiclesPDF = async ({
  vehicles,
  statusFilter,
  fuelTypeFilter,
  searchTerm
}: PDFGeneratorParams): Promise<void> => {
  try {
    const JsPDF = await loadJsPDF();
    const doc = new JsPDF();
    
    const darkBlue = [30, 58, 138];
    const lightBlue = [239, 246, 255];
    const white = [255, 255, 255];
    const borderGray = [200, 200, 200];
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    
    // Logo and header
    const logoSize = 20;
    doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.rect(margin, margin, logoSize, logoSize, 'F');
    
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(12);
    doc.setFont(doc.getFont().fontName, 'bold');
    doc.text('BA', margin + logoSize / 2, margin + logoSize / 2 + 3, { align: 'center' });
    
    doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.setFontSize(16);
    doc.setFont(doc.getFont().fontName, 'bold');
    doc.text('BA EXPRESS LIMITED', margin + logoSize + 8, margin + 8);
    
    doc.setFontSize(9);
    doc.setFont(doc.getFont().fontName, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('20 The Laurels', margin + logoSize + 8, margin + 14);
    doc.text('info@baexpress.co.uk', margin + logoSize + 8, margin + 19);
    doc.text('VAT: GB238595859', margin + logoSize + 8, margin + 24);
    
    // Title box
    const titleBoxWidth = 70;
    const titleBoxHeight = 25;
    const titleBoxX = pageWidth - margin - titleBoxWidth;
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.roundedRect(titleBoxX, margin, titleBoxWidth, titleBoxHeight, 2, 2, 'F');
    
    doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.setFontSize(11);
    doc.setFont(doc.getFont().fontName, 'bold');
    doc.text('VEHICLES REPORT', titleBoxX + titleBoxWidth / 2, margin + 10, { align: 'center' });
    
    const reportNumber = `#${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
    doc.setFontSize(9);
    doc.text(reportNumber, titleBoxX + titleBoxWidth / 2, margin + 18, { align: 'center' });
    
    // Summary and filters boxes
    let currentY = margin + logoSize + 15;
    const detailsBoxHeight = 35;
    const detailsBoxWidth = (pageWidth - margin * 3) / 2;
    
    // Summary box
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.roundedRect(margin, currentY, detailsBoxWidth, detailsBoxHeight, 2, 2, 'F');
    
    doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.roundedRect(margin, currentY, detailsBoxWidth, 8, 2, 2, 'F');
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(9);
    doc.setFont(doc.getFont().fontName, 'bold');
    doc.text('Summary', margin + 5, currentY + 5.5);
    
    doc.setTextColor(50, 50, 50);
    doc.setFont(doc.getFont().fontName, 'normal');
    const currentDateStr = new Date().toLocaleDateString('en-GB');
    doc.text(`Generated: ${currentDateStr}`, margin + 5, currentY + 16);
    doc.text(`Total Vehicles: ${vehicles.length}`, margin + 5, currentY + 22);
    
    // Filters box
    const rightBoxX = margin * 2 + detailsBoxWidth;
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.roundedRect(rightBoxX, currentY, detailsBoxWidth, detailsBoxHeight, 2, 2, 'F');
    
    doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.roundedRect(rightBoxX, currentY, detailsBoxWidth, 8, 2, 2, 'F');
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFont(doc.getFont().fontName, 'bold');
    doc.text('Filters', rightBoxX + 5, currentY + 5.5);
    
    doc.setTextColor(50, 50, 50);
    doc.setFont(doc.getFont().fontName, 'normal');
    let filterY = currentY + 16;
    let hasFilters = false;
    
    if (statusFilter !== 'all') {
      doc.text(`Status: ${statusFilter}`, rightBoxX + 5, filterY);
      filterY += 6;
      hasFilters = true;
    }
    if (fuelTypeFilter !== 'all') {
      doc.text(`Fuel Type: ${fuelTypeFilter}`, rightBoxX + 5, filterY);
      filterY += 6;
      hasFilters = true;
    }
    if (searchTerm) {
      doc.text(`Search: ${searchTerm}`, rightBoxX + 5, filterY);
      filterY += 6;
      hasFilters = true;
    }
    if (!hasFilters) {
      doc.text('No filters applied', rightBoxX + 5, filterY);
    }
    
    // Table
    currentY = currentY + detailsBoxHeight + 15;
    const rowHeight = 8;
    const headers = ['VRN', 'Manufacturer', 'Model', 'Registration Date', 'Fuel Type', 'Status'];
    const colWidths = [32, 32, 32, 38, 28, 28];
    const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
    
    let y = currentY;
    doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.rect(margin, y, totalWidth, rowHeight, 'F');
    
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(9);
    doc.setFont(doc.getFont().fontName, 'bold');
    let x = margin;
    headers.forEach((header, index) => {
      doc.text(header, x + 3, y + 5.5);
      x += colWidths[index];
      if (index < headers.length - 1) {
        doc.setDrawColor(white[0], white[1], white[2]);
        doc.line(x, y + 1, x, y + rowHeight - 1);
      }
    });
    
    y += rowHeight;
    doc.setFont(doc.getFont().fontName, 'normal');
    doc.setFontSize(8);
    
    vehicles.forEach((vehicle) => {
      if (y + rowHeight > pageHeight - 20) {
        doc.addPage();
        y = margin;
        
        doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        doc.rect(margin, y, totalWidth, rowHeight, 'F');
        doc.setTextColor(white[0], white[1], white[2]);
        doc.setFont(doc.getFont().fontName, 'bold');
        x = margin;
        headers.forEach((header, headerIndex) => {
          doc.text(header, x + 3, y + 5.5);
          x += colWidths[headerIndex];
          if (headerIndex < headers.length - 1) {
            doc.setDrawColor(white[0], white[1], white[2]);
            doc.line(x, y + 1, x, y + rowHeight - 1);
          }
        });
        y += rowHeight;
        doc.setFont(doc.getFont().fontName, 'normal');
      }
      
      doc.setFillColor(white[0], white[1], white[2]);
      doc.rect(margin, y, totalWidth, rowHeight, 'F');
      
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(margin, y, totalWidth, rowHeight);
      
      doc.setTextColor(50, 50, 50);
      x = margin;
      const rowData = [
        vehicle.vrn || '-',
        vehicle.brand || '-',
        vehicle.model || '-',
        formatDate(vehicle.registrationDate),
        vehicle.fuelType || '-',
        vehicle.status || '-'
      ];
      
      rowData.forEach((cell, cellIndex) => {
        const maxWidth = colWidths[cellIndex] - 6;
        let text = String(cell);
        if (doc.getTextWidth(text) > maxWidth) {
          while (doc.getTextWidth(text + '...') > maxWidth && text.length > 0) {
            text = text.slice(0, -1);
          }
          text += '...';
        }
        
        doc.text(text, x + 3, y + 5.5);
        x += colWidths[cellIndex];
        
        if (cellIndex < rowData.length - 1) {
          doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
          doc.line(x, y, x, y + rowHeight);
        }
      });
      
      y += rowHeight;
    });
    
    const filename = `vehicles-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

