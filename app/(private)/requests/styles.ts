export const requestsStyles = {
  pageContent: "space-y-4",

  tabsList: "grid w-full grid-cols-4",
  tabsRequestsTrigger: "font-semibold",

  section: "space-y-3",
  historySection: "space-y-4",

  card: "rounded-xl border bg-white/70 p-4 backdrop-blur",
  cardTitle: "text-sm font-semibold text-slate-900",
  cardTitleLg: "text-[18px] sm:text-[20px] font-semibold text-slate-900",
  cardSubtitle: "text-[12px] text-slate-600",

  submitButton:
    "min-w-[160px] rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",

  historyMonthLabel: "text-[12px] text-slate-600 whitespace-nowrap",
  historyEmptyText: "text-xs text-slate-500 py-4 text-center",
  historyLoadingText: "text-sm text-slate-600 text-center py-8",

  statusBadgeBase:
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
} as const;


