'use client';

import React, { useState, useCallback } from 'react';
import { hasAuthSession, getBearerAuthHeader } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { StyledButton } from '@/components/styled-button';
import { Download, FileSpreadsheet, FileText, File, ChevronDown } from 'lucide-react';
import { loadJsPDF, loadXlsx } from '@/lib/lazy-imports';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type ExportFormat = 'xlsx' | 'pdf' | 'csv';

export interface ExportButtonProps {
  /** API URL for export. If not provided, the onExport function will be used */
  exportUrl?: string;
  /** Default filename (without extension) */
  filename?: string;
  /** Export format (for compatibility, but now always shows dropdown) */
  format?: ExportFormat;
  /** Custom export function. Receives the format and returns data or a blob */
  onExport?: (format: ExportFormat) => Promise<Blob | ArrayBuffer | Record<string, unknown>[] | null>;
  /** Data for local export (when not using API) */
  data?: Record<string, unknown>[];
  /** Headers/columns for local data export */
  columns?: { key: string; label: string }[];
  /** Additional parameters for the request */
  queryParams?: Record<string, string | string[]>;
  /** Additional CSS class for the button */
  className?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Button text */
  label?: string;
  /** Callback when export is successful */
  onSuccess?: (format: ExportFormat) => void;
  /** Callback when an error occurs */
  onError?: (error: Error, format: ExportFormat) => void;
  /** Whether to show only Excel and PDF (hides CSV) */
  showOnlyExcelAndPdf?: boolean;
  /** If there are active filters, shows a warning before exporting */
  hasActiveFilters?: boolean;
  /** Title shown in the PDF report header (e.g. "Vendor Types", "Cost Models") */
  reportTitle?: string;
}

const formatConfig: Record<ExportFormat, { label: string; icon: React.ReactNode; mimeType: string; extension: string }> = {
  xlsx: {
    label: 'Excel (XLSX)',
    icon: <FileSpreadsheet className="size-4" />,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
  },
  pdf: {
    label: 'PDF',
    icon: <FileText className="size-4" />,
    mimeType: 'application/pdf',
    extension: 'pdf',
  },
  csv: {
    label: 'CSV',
    icon: <File className="size-4" />,
    mimeType: 'text/csv',
    extension: 'csv',
  },
};

export const ExportButton: React.FC<ExportButtonProps> = ({
  exportUrl,
  filename = 'export',
  format: _format = 'xlsx',
  onExport,
  data,
  columns,
  queryParams,
  className,
  variant = 'outline',
  size = 'default',
  label = 'Export',
  onSuccess,
  onError,
  showOnlyExcelAndPdf = true,
  hasActiveFilters = false,
  reportTitle = 'EXPORT REPORT',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showFilterWarning, setShowFilterWarning] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);

  const downloadFile = useCallback((blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, []);

  const exportToXLSX = useCallback(async (dataToExport: Record<string, unknown>[], columnsToUse: { key: string; label: string }[]) => {
    const XLSX = await loadXlsx();
    // Preparar dados para Excel
    const worksheetData = dataToExport.map((row) => {
      const newRow: Record<string, unknown> = {};
      columnsToUse.forEach((col) => {
        newRow[col.label] = row[col.key] ?? '';
      });
      return newRow;
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    // Add column widths for spacing between columns
    if (columnsToUse.length > 0) {
      ws['!cols'] = columnsToUse.map(() => ({ wch: 18 }));
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Converter para blob
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: formatConfig.xlsx.mimeType });
  }, []);

  const exportToPDF = useCallback(async (
    dataToExport: Record<string, unknown>[],
    columnsToUse: { key: string; label: string }[],
    title?: string
  ) => {
    const JsPDF = await loadJsPDF();
    const pdf = new JsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Colors - matching week-planner style
    const darkBlue = [30, 58, 138];
    const lightBlue = [239, 246, 255];
    const white = [255, 255, 255];
    const borderGray = [200, 200, 200];

    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 14;
    const rowHeight = 8;

    // Logo and header
    const logoSize = 20;
    pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    pdf.rect(margin, margin, logoSize, logoSize, 'F');

    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.setFontSize(12);
    pdf.setFont(pdf.getFont().fontName, 'bold');
    pdf.text('BA', margin + logoSize / 2, margin + logoSize / 2 + 3, { align: 'center' });

    pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    pdf.setFontSize(16);
    pdf.setFont(pdf.getFont().fontName, 'bold');
    pdf.text('BA EXPRESS LIMITED', margin + logoSize + 8, margin + 8);

    pdf.setFontSize(9);
    pdf.setFont(pdf.getFont().fontName, 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('20 The Laurels', margin + logoSize + 8, margin + 14);
    pdf.text('info@baexpress.co.uk', margin + logoSize + 8, margin + 19);
    pdf.text('VAT: GB238595859', margin + logoSize + 8, margin + 24);

    // Title box
    const titleBoxWidth = 70;
    const titleBoxHeight = 25;
    const titleBoxX = pageWidth - margin - titleBoxWidth;
    pdf.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    pdf.roundedRect(titleBoxX, margin, titleBoxWidth, titleBoxHeight, 2, 2, 'F');

    pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    pdf.setFontSize(11);
    pdf.setFont(pdf.getFont().fontName, 'bold');
    pdf.text(title ?? reportTitle, titleBoxX + titleBoxWidth / 2, margin + 10, { align: 'center' });

    const currentDateStr = new Date().toLocaleDateString('en-GB');
    pdf.setFontSize(9);
    pdf.text(`Generated: ${currentDateStr}`, titleBoxX + titleBoxWidth / 2, margin + 18, { align: 'center' });

    // Summary box
    let currentY = margin + logoSize + 15;
    const detailsBoxHeight = 20;
    const detailsBoxWidth = pageWidth - margin * 2;

    pdf.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    pdf.roundedRect(margin, currentY, detailsBoxWidth, detailsBoxHeight, 2, 2, 'F');

    pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    pdf.roundedRect(margin, currentY, detailsBoxWidth, 8, 2, 2, 'F');
    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.setFontSize(9);
    pdf.setFont(pdf.getFont().fontName, 'bold');
    pdf.text('Summary', margin + 5, currentY + 5.5);

    pdf.setTextColor(50, 50, 50);
    pdf.setFont(pdf.getFont().fontName, 'normal');
    pdf.text(`Generated: ${currentDateStr}`, margin + 5, currentY + 16);
    pdf.text(`Total Records: ${dataToExport.length}`, margin + 5 + 60, currentY + 16);

    // Table
    currentY = currentY + detailsBoxHeight + 15;

    // Calculate column widths
    const numColumns = columnsToUse.length;
    const availableWidth = pageWidth - 2 * margin;
    const baseColumnWidth = availableWidth / numColumns;
    const columnWidths = columnsToUse.map(() => baseColumnWidth);
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

    // Helper function to render table headers
    const renderTableHeaders = (y: number) => {
      pdf.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      pdf.rect(margin, y, totalWidth, rowHeight, 'F');

      pdf.setTextColor(white[0], white[1], white[2]);
      pdf.setFontSize(9);
      pdf.setFont(pdf.getFont().fontName, 'bold');
      let x = margin;
      columnsToUse.forEach((col, index) => {
        pdf.text(col.label, x + 3, y + 5.5);
        x += columnWidths[index];
        if (index < columnsToUse.length - 1) {
          pdf.setDrawColor(white[0], white[1], white[2]);
          pdf.line(x, y + 1, x, y + rowHeight - 1);
        }
      });
    };

    // Render table headers
    if (currentY > pageHeight - 30) {
      pdf.addPage();
      currentY = margin;
    }
    renderTableHeaders(currentY);
    currentY += rowHeight;

    // Render data rows
    pdf.setFont(pdf.getFont().fontName, 'normal');
    pdf.setFontSize(8);
    dataToExport.forEach((row) => {
      // Check if we need a new page
      if (currentY + rowHeight > pageHeight - 20) {
        pdf.addPage();
        currentY = margin;
        renderTableHeaders(currentY);
        currentY += rowHeight;
        pdf.setFont(pdf.getFont().fontName, 'normal');
        pdf.setFontSize(8);
      }

      pdf.setFillColor(white[0], white[1], white[2]);
      pdf.rect(margin, currentY, totalWidth, rowHeight, 'F');

      pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      pdf.rect(margin, currentY, totalWidth, rowHeight);

      pdf.setTextColor(50, 50, 50);
      let x = margin;

      columnsToUse.forEach((col, index) => {
        const cellValue = String(row[col.key] ?? '');
        const maxWidth = columnWidths[index] - 6;
        let text = cellValue;
        
        // Truncate if too long
        if (pdf.getTextWidth(text) > maxWidth) {
          while (pdf.getTextWidth(text + '...') > maxWidth && text.length > 0) {
            text = text.slice(0, -1);
          }
          text += '...';
        }

        pdf.text(text, x + 3, currentY + 5.5);
        x += columnWidths[index];

        if (index < columnsToUse.length - 1) {
          pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
          pdf.line(x, currentY, x, currentY + rowHeight);
        }
      });

      currentY += rowHeight;
    });

    return pdf.output('blob');
  }, [reportTitle]);

  const exportToCSV = useCallback((dataToExport: Record<string, unknown>[], columnsToUse: { key: string; label: string }[]) => {
    // Create header
    const headers = columnsToUse.map((col) => col.label).join(',');
    
    // Create data rows
    const rows = dataToExport.map((row) => {
      return columnsToUse.map((col) => {
        const value = row[col.key] ?? '';
        // Escapar vírgulas e aspas em valores CSV
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    // Combinar tudo
    const csvContent = [headers, ...rows].join('\n');
    
    // Add BOM for Excel to recognize UTF-8
    const BOM = '\uFEFF';
    return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  }, []);


  const executeExport = useCallback(async (selectedFormat: ExportFormat) => {
    try {
      setIsExporting(true);
      const config = formatConfig[selectedFormat];

      let blob: Blob | null = null;

      // Se houver função customizada, usar ela primeiro
      if (onExport) {
        const result = await onExport(selectedFormat);
        if (result !== null && result !== undefined) {
          if (result instanceof Blob) {
            blob = result;
          } else if (result instanceof ArrayBuffer) {
            blob = new Blob([result], { type: config.mimeType });
          } else if (Array.isArray(result)) {
            // Se retornou um array, processar localmente
            // Generate columns automatically based on the keys of the first object
            if (result.length > 0 && typeof result[0] === 'object') {
              const firstRow = result[0];
              const autoColumns = Object.keys(firstRow).map(key => ({
                key,
                label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
              }));
              
              switch (selectedFormat) {
                case 'xlsx':
                  blob = await exportToXLSX(result, autoColumns);
                  break;
                case 'pdf':
                  blob = await exportToPDF(result, autoColumns, reportTitle);
                  break;
                case 'csv':
                  blob = exportToCSV(result, autoColumns);
                  break;
                default:
                  throw new Error(`Format ${selectedFormat} not supported`);
              }
            } else if (result.length === 0) {
              // Empty array - create empty file or with message
              // For empty arrays, create a file with a line indicating no data available
              const emptyData = [{ message: 'No data available' }];
              const emptyColumns = [{ key: 'message', label: 'Message' }];
              
              switch (selectedFormat) {
                case 'xlsx':
                  blob = await exportToXLSX(emptyData, emptyColumns);
                  break;
                case 'pdf':
                  blob = await exportToPDF(emptyData, emptyColumns, reportTitle);
                  break;
                case 'csv':
                  blob = exportToCSV(emptyData, emptyColumns);
                  break;
                default:
                  throw new Error(`Format ${selectedFormat} not supported`);
              }
            } else {
              throw new Error('onExport returned an array with invalid format');
            }
          } else {
            throw new Error('onExport must return a Blob, ArrayBuffer, array or null');
          }
        }
        // Se result for null/undefined, blob permanece null e continuamos para tentar exportUrl
      }
      
      // Se já temos um blob, fazer download e retornar
      if (blob) {
        const fileName = `${filename}.${config.extension}`;
        downloadFile(blob, fileName);
        onSuccess?.(selectedFormat);
        return;
      }

      // If there is local data and columns, export locally (when there is no onExport or onExport returned null)
      if (!onExport && data && columns && columns.length > 0) {
        switch (selectedFormat) {
          case 'xlsx':
            blob = await exportToXLSX(data, columns);
            break;
          case 'pdf':
            blob = await exportToPDF(data, columns, reportTitle);
            break;
          case 'csv':
            blob = exportToCSV(data, columns);
            break;
          default:
            throw new Error(`Format ${selectedFormat} not supported for local export`);
        }
        
        const fileName = `${filename}.${config.extension}`;
        downloadFile(blob, fileName);
        onSuccess?.(selectedFormat);
        return;
      }
      
      // If there is an API URL, make a request (when onExport returned null or there is no onExport)
      if (exportUrl) {
        if (!hasAuthSession()) {
          throw new Error('Authentication token not available');
        }

        // Construir URL com parâmetros
        const url = new URL(exportUrl, window.location.origin);
        if (queryParams) {
          Object.entries(queryParams).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach(v => url.searchParams.append(key, v));
            } else {
              url.searchParams.append(key, value);
            }
          });
        }

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            ...getBearerAuthHeader(),
            'Accept': config.mimeType,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Export failed: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        
        if (arrayBuffer.byteLength === 0) {
          throw new Error('No data available for download');
        }

        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = `${filename}.${config.extension}`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            fileName = filenameMatch[1].replace(/['"]/g, '');
          }
        }

        blob = new Blob([arrayBuffer], { type: config.mimeType });
        downloadFile(blob, fileName);
        
        onSuccess?.(selectedFormat);
        return;
      } else {
        throw new Error('Must provide exportUrl, onExport or data+columns');
      }
    } catch (error) {
      console.error(`Error exporting to ${selectedFormat}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error exporting: ${errorMessage}`);
      onError?.(error instanceof Error ? error : new Error(errorMessage), selectedFormat);
    } finally {
      setIsExporting(false);
    }
  }, [exportUrl, filename, onExport, data, columns, queryParams, exportToXLSX, exportToPDF, exportToCSV, downloadFile, onSuccess, onError, reportTitle]);

  const handleFormatExport = useCallback(async (selectedFormat: ExportFormat) => {
    // If there are active filters, show warning first
    if (hasActiveFilters) {
      setPendingFormat(selectedFormat);
      setShowFilterWarning(true);
      return;
    }

    await executeExport(selectedFormat);
  }, [hasActiveFilters, executeExport]);

  const handleConfirmExport = useCallback(() => {
    setShowFilterWarning(false);
    if (pendingFormat) {
      executeExport(pendingFormat);
      setPendingFormat(null);
    }
  }, [pendingFormat, executeExport]);

  const handleCancelExport = useCallback(() => {
    setShowFilterWarning(false);
    setPendingFormat(null);
  }, []);

  // Check if using Bootstrap (when className contains 'btn')
  const useBootstrap = className?.includes('btn');

  const formatsToShow: ExportFormat[] = showOnlyExcelAndPdf 
    ? ['xlsx', 'pdf'] 
    : ['xlsx', 'pdf', 'csv'];

  return (
    <>
      <Dialog open={showFilterWarning} onOpenChange={setShowFilterWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filters Active</DialogTitle>
            <DialogDescription>
              You have filters active. The data will be exported with the filters applied.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="glass" onClick={handleCancelExport}>
              Cancel
            </Button>
            <Button variant="glass" onClick={handleConfirmExport}>
              Continue Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {useBootstrap ? (
        (() => {
          // Determinar variante baseado na className
          const isOutline = className?.includes('outline');
          const buttonVariant: 'primary' | 'outline-secondary' = isOutline ? 'outline-secondary' : 'primary';
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <StyledButton
                  variant={buttonVariant}
                  size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
                  disabled={isExporting}
                  useBootstrap={true}
                  className={className}
                >
                  {isExporting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download"></i> {label} <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </StyledButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {formatsToShow.map((fmt) => {
                  const config = formatConfig[fmt];
                  return (
                    <DropdownMenuItem
                      key={fmt}
                      onClick={() => handleFormatExport(fmt)}
                      disabled={isExporting}
                      className="cursor-pointer"
                    >
                      {config.icon}
                      <span className="ml-2">{config.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })()
      ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={className}
          variant={variant}
          size={size}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {label}
              <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formatsToShow.map((fmt) => {
          const config = formatConfig[fmt];
          return (
            <DropdownMenuItem
              key={fmt}
              onClick={() => handleFormatExport(fmt)}
              disabled={isExporting}
              className="cursor-pointer"
            >
              {config.icon}
              <span className="ml-2">{config.label}</span>
            </DropdownMenuItem>
          );
        })}
        </DropdownMenuContent>
    </DropdownMenu>
      )}
    </>
  );
};

export default ExportButton;

