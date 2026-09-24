export const dailyPerformanceInsightStyles = {
  // Page layout
  pageContent: "space-y-4 pb-4",
  
  // Loading & Error states
  loadingContainer: "flex justify-center items-center min-h-[300px] font-medium text-slate-500",
  loadingSpinner: "bi bi-arrow-repeat animate-spin text-base text-slate-400",
  loadingText: "text-slate-500",
  emptyStateContainer: "flex flex-col justify-center items-center min-h-[300px] font-medium text-slate-500",
  emptyStateIcon: "bi bi-info-circle text-2xl mb-3 text-slate-300",
  emptyStateText: "text-slate-500",
  
  // Month Selector
  monthSelectorContainer: "mp-month-selector-container",
  monthSelectorNavButton: "mp-month-selector-nav-button",
  monthSelectorNavIcon: "bi bi-chevron-left text-[clamp(0.75rem,3vw,0.875rem)]",
  monthSelectorNavIconRight: "bi bi-chevron-right text-[clamp(0.75rem,3vw,0.875rem)]",
  monthSelectorText: "mp-month-selector-text",
  
  // Days Carousel
  daysCarouselWrapper: "mp-days-carousel-wrapper",
  daysCarouselScroll: "mp-days-carousel-scroll",
  dayCardBase: "mp-day-card-base",
  dayCardSelected: "mp-day-card-selected",
  dayCardUnselected: "mp-day-card-unselected",
  dayCardNumber: "text-[clamp(1.25rem,4.6vw,1.5rem)] font-bold leading-none",
  dayCardNumberSelected: "drop-shadow-sm",
  dayCardWeekday: "text-[0.7rem] mt-1 font-semibold uppercase tracking-wide",
  dayCardWeekdaySelected: "opacity-90",
  dayCardWeekdayUnselected: "opacity-70",
  
  // Operation Card
  operationCardRoot: "mp-operation-card-root",
  operationCardDivider: "border-none border-t border-slate-200 my-6",
  
  // Verified Card
  verifiedCard: "mp-verified-card",
  verifiedCardText: "drop-shadow-sm",
  
  // Vehicle Info
  vehicleInfoContainer: "mp-vehicle-info-container",
  vehicleInfoIconWrapper: "w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center",
  vehicleInfoIcon: "text-base text-slate-700",
  vehicleInfoText: "font-semibold",
  
  // Card Base
  cardBase: "mp-card-base",

  // Metrics Card
  metricsCardGrid: "mp-metrics-card-grid",
  metricsCardItem: "mp-metrics-card-item",
  metricsCardHeader: "mp-metrics-card-header",
  metricsCardIconWrapper: "mp-metrics-card-icon-wrapper",
  metricsCardIcon: "text-lg",
  metricsCardLabel: "mp-metrics-card-label",
  metricsCardValue: "mp-metrics-card-value",
  metricsCardValueDefault: "text-slate-800",
  metricsCardValueSuccess: "text-green-600",
  metricsCardValueWarning: "text-yellow-500",
  metricsCardValueOrange: "text-orange-500",
  metricsCardValueDanger: "text-red-600",
  metricsCardValueAfd: "text-red-600",
  metricsCardValueNeutral: "text-slate-700",
  
  // Timeline
  timelineContainer: "mp-timeline-container",
  timelineLine: "mp-timeline-line",
  timelineItem: "mp-timeline-item",
  timelineDot: "mp-timeline-dot",
  timelineDotIcon: "mp-timeline-dot-icon",
  timelineLabel: "text-xs text-center font-semibold leading-tight",
  timelineLabelDefault: "text-slate-700",
  timelineLabelHighlighted: "text-red-600 font-bold",
  
  // Failed Deliveries Card
  failedDeliveriesHeader: "flex items-center gap-2 mb-3 sm:mb-4",
  failedDeliveriesAccent: "h-1 w-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500",
  failedDeliveriesTitle: "mp-failed-deliveries-title",
  failedDeliveriesGrid: "mp-failed-deliveries-grid",
  failedDeliveriesItem: "mp-failed-deliveries-item",
  failedDeliveriesIconWrapper: "mp-failed-deliveries-icon-wrapper",
  failedDeliveriesIcon: "text-xs sm:text-sm",
  failedDeliveriesLabel: "text-[0.65rem] sm:text-[0.7rem] text-slate-500 font-semibold mb-1 block uppercase tracking-wide",
  failedDeliveriesValue: "text-[clamp(1rem,3.5vw,1.25rem)] font-bold leading-none text-slate-800",
  
  // Notes Section
  notesCard: "mp-notes-card",
  notesHeader: "flex items-center gap-2 mb-3",
  notesIconWrapper: "w-8 h-8 rounded-lg bg-[#f5e6a3]/30 flex items-center justify-center",
  notesIcon: "bi bi-sticky text-[#b8941f] text-sm",
  notesTitle: "text-xs font-bold text-[#8b6914] uppercase tracking-wider",
  notesText: "text-[clamp(0.875rem,3.4vw,1rem)] text-[#8b6914] font-medium break-words whitespace-pre-wrap leading-relaxed",
} as const;


