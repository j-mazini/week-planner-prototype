export const dailyOperationsReportsStyles = {
  // Page container
  pageContainer: "font-sans text-slate-800 text-sm",
  pageContent: "w-full min-w-0",
  mainContent: "flex-grow flex flex-col min-w-0",
  desktopMain: "hidden md:block pt-4 sm:pt-5 md:pt-6 space-y-3 sm:space-y-3.5 md:space-y-4 lg:space-y-6 page-stagger",
  mobileMain: "block md:hidden pt-16 pb-20 space-y-2 page-stagger",
  mobileTitle: "text-lg font-bold text-gray-700",
  
  // Filters container
  filtersContainer: "bg-gradient-to-br from-white to-gray-50 rounded-xl px-3 sm:px-4 md:px-6 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 shadow-md mb-2 border border-gray-200 relative overflow-visible",
  filtersInner: "flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3 relative z-10",
  filtersTogglesContainer: "mt-2 sm:mt-2.5 md:mt-3 lg:mt-4",
  
  // FilterBar — primeira linha: Period + Export + Search (uma única linha, sem wrap)
  filterBarEmbedded: "flex flex-nowrap items-center gap-2 sm:gap-2.5 md:gap-3 w-full min-w-0",
  filterBarStandalone: "p-3 sm:p-4 md:p-6 border-b border-gray-200 flex flex-nowrap gap-0 items-center bg-gradient-to-br from-white to-gray-50 rounded-t-lg border border-gray-200 shadow-sm",
  filterBarDateGroup: "flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0",
  filterBarDateLabel: "text-xs sm:text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 whitespace-nowrap",
  filterBarDateInput: "px-2 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 border border-gray-200 rounded-md text-xs sm:text-sm max-w-[120px] sm:max-w-[140px] md:max-w-[150px] transition-all duration-200 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 hover:border-blue-400",
  filterBarSearchGroup: "flex items-center relative pl-0 flex-1 min-w-0 max-w-full sm:max-w-[500px] md:max-w-[650px]",
  filterBarSearchGroupEmbedded: "",
  filterBarSearchGroupStandalone: "ml-0 sm:ml-3 md:ml-5",
  filterBarSearchInput: "px-2 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 border border-gray-200 rounded-md text-xs sm:text-sm transition-all duration-200 bg-white w-full min-w-0 max-w-full sm:max-w-[220px] md:max-w-[260px] ml-0 h-auto leading-normal focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 hover:border-blue-400",
  filterBarActions: "flex gap-1.5 sm:gap-2 md:gap-3 items-center shrink-0 ml-auto",
  
  // FilterToggles (desktop: md+ follows page scale — text-sm, larger padding)
  filterTogglesEmbedded: "flex flex-wrap gap-3 sm:gap-4 md:gap-6 lg:gap-8",
  filterTogglesStandalone: "p-3 sm:p-3.5 md:p-4 md:py-5 px-3 sm:px-4 md:px-6 border-b border-gray-200 flex flex-wrap gap-3 sm:gap-4 md:gap-6 lg:gap-8 bg-gradient-to-br from-white to-gray-50 border-l border-r border-gray-200",
  filterTogglesGroup: "flex flex-col gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5",
  filterTogglesLabel: "text-[10px] sm:text-xs md:text-sm font-semibold uppercase text-gray-500 transition-colors duration-200 hover:text-blue-600",
  filterTogglesButtons: "inline-flex rounded-lg md:rounded-xl overflow-hidden border border-gray-200",
  filterTogglesButton: "px-2 sm:px-2.5 md:px-4 lg:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2 text-[10px] sm:text-xs md:text-sm font-medium transition-all duration-200",
  filterTogglesButtonActive: "bg-blue-600 text-white",
  filterTogglesButtonInactive: "bg-white text-gray-700 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 hover:-translate-y-[1px] hover:shadow-md",
  
  // DataTable
  dataTableContainer: "w-full bg-white border border-slate-200/60 rounded-lg sm:rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm relative",
  dataTableLoadingContainer: "p-4 sm:p-6 md:p-8 text-center",
  dataTableLoadingSpinner: "inline-block animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-b-2 border-blue-600",
  dataTableLoadingText: "mt-2 text-xs sm:text-sm text-slate-600",
  dataTableScroll: "overflow-x-auto w-full -mx-0.5 sm:-mx-1",
  dataTable: "w-full border-collapse mb-0 align-middle",
  dataTableEmptyCell: "text-center pt-3 sm:pt-4 text-xs sm:text-sm text-gray-600 px-2",
  dataTableTotalRow: "bg-gray-50 border-t border-gray-200",
  dataTableTotalCell: "py-2 sm:py-2.5 px-1.5 sm:px-2 text-xs sm:text-sm align-middle text-right font-semibold text-gray-700",
  dataTableTotalCellCenter: "py-2 sm:py-2.5 px-1.5 sm:px-2 text-xs sm:text-sm align-middle text-center font-semibold text-gray-700 cursor-help",
  dataTableTotalLabel: "font-normal text-gray-500 mr-1 sm:mr-1.5",
  
  // TableHeader
  tableHeaderTh: "text-gray-500 font-semibold uppercase text-[10px] sm:text-xs border-b border-gray-200 py-2 sm:py-2.5 px-1 sm:px-1.5 md:px-2 text-center bg-gray-50/80 transition-colors",
  tableHeaderThSortable: "cursor-pointer hover:bg-gray-50",
  tableHeaderContent: "flex items-center justify-center gap-0.5 sm:gap-1",
  tableHeaderMultiLine: "flex flex-col items-center justify-center gap-0.5 sm:gap-1",
  tableHeaderSortIcon: "h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4",
  
  // TableRow
  tableRow: "transition-colors duration-150 ease-out",
  tableRowEven: "bg-white",
  tableRowOdd: "bg-gray-50",
  tableRowHover: "hover:!bg-gray-200",
  tableCell: "py-2 sm:py-2.5 px-1 sm:px-1.5 md:px-2 text-xs sm:text-sm align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap",
  tableCellNormal: "whitespace-normal break-words",
  tableCellVisible: "text-center whitespace-nowrap",
  tableCellRelative: "text-center",
  tableCellRouteContent: "inline-flex items-center gap-1 sm:gap-1.5 justify-center",
  tableCellRouteDot: "shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-gray-300",
  tableCellRouteDotYes: "bg-green-500",
  tableCellRouteDotNo: "bg-red-500",
  tableCellRouteLink: "text-blue-600 no-underline font-medium hover:text-blue-700 transition-colors text-xs sm:text-sm",
  tableCellVrnWrapper: "flex justify-center",
  
  // Mobile
  mobileFiltersCard: "bg-white rounded-lg p-3 shadow-sm space-y-2",
  mobileFiltersGroup: "space-y-1",
  mobileFiltersLabel: "text-[10px] font-semibold text-gray-500 uppercase",
  mobileFiltersDateGroup: "flex items-center gap-2",
  mobileFiltersDateInput: "flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100",
  mobileFiltersDateLabel: "text-[10px] text-gray-500",
  mobileFiltersSearchInput: "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100",
  mobileFiltersExportBtn: "!h-8 !min-h-8 !py-1.5 !px-2.5 !text-xs [&_svg]:!size-3",
  mobileFiltersButtons: "flex flex-wrap gap-1",
  mobileFiltersButton: "px-2 py-1 text-[10px] font-medium rounded transition-colors",
  mobileFiltersButtonActive: "bg-blue-600 text-white",
  mobileFiltersButtonInactive: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  mobileViewContainer: "relative",
  mobileViewEmpty: "text-center py-6 text-gray-600 text-xs",
  mobileViewList: "space-y-2 transition-opacity duration-300",
  mobileViewListLoading: "opacity-50",
  mobileViewListLoaded: "opacity-100",
  mobileViewTotals: "bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2",
  mobileViewTotalsRow: "flex justify-between items-center",
  mobileViewTotalsLabel: "text-xs text-gray-500",
  mobileViewTotalsValue: "text-sm font-semibold text-gray-700",
  
  // ErrorAlert
  errorAlertContainer: "mb-3 sm:mb-3.5 md:mb-4 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 md:py-3 rounded relative text-xs sm:text-sm",
  errorAlertTitle: "font-bold",
  errorAlertText: "",
} as const;

