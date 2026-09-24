export const mobileChatStyles = {
  bottomPadding: "pb-[clamp(3.5rem,8vh,4.375rem)]",

  container: "mx-auto w-full max-w-[560px]",

  chatCard:
    "rounded-3xl bg-white/45 backdrop-blur-xl ring-1 ring-white/35 shadow-[0_20px_45px_rgba(15,23,42,0.10)] overflow-hidden",
  chatInner: "flex flex-col h-[clamp(420px,calc(100vh-250px),680px)]",
  messagesArea:
    "flex-1 overflow-y-auto px-4 pt-4 pb-3 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none]",
  messagesAreaWebkit: "messages-area-webkit-hide",

  dayMarkerRow: "flex items-center justify-center py-1.5",
  dayMarkerPill:
    "rounded-full bg-white/55 backdrop-blur-md ring-1 ring-white/40 px-3 py-1 text-[12px] font-semibold text-slate-600 shadow-[0_10px_22px_rgba(15,23,42,0.08)]",

  bubbleRowLeft: "flex justify-start",
  bubbleRowRight: "flex justify-end",
  bubbleBase:
    "relative max-w-[78%] rounded-2xl px-4 py-3 text-[13.5px] leading-snug shadow-[0_14px_26px_rgba(15,23,42,0.10)]",
  bubbleLeft:
    "bg-white/75 text-slate-800 ring-1 ring-white/50 after:content-[''] after:absolute after:left-[-7px] after:top-[14px] after:border-y-[8px] after:border-y-transparent after:border-r-[10px] after:border-r-white/75",
  bubbleRight:
    "bg-gradient-to-b from-blue-500 to-blue-600 text-white ring-1 ring-blue-200/50 after:content-[''] after:absolute after:right-[-7px] after:top-[14px] after:border-y-[8px] after:border-y-transparent after:border-l-[10px] after:border-l-blue-600",

  inputBar:
    "p-3 bg-white/35 backdrop-blur-xl ring-1 ring-white/35 border-t border-white/20",
  inputRow: "flex items-center gap-2",
  attachBtn:
    "h-10 w-10 rounded-full bg-white/70 ring-1 ring-white/45 shadow-sm grid place-items-center text-slate-600 hover:bg-white/90 disabled:opacity-60",
  textInput:
    "flex-1 h-10 rounded-full bg-white/70 ring-1 ring-white/45 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-300/70 disabled:opacity-60",
  sendBtn:
    "h-10 w-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_14px_24px_rgba(37,99,235,0.35)] grid place-items-center text-white ring-1 ring-blue-200/40 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60",
} as const;


