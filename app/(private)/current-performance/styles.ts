export const currentPerformanceStyles = {
  // Layout / cards
  monthCarouselSection:
    "mp-month-carousel-section",
  monthCarouselScroll:
    "mp-month-carousel-scroll",
  monthCarouselItems: "mp-month-carousel-items",
  monthCarouselButtonBase:
    "mp-month-carousel-button-base",
  monthCarouselButtonActive:
    "mp-month-carousel-button-active",
  monthCarouselButtonInactive:
    "mp-month-carousel-button-inactive",
  monthCarouselButtonLabel: "relative z-10 flex flex-col items-center",
  monthCarouselButtonYear: "text-xs opacity-90",

  monthlyCard:
    "mp-monthly-card",

  // Monthly averages
  monthlyHeader: "mp-monthly-header",
  monthlyTitle: "mp-monthly-title",
  monthlyTitleIcon: "bi bi-bar-chart text-blue-600",
  monthlyMetricsGrid: "mp-monthly-metrics-grid",
  monthlyMetricCard:
    "mp-monthly-metric-card",
  monthlyMetricLabel:
    "mp-monthly-metric-label",

  // Daily table
  dailySection:
    "mp-daily-section",
  dailyHeader: "mp-daily-header",
  dailyHeaderIcon: "bi bi-table text-blue-600",
  dailyScroll: "mp-daily-scroll",
  dailyTable:
    "mp-daily-table",
  dailyThead: "mp-daily-thead",
  dailyTh:
    "mp-daily-th",

  // Table rows / cells
  rowEven: "bg-white",
  rowOdd: "bg-slate-50",
  dayCell:
    "py-2.5 px-2 sm:px-1.5 text-center align-middle border-b border-slate-200 font-bold",
  weekdayPillBase:
    "font-semibold text-[0.65rem] sm:text-[0.7rem] py-1 px-1 sm:px-1.5 rounded-md inline-block min-w-[28px] sm:min-w-[30px] ml-1",
  weekdayPillSaturday: "bg-blue-100 text-blue-600",
  weekdayPillWeekday: "bg-slate-200 text-slate-600",
  valueCellBase:
    "py-2.5 px-2 sm:px-1.5 text-center align-middle border-b border-slate-200 font-bold",
  valueStopsNA: "text-slate-400 italic text-[0.7rem] sm:text-xs",
  valueStopsNormal: "text-slate-700",

  // Semantic value colors
  valueNA: "text-slate-400 italic text-[0.7rem] sm:text-xs",
  valuePositive: "text-green-600 font-semibold",
  valueWarning: "text-orange-600 font-semibold",
  valueNegative: "text-red-600 font-semibold",
  valueNeutral: "text-slate-600 font-medium",

  emptyStateCell:
    "py-5 text-center text-slate-400 italic text-xs",
  emptyStateIcon: "bi bi-inbox text-2xl mb-2 block",

  // Misc states
  loadingText: "py-5 text-center text-gray-500",
  errorText: "py-5 text-center text-red-600",
} as const;


