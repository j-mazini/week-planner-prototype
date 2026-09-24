export const weekPlannerOperationsStyles = {
  // Page container
  pageContainer: "font-['Inter',sans-serif] text-slate-800 text-[0.9rem] [&_*]:font-['Inter',sans-serif]",
  pageContent: "w-full min-w-0",
  pageWrapper: "relative w-full",
  pageInner: "w-full px-2 sm:px-4 md:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6",
  
  // Header controls
  headerContainer: "mb-3 sm:mb-4",
  headerActions: "flex flex-col sm:flex-row gap-2 w-full md:justify-end",
  headerActionsDateWrapper: "flex-1 w-full sm:w-auto",
  headerDateInput: "w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-border/60 bg-background/50 rounded-lg font-medium text-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-ring/30",
  headerExportButton:
    "liquid-glass-surface inline-flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-foreground transition-all hover:bg-accent/30 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 active:scale-[0.99] w-full sm:w-auto week-planner-operations-button shadow-sm",
  headerExportIcon: "w-4 h-4",
  headerAddButton:
    "liquid-glass-surface inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/50 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700 transition-all hover:bg-blue-500/10 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400/40 active:scale-[0.99] w-full sm:w-auto week-planner-operations-button shadow-sm whitespace-nowrap",
  headerAddIcon: "w-4 h-4",
  headerAdhocButton:
    "liquid-glass-surface inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-amber-700 transition-all hover:bg-amber-500/10 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400/40 active:scale-[0.99] w-full sm:w-auto week-planner-operations-button shadow-sm whitespace-nowrap",
  headerDayOffButton:
    "liquid-glass-surface inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-red-700 transition-all hover:bg-red-500/10 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400/40 active:scale-[0.99] w-full sm:w-auto week-planner-operations-button shadow-sm whitespace-nowrap",
  headerDayOffIcon: "w-4 h-4",
  /** Export CSV / PDF — visually secondary next to Add Record. */
  headerSecondaryButton:
    "liquid-glass-surface inline-flex items-center justify-center gap-2 rounded-lg border border-slate-400/50 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 transition-all hover:bg-slate-500/10 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400/40 active:scale-[0.99] w-full sm:w-auto week-planner-operations-button shadow-sm whitespace-nowrap",
  
  // Filters bar
  filtersBar: "mb-1 p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 transition-all duration-200",
  filtersSearchGroup: "sm:col-span-2",
  filtersLabel: "block text-xs sm:text-sm font-medium text-slate-700 mb-1",
  filtersInput: "w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  filtersSelect: "w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  
  // Depot block (bloco separado por depot)
  depotBlock: "rounded-xl border border-slate-200/80 bg-white/90 shadow-sm p-4 sm:p-5 w-full overflow-hidden",
  // Submitted section: box verde mais transparente
  submittedSectionBox: "rounded-xl border border-emerald-200/80 bg-emerald-50/40 shadow-sm p-4 sm:p-5 mt-6 w-full overflow-hidden",

  // Table
  tableContainer: "bg-white border border-slate-200/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm w-full overflow-hidden",
  tableErrorContainer: "m-2 sm:m-4 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg text-xs sm:text-sm",
  tableErrorTitle: "font-bold",
  tableLoadingContainer: "p-6 sm:p-8 text-center",
  tableLoadingSpinner: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600",
  tableLoadingText: "mt-2 text-slate-600 text-xs sm:text-sm",
  tableEmptyContainer: "m-2 sm:m-4 p-4 sm:p-6 bg-amber-50/80 border border-amber-200 rounded-lg",
  tableEmptyTitle: "font-bold text-amber-900 text-sm sm:text-base",
  tableEmptyText: "text-amber-800 mt-1 text-xs sm:text-sm",
  tableScrollContainer: "overflow-x-auto w-full -mx-2 sm:mx-0",
  table: "w-full border-collapse min-w-[800px] sm:min-w-0",
  tableThead: "bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100/80 border-b border-slate-200/60",
  tableTh: "px-2 sm:px-3 md:px-5 py-2 sm:py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100/80 transition-all duration-200 align-middle",
  tableThActions: "px-2 sm:px-3 py-2 sm:py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider align-middle",
  tableThContent: "flex items-center justify-center gap-1",
  tableThSortIndicator: "text-blue-600 font-bold",
  tableTbody: "divide-y divide-slate-100/60",
  tableRow: "transition-colors duration-150 ease-out",
  tableRowEven: "bg-white",
  tableRowOdd: "bg-slate-50",
  tableRowHover: "hover:!bg-slate-200",
  tableRowSubmitted: "!bg-emerald-50/90 hover:!bg-emerald-100/90",
  tableRowOff: "!bg-gradient-to-r from-red-50 via-red-50/95 to-rose-50 border-l-4 border-red-400 hover:!from-red-100/80 hover:!to-rose-100/80",
  tableRowNotAllocated: "!bg-gradient-to-r from-blue-50 via-blue-50/95 to-cyan-50 border-l-4 border-blue-400 hover:!from-blue-100/80 hover:!to-cyan-100/80",
  tableCell: "px-2 sm:px-3 md:px-5 py-2 sm:py-3.5 text-[11px] sm:text-sm font-medium text-slate-700 whitespace-nowrap align-middle text-center",
  tableCellOff: "!text-red-900/90 font-medium",
  tableCellEmpty: "text-slate-400",
  tableCellNotesBadge: "inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#f5e6a3] text-[#8b6914] font-bold text-xs sm:text-sm cursor-pointer transition-all duration-200 hover:bg-[#e8d48f] hover:scale-110 relative group",
  tableCellNotesTooltip: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white px-3 py-2 rounded-md text-xs opacity-0 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1 z-[1000] shadow-lg max-w-[200px] sm:max-w-[250px] break-words min-w-[120px] sm:min-w-[150px] whitespace-normal after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-6 after:border-transparent after:border-t-slate-800",
  tableCellActions: "px-2 sm:px-3 md:px-5 py-2 sm:py-3.5 text-sm whitespace-nowrap align-middle text-center",
  tableCellActionsOdd: "bg-slate-50",
  tableCellActionsContainer: "flex gap-1 sm:gap-2 justify-center",
  tableActionButton: "p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md",
  tableActionButtonEdit: "text-blue-600 hover:text-white hover:bg-blue-600",
  tableActionButtonDelete: "text-red-600 hover:text-white hover:bg-red-600",
  tableActionIcon: "w-4 h-4 sm:w-5 sm:h-5",
  tablePagination: "flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 px-3 sm:px-5 py-2 sm:py-3.5 bg-gradient-to-r from-slate-50 to-slate-100/80 border-t border-slate-200/60",
  tablePaginationText: "text-xs sm:text-sm font-medium text-slate-600 text-center sm:text-left",
  tablePaginationButtons: "flex gap-2 w-full sm:w-auto justify-center sm:justify-end",
  tablePaginationButton: "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-300 disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex-1 sm:flex-initial",
  
  // Review and Submit button
  reviewButtonContainer: "flex justify-center sm:justify-end mt-6 sm:mt-8 px-2 sm:px-0",
  reviewButtonSubmitted: "px-4 sm:px-8 py-2.5 sm:py-3 bg-slate-300 text-slate-700 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-lg cursor-not-allowed w-full sm:w-auto justify-center",
  reviewButtonSubmittedIcon: "w-5 h-5 sm:w-6 sm:h-6",
  reviewButtonActive: "px-4 sm:px-8 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 text-sm sm:text-lg disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto justify-center",
  reviewButtonActiveIcon: "w-5 h-5 sm:w-6 sm:h-6",
  
  // Modal common
  modalBackdrop: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-backdrop-fade-in",
  modalContent: "bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto animate-modal-pop-in",
  modalContentSmall: "max-w-4xl",
  modalContentLarge: "max-w-6xl",
  modalHeader: "sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center",
  modalHeaderZ: "sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center",
  modalTitle: "text-2xl font-bold text-slate-800",
  modalCloseButton: "text-slate-500 hover:text-slate-700",
  modalCloseIcon: "w-6 h-6",
  modalBody: "p-6",
  modalFooter: "sticky bottom-0 z-10 flex justify-end gap-3 p-6 bg-slate-50 border-t border-slate-200 rounded-b-lg",
  modalButton: "px-6 py-2 rounded-lg font-medium transition",
  modalButtonCancel: "border border-slate-300 text-slate-700 hover:bg-slate-50",
  modalButtonCancelAlt: "border border-slate-300 text-slate-700 hover:bg-slate-100",
  modalButtonPrimary: "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60",
  modalButtonSubmit: "bg-green-600 text-white hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2",
  modalButtonSpinner: "w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin",
  
  // Form modal
  formModalGrid: "grid grid-cols-1 md:grid-cols-2 gap-4",
  formLabel: "block text-sm font-medium text-slate-700 mb-2",
  formInput: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  formSelect: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  formActions: "flex justify-end gap-3 mt-6",
  
  // Review modal
  reviewModalText: "text-slate-700 mb-6",
  reviewModalLoading: "flex items-center justify-center py-12",
  reviewModalLoadingSpinner: "inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600",
  reviewModalLoadingText: "ml-3 text-slate-600",
} as const;

