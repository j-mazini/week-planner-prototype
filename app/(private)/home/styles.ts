/**
 * Tailwind styling for the Home page
 * All CSS classes are organized here to facilitate maintenance
 */

export const homeStyles = {
  // Main container
  container: {
    base: "relative min-h-screen z-[1] pointer-events-auto overflow-x-hidden w-full",
    main: {
      base: "mx-auto px-4 sm:px-6 lg:px-10 pt-5 sm:pt-8 lg:pt-9 pb-12 lg:pb-14 relative z-[1] transition-all duration-300",
      sidebarOpen: "max-w-full",
      sidebarClosed: "max-w-7xl"
    }
  },

  // Sections
  section: {
    wrapper: "space-y-5 lg:space-y-7 transition-all duration-300",
    wrapperSidebarOpen: "lg:space-y-6",
    title: {
      container: "flex items-center gap-3 mb-2.5",
      indicator: "h-1 w-12 rounded-full",
      text: "text-xl sm:text-2xl font-bold text-slate-800"
    },
    kpi: {
      indicator: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    notifications: {
      container: "flex items-center justify-between mb-6",
      indicator: "bg-gradient-to-r from-purple-500 to-pink-500",
      counter: "hidden sm:flex items-center gap-2 text-sm text-slate-500"
    },
    navigation: {
      indicator: "bg-gradient-to-r from-emerald-500 to-teal-500"
    }
  },

  // Grids - Horizontally wider cards
  grid: {
    kpi: {
      base: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 transition-all duration-300",
      sidebarOpen: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4"
    },
    notifications: {
      base: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 transition-all duration-300",
      sidebarOpen: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4"
    },
    navigation: {
      base: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 transition-all duration-300",
      sidebarOpen: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4"
    }
  }
};

export const cardStyles = {
  // KPI Card
  kpi: {
    base: "w-full bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg flex items-center gap-4 relative overflow-hidden cursor-pointer transition-all duration-300",
    padding: {
      sidebarOpen: "p-3 sm:p-3.5",
      sidebarClosed: "p-3.5 sm:p-4"
    },
    icon: {
      base: "rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg transition-all duration-300",
      size: {
        sidebarOpen: "w-11 h-11 sm:w-13 sm:h-13",
        sidebarClosed: "w-13 h-13 sm:w-15 sm:h-15"
      },
      iconSize: {
        sidebarOpen: "text-lg sm:text-xl",
        sidebarClosed: "text-xl sm:text-2xl"
      }
    },
    content: {
      title: {
        base: "uppercase tracking-wide text-slate-500 mb-1 transition-all duration-300",
        size: {
          sidebarOpen: "text-[10px]",
          sidebarClosed: "text-[11px]"
        }
      },
      value: {
        base: "font-semibold text-slate-800 leading-tight transition-all duration-300",
        size: {
          sidebarOpen: "text-lg sm:text-xl",
          sidebarClosed: "text-xl sm:text-2xl"
        }
      },
      trend: {
        base: "flex items-center gap-1 font-semibold transition-all duration-300",
        size: {
          sidebarOpen: "text-[10px]",
          sidebarClosed: "text-xs"
        }
      }
    }
  },

  // Notification Category Card
  notification: {
    base: "relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden group transition-all duration-300 cursor-pointer h-full flex flex-col",
    bar: {
      base: "absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b rounded-l-2xl"
    },
    content: {
      padding: {
        sidebarOpen: "p-4",
        sidebarClosed: "p-5"
      }
    },
      header: {
        container: {
          base: "flex items-start justify-between transition-all duration-300",
          sidebarOpen: "mb-3 gap-1.5",
          sidebarClosed: "mb-4 gap-1.5"
        },
        iconTitle: {
          gap: {
            sidebarOpen: "gap-1.5",
            sidebarClosed: "gap-2"
          }
        },
      icon: {
        base: "relative rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg flex-shrink-0 transition-all duration-300",
        size: {
          sidebarOpen: "w-12 h-12",
          sidebarClosed: "w-14 h-14"
        },
        iconSize: {
          sidebarOpen: "text-xl",
          sidebarClosed: "text-2xl"
        },
        badge: {
          base: "absolute -top-1 -right-1 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white transition-all duration-300",
          size: {
            sidebarOpen: "w-7 h-7 text-xs",
            sidebarClosed: "w-8 h-8 text-sm"
          }
        }
      },
      title: {
        container: "flex-1 min-w-0 pt-1 overflow-hidden",
        text: {
          base: "font-bold text-slate-800 leading-tight transition-all duration-300",
          sidebarOpen: "text-xs mb-0.5",
          sidebarClosed: "text-sm mb-1"
        },
        subtitle: {
          base: "text-slate-500 leading-relaxed transition-all duration-300 line-clamp-2",
          sidebarOpen: "text-[10px]",
          sidebarClosed: "text-xs"
        }
      },
      arrow: {
        container: "flex-shrink-0 pt-1 ml-2",
        button: {
          base: "flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-all duration-300",
          size: {
            sidebarOpen: "w-6 h-6",
            sidebarClosed: "w-7 h-7"
          },
          iconSize: {
            sidebarOpen: "text-base",
            sidebarClosed: "text-lg"
          }
        }
      }
    },
    preview: {
      container: {
        base: "mt-auto border-t border-slate-100 transition-all duration-300",
        sidebarOpen: "pt-3.5",
        sidebarClosed: "pt-4"
      },
      list: {
        gap: {
          sidebarOpen: "space-y-2",
          sidebarClosed: "space-y-2.5"
        }
      },
      item: {
        gap: {
          sidebarOpen: "gap-1.5",
          sidebarClosed: "gap-2.5"
        },
        dot: {
          base: "flex-shrink-0 rounded-full mt-2 transition-all duration-300",
          size: {
            sidebarOpen: "w-1.5 h-1.5",
            sidebarClosed: "w-2 h-2"
          }
        },
        title: {
          base: "font-medium text-slate-700 line-clamp-2 leading-snug group-hover/notif:text-slate-900 transition-all duration-300",
          size: {
            sidebarOpen: "text-xs",
            sidebarClosed: "text-sm"
          }
        },
        time: {
          base: "text-slate-400 mt-1 transition-all duration-300",
          size: {
            sidebarOpen: "text-[10px]",
            sidebarClosed: "text-xs"
          }
        }
      },
      more: {
        base: "font-medium text-slate-400 text-center transition-all duration-300",
        size: "text-xs"
      },
      empty: {
        text: {
          base: "text-slate-400 transition-all duration-300",
          size: "text-sm"
        }
      }
    }
  }
};

// Colors by notification category
export const categoryGradients = {
  admin: 'from-purple-500 to-indigo-600',
  ops: 'from-blue-500 to-cyan-600',
  invoices: 'from-emerald-500 to-teal-600',
  compliance: 'from-amber-500 to-orange-600'
};

// Colors by notification severity
export const severityColors = {
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  info: 'bg-sky-500'
};

