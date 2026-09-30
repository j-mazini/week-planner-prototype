import React, { memo } from 'react';
import ExportButton from '@/components/export-button';
import { IconRenderer } from './IconRenderer';
import { exportInvoicesToExcel, getExportFileName } from '../exportUtils';
import type { Invoice } from '../types';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

interface ActionsBarProps {
  userTypeId: number;
  invoices: Invoice[];
  selectedMonth: Date | null;
  onNewInvoice: () => void;
  onMultipleInvoices: () => void;
  /** Quando false, permite aprovar/criar invoice mesmo com isSpms = false */
  spmsValidationEnabled: boolean;
  onSpmsValidationToggle: () => void;
}

export const ActionsBar = memo<ActionsBarProps>(({
  userTypeId,
  invoices,
  selectedMonth,
  onNewInvoice,
  onMultipleInvoices,
  spmsValidationEnabled,
  onSpmsValidationToggle
}) => {
  // Não renderizar apenas se userTypeId for diferente de `ADMIN`
  if (userTypeId !== BUSINESS_RULES.USER_TYPE.ADMIN) return null;

  const handleExport = async (format: 'xlsx' | 'pdf' | 'csv'): Promise<Blob | null> => {
    if (format === 'pdf') {
      const { exportInvoicesToPDF } = await import('../utils/pdfExport');
      return await exportInvoicesToPDF(invoices, userTypeId, selectedMonth);
    } else if (format === 'xlsx') {
      return await exportInvoicesToExcel({
        invoices,
        userTypeId,
        selectedMonth
      });
    }
    return null;
  };

  return (
    <div className="flex gap-2 flex-wrap items-center min-w-0 relative z-10">
      <button
        type="button"
        onClick={onSpmsValidationToggle}
        title={spmsValidationEnabled 
          ? "SPMS validation is ON - invoices require isSpms=true to approve/create. Click to bypass." 
          : "SPMS validation is OFF - you can approve/create invoices without SPMS. Click to enable."}
        className={`
          rounded-lg font-medium h-11 px-4 
          transition-all [transition-duration:400ms]
          border cursor-pointer 
          inline-flex items-center justify-center gap-2 
          relative z-20
          ${spmsValidationEnabled 
            ? "bg-green-50 border-green-300 text-green-800 hover:bg-green-100"
            : "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"}
        `}
      >
        <IconRenderer iconName={spmsValidationEnabled ? "bi-shield-check" : "bi-shield-exclamation"} />
        <span className="hidden sm:inline">SPMS validation: {spmsValidationEnabled ? "ON" : "OFF"}</span>
      </button>
      <button
        type="button"
        className="
          rounded-lg font-medium h-11 px-4 
          transition-all [transition-duration:400ms]
          border-none cursor-pointer 
          inline-flex items-center justify-center gap-2 
          bg-blue-600 text-white 
          hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-400/40
          hover:-translate-y-0.5
          relative z-20
        "
        onClick={onNewInvoice}
      >
        <IconRenderer iconName="bi-file-earmark-plus" className="transition-transform duration-300 hover:scale-125 hover:rotate-[10deg]" /> 
        New Single Invoice
      </button>
      
      <button
        type="button"
        className="
          rounded-lg font-medium h-11 px-4 
          transition-all [transition-duration:400ms]
          border-none cursor-pointer 
          inline-flex items-center justify-center gap-2 
          bg-blue-600 text-white 
          hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-400/40
          hover:-translate-y-0.5
          relative z-20
        "
        onClick={onMultipleInvoices}
      >
        <IconRenderer iconName="bi-files" className="transition-transform duration-300 hover:scale-125 hover:rotate-[10deg]" /> 
        New Multiple Invoices
      </button>
      
      <div className="relative z-20 transition-all [transition-duration:400ms] hover:-translate-y-0.5">
        <ExportButton
          filename={getExportFileName({ userTypeId, selectedMonth })}
          onExport={handleExport}
          className="
            rounded-lg font-medium h-11 px-4 
            transition-all [transition-duration:400ms]
            border border-gray-300 cursor-pointer 
            inline-flex items-center gap-2 
            bg-white text-gray-600 
            hover:bg-gray-50 hover:border-gray-400
          "
          variant="outline"
          label="Export"
          showOnlyExcelAndPdf={true}
          hasActiveFilters={selectedMonth !== null}
        />
      </div>
    </div>
  );
});

ActionsBar.displayName = 'ActionsBar';


