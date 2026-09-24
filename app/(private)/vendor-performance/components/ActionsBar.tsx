"use client";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { memo, useMemo } from 'react';
import ExportButton from '@/components/export-button';
import type { ProcessedVendor } from '../utils';
import { createPDFWithHeader, addSummaryBox, drawTable, PDF_COLORS } from '@/lib/pdf-utils';
import type { PerformancePeriodOption } from '../hooks/useAvailablePerformancePeriods';
import { MonthYearSelect } from './MonthYearSelect';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

interface ActionsBarProps {
  tableYear: number;
  tableMonth: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onDateChange: (year: number, month: number) => void;
  vendors?: ProcessedVendor[];
  availablePeriods: PerformancePeriodOption[];
  periodsLoading?: boolean;
  /** When false, only show month selector (no search, no export). Used when no depot selected. */
  showSearchAndExport?: boolean;
}

export const ActionsBar = memo(function ActionsBar({
  tableYear,
  tableMonth,
  searchTerm,
  onSearchChange,
  onDateChange,
  vendors = [],
  availablePeriods,
  periodsLoading = false,
  showSearchAndExport = true,
}: ActionsBarProps) {
  const exportUrl = `${getApiBaseUrl()}/bff/daily-overview/all/${tableMonth + 1}/${tableYear}/export`;
  const filename = `daily-overview-${tableYear}-${String(tableMonth + 1).padStart(2, '0')}`;
  const selectedPeriodValue = `${tableYear}-${pad2(tableMonth + 1)}`;

  const { periodMin, periodMax } = useMemo(() => {
    if (!availablePeriods?.length) return { periodMin: undefined, periodMax: undefined };
    const values = availablePeriods.map((p) => p.value).sort();
    return { periodMin: values[0], periodMax: values[values.length - 1] };
  }, [availablePeriods]);

  const handleExport = async (format: 'xlsx' | 'pdf' | 'csv'): Promise<Blob | null> => {
    if (format === 'pdf') {
      try {
        const pdf = await createPDFWithHeader({
          title: 'Vendor Performance',
          subtitle: 'Performance Report',
          orientation: 'landscape',
        });

        const margin = 14;
        let currentY = margin + 40;

        // Summary box
        const summaryData = [
          { label: 'Generated', value: new Date().toLocaleDateString('en-GB') },
          { label: 'Period', value: `${selectedPeriodValue}` },
          { label: 'Total Vendors', value: vendors.length.toString() },
        ];

        if (searchTerm) {
          summaryData.push({ label: 'Search Term', value: searchTerm });
        }

        currentY = addSummaryBox(pdf, currentY, summaryData);
        currentY += 15;

        // Table headers and data
        const headers = ['Vendor', 'Avg TW', 'Avg SPR', 'Avg SPOR-H', 'AFD'];
        const columnWidths = [60, 30, 30, 35, 30];
        
        const tableData = vendors.map((vendor) => [
          `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || '-',
          vendor.avgTw || '-',
          vendor.avgSpr || '-',
          vendor.avgSporH || '-',
          vendor.avgAfd || '-',
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
    // Para Excel e CSV, retornar null para usar exportUrl (backend)
    return null;
  };

  return (
    <nav className="p-4 flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2 flex-shrink-0">
        <MonthYearSelect
          year={tableYear}
          month={tableMonth}
          onMonthChange={onDateChange}
          min={periodMin}
          max={periodMax}
          label="Month"
          disabled={periodsLoading}
        />
      </div>
      {showSearchAndExport && (
        <>
          <div className="flex items-center flex-1 max-w-[650px]">
            <div className="relative w-full max-w-[250px]">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                id="searchFilter"
                name="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 bg-white w-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-blue-300"
              />
            </div>
          </div>
          <div className="ml-auto flex gap-3 items-center">
            <ExportButton
              exportUrl={exportUrl}
              filename={filename}
              format="xlsx"
              onExport={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-gray-50 transition-colors"
              variant="outline"
              label="Export"
              showOnlyExcelAndPdf={true}
              hasActiveFilters={searchTerm !== ''}
              onError={(error) => {
                console.error('Error exporting data:', error);
                alert(error.message || 'Failed to export data');
              }}
            />
          </div>
        </>
      )}
    </nav>
  );
});
