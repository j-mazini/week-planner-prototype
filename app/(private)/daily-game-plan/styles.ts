export const dailyGamePlanStyles = {
  // Page container — conteúdo em fluxo normal (o fundo é renderizado separado no DailyGamePlanContent)
  pageContainer: "relative z-0 min-h-screen daily-game-plan-page",
  
  // Table row
  tableRow: "hover:bg-[#f2f7d9] transition-colors duration-200 group",
  tableCell: "px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm",
  tableCellCenter: "px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 whitespace-nowrap text-center text-xs sm:text-sm",
  tableCellLeft: "px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 whitespace-nowrap text-left align-middle text-xs sm:text-sm",
  
  // Route badge
  routeBadge: "inline-flex max-w-full px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 bg-[#e5f1dc] text-[#27676c] rounded-sm font-semibold text-xs sm:text-sm border border-[#b8d2c1]",
  routeBadgeText: "truncate",
  
  // Vendor info
  vendorName: "text-xs sm:text-sm font-bold text-gray-900",
  vendorType: "text-[10px] sm:text-xs text-gray-500",
  
  // Status badge
  statusBadge: "inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-bold text-sm border",
  statusBadgeWorking: "bg-green-100 text-green-800 border-green-300",
  statusBadgeOff: "bg-red-100 text-red-800 border-red-300",
  statusBadgePending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  
  // Notes field (fonte alinhada à modal de notas - Inter / font-sans)
  notesField: "font-sans w-[min(9rem,38vw)] sm:w-[min(11rem,42vw)] min-h-[42px] sm:min-h-[50px] rounded-lg border border-yellow-200/60 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-[0_8px_18px_rgba(0,0,0,0.06)] bg-[linear-gradient(135deg,#FFFBEB_0%,#FEF9E7_82%,#FEF3C7_82%,#FEF3C7_100%)] rotate-[-1deg] text-left overflow-hidden cursor-pointer hover:border-yellow-300/70 hover:shadow-[0_10px_22px_rgba(0,0,0,0.1)] transition",
  notesFieldWrapper: "flex flex-col items-start justify-center h-full",
  notesFieldText: "font-sans line-clamp-2 whitespace-pre-wrap text-xs sm:text-sm",
  notesFieldPlaceholder: "text-slate-400 text-xs sm:text-sm",
  
  // Action buttons
  actionButton: "p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
  actionButtonEdit: "text-blue-600 hover:bg-blue-100",
  actionButtonDelete: "text-red-600 hover:bg-red-100",
  actionButtonIcon: "w-5 h-5",
  
  // Deposit header glass
  depositHeaderContainer: "relative overflow-hidden rounded-sm p-5 w-full group cursor-default border border-[#c7cdbb] bg-[#fffef8] shadow-[0_2px_8px_rgba(23,23,26,.05)]",
  depositHeaderContainerEmbedded: "relative overflow-hidden rounded-t-sm p-4 w-full group cursor-default bg-[#fffef8] border-b border-[#c7cdbb]",
  depositHeaderRounded: "rounded-sm",
  depositHeaderRoundedEmbedded: "rounded-t-sm",
  depositHeaderHighlight: "absolute inset-0 pointer-events-none",
  depositHeaderGradientOverlay: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#eaf5d4]",
  depositHeaderLightEffect: "absolute rounded-full opacity-30 blur-3xl pointer-events-none",
  depositHeaderSheen: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#f2f7d9]",
  depositHeaderContent: "relative z-10 flex items-center justify-between",
  depositHeaderLeft: "flex items-center gap-3",
  depositHeaderIcon: "flex items-center justify-center w-10 h-10 rounded-sm bg-[#eaf5d4] border border-[#c7cdbb]",
  depositHeaderIconSvg: "w-5 h-5 text-[#27676c]",
  depositHeaderTitle: "text-2xl font-semibold text-[#1a1c16] tracking-tight mb-1 antialiased",
  depositHeaderTitleEmbedded: "text-xl font-semibold text-[#1a1c16] tracking-tight mb-1 antialiased",
  depositHeaderBadge: "inline-flex items-center gap-1.5 rounded-sm bg-[#eef1df] px-2.5 py-1 text-xs font-semibold text-[#446900]",
  depositHeaderBadgeDot: "h-1.5 w-1.5 rounded-full bg-[#8aa244]",
  depositHeaderRight: "flex flex-wrap items-center justify-end gap-3",
  depositHeaderCollapseButton: "inline-flex items-center justify-center rounded-sm border border-[#c7cdbb] bg-[#fffef8] p-2 text-[#27676c] transition hover:bg-[#f2f7d9]",
  depositHeaderCollapseIcon: "h-5 w-5",
  depositHeaderActionButton: "relative rounded-sm px-5 py-2",
  depositHeaderActionButtonContent: "relative z-10 inline-flex items-center gap-2.5",
  depositHeaderActionButtonIcon: "w-5 h-5 text-[#27676c]",
  depositHeaderAccentBar: "absolute bottom-0 left-0 right-0 h-1 bg-[#b2f746]",
  depositHeaderAccentBarEmbedded: "absolute bottom-0 left-0 right-0 h-1 rounded-b-sm bg-[#b2f746]",
  
  // Deposit notes field (mesma fonte que a modal e bloco de notas)
  depositNotesField: "font-sans w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none",
  depositNotesButton: "font-sans px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  
  // Select wrapper
  selectWrapper: "daily-game-plan-select-wrapper",
} as const;
