/**
 * Modern Routes Management Styling - Redesigned
 * Clean, spacious design with enhanced visual hierarchy
 */

export const routeListStyles = {
  // Main container
  container: {
    base: "bg-gradient-to-br from-white via-white to-slate-50/40 rounded-3xl border border-slate-200/60 shadow-xl backdrop-blur-md overflow-hidden",
    withSidebar: "border-l-4 border-l-blue-500/30"
  },

  // Header section
  header: {
    base: "bg-gradient-to-r from-slate-50 via-white to-slate-50/60 border-b border-slate-200/50 px-8 py-8",
    titleSection: "flex items-center justify-between mb-8",
    title: {
      wrapper: "flex items-center gap-5",
      icon: "p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg w-16 h-16 flex items-center justify-center",
      iconSize: "text-3xl",
      text: {
        main: "text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight",
        subtitle: "text-slate-500 mt-2 text-base"
      }
    },
    actions: {
      wrapper: "flex items-center gap-5",
      search: {
        base: "relative group",
        input: "pl-12 pr-5 py-3.5 bg-white/90 border border-slate-300/60 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 w-72 transition-all duration-300 hover:bg-white shadow-sm hover:shadow-md",
        icon: "absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-lg"
      },
      buttons: {
        wrapper: "flex items-center gap-4",
        primary: {
          base: "px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2.5",
          icon: "text-xl"
        },
        secondary: {
          base: "px-5 py-3.5 bg-white border border-slate-300/60 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md",
          icon: "text-slate-500 text-lg"
        }
      }
    }
  },

  // Filters section
  filters: {
    base: "px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-white/60 via-white to-white/60",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5",
    filterGroup: {
      label: "block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2",
      select: {
        base: "w-full px-4 py-3.5 bg-white/95 border border-slate-300/60 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-300 hover:bg-white shadow-sm hover:shadow-md font-medium",
        option: "py-2"
      },
      dateRange: {
        base: "flex items-center gap-3",
        input: "flex-1 px-4 py-3.5 bg-white/95 border border-slate-300/60 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
      }
    }
  },

  // Content area
  content: {
    base: "p-8 lg:p-10",
    grid: "grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-10"
  }
};

export const columnStyles = {
  // Column container
  container: {
    base: "bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group",
    draggable: "cursor-move active:cursor-grabbing"
  },

  // Column header
  header: {
    base: "bg-gradient-to-r from-slate-50 to-white px-7 py-6 border-b border-slate-200/50",
    topSection: "flex items-center justify-between mb-5",
    titleSection: "flex items-center gap-4",
    statusIndicator: {
      base: "w-3.5 h-3.5 rounded-full",
      active: "bg-emerald-500 shadow-lg shadow-emerald-500/50",
      inactive: "bg-slate-400",
      warning: "bg-amber-500 shadow-lg shadow-amber-500/50"
    },
    title: {
      wrapper: "flex items-center gap-4",
      text: "text-xl font-bold text-slate-900",
      count: "px-3 py-1 bg-slate-100 text-slate-700 text-sm font-bold rounded-full"
    },
    actions: {
      wrapper: "flex items-center gap-2",
      button: {
        base: "p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all duration-300",
        icon: "text-lg"
      }
    },
    stats: {
      wrapper: "grid grid-cols-3 gap-5 mt-5 pt-5 border-t border-slate-200/50",
      stat: {
        base: "text-center",
        value: "text-2xl font-extrabold text-slate-900",
        label: "text-xs font-bold text-slate-500 uppercase tracking-widest mt-2"
      }
    }
  },

  // Column content
  content: {
    base: "p-5 lg:p-6",
    emptyState: {
      base: "flex flex-col items-center justify-center py-12 text-center",
      icon: "text-4xl text-slate-300 mb-4",
      title: "text-slate-500 font-medium mb-2",
      subtitle: "text-slate-400 text-sm"
    }
  }
};

export const routeItemStyles = {
  // Route item container
  container: {
    base: "group bg-gradient-to-br from-white via-white to-slate-50/60 border border-slate-200/60 rounded-2xl p-6 mb-5 shadow-md hover:shadow-xl hover:border-slate-300/80 hover:-translate-y-1 transition-all duration-300 cursor-pointer",
    dragging: "opacity-50 rotate-2",
    selected: "ring-2 ring-blue-500/40 border-blue-400 bg-blue-50/40"
  },

  // Route header
  header: {
    base: "flex items-start justify-between mb-5 pb-5 border-b border-slate-200/50",
    leftSection: "flex items-start gap-5 flex-1 min-w-0",
    routeIcon: {
      base: "p-4 rounded-2xl bg-gradient-to-br shadow-lg flex-shrink-0 mt-1",
      size: "w-16 h-16",
      icon: "text-2xl text-white"
    },
    routeInfo: {
      base: "flex-1 min-w-0",
      name: {
        wrapper: "flex items-center gap-3 mb-2",
        text: "font-bold text-slate-900 truncate text-lg",
        badge: {
          base: "px-3 py-1 text-xs font-bold rounded-full",
          primary: "bg-blue-100 text-blue-700",
          secondary: "bg-emerald-100 text-emerald-700",
          warning: "bg-amber-100 text-amber-700"
        }
      },
      path: {
        wrapper: "flex items-center gap-3 text-slate-600",
        method: {
          base: "px-3 py-1 text-xs font-bold rounded-lg",
          get: "bg-green-100 text-green-700",
          post: "bg-blue-100 text-blue-700",
          put: "bg-amber-100 text-amber-700",
          delete: "bg-rose-100 text-rose-700",
          patch: "bg-purple-100 text-purple-700"
        },
        text: "text-sm font-mono truncate font-medium"
      }
    },
    status: {
      wrapper: "flex items-center gap-2",
      indicator: {
        base: "w-2 h-2 rounded-full",
        active: "bg-emerald-500 animate-pulse",
        inactive: "bg-slate-400",
        error: "bg-rose-500 animate-pulse"
      },
      text: "text-sm font-medium text-slate-700"
    }
  },

  // Route details
  details: {
    base: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5",
    detailItem: {
      base: "bg-slate-50/80 rounded-xl p-4",
      label: "text-xs font-bold text-slate-500 uppercase tracking-widest mb-2",
      value: "text-sm font-bold text-slate-900 truncate",
      withIcon: "flex items-center gap-3"
    }
  },

  // Route metrics
  metrics: {
    base: "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5",
    metric: {
      base: "bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/60 shadow-sm",
      label: "text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider",
      value: {
        wrapper: "flex items-center gap-2",
        text: "text-xl font-extrabold text-slate-900",
        trend: {
          base: "text-xs font-semibold flex items-center gap-1",
          positive: "text-emerald-600",
          negative: "text-rose-600",
          neutral: "text-slate-500"
        }
      }
    }
  },

  // Route actions
  actions: {
    base: "flex items-center justify-between pt-5 border-t border-slate-200/50",
    leftSection: "flex items-center gap-4",
    tags: {
      wrapper: "flex flex-wrap gap-3",
      tag: {
        base: "px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm",
        api: "bg-blue-50 text-blue-700 border-blue-200",
        auth: "bg-purple-50 text-purple-700 border-purple-200",
        cache: "bg-amber-50 text-amber-700 border-amber-200",
        db: "bg-emerald-50 text-emerald-700 border-emerald-200"
      }
    },
    rightSection: "flex items-center gap-3",
    actionButton: {
      base: "p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md",
      primary: "px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 font-bold",
      icon: "text-lg"
    }
  }
};

export const columnManagementStyles = {
  // Management panel
  panel: {
    base: "bg-white/98 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-2xl p-10",
    header: {
      base: "mb-10 pb-8 border-b border-slate-200/50",
      title: "text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-3 tracking-tight",
      subtitle: "text-slate-500 text-base"
    }
  },

  // Column configuration
  configuration: {
    grid: "grid grid-cols-1 lg:grid-cols-2 gap-10",
    formSection: {
      base: "space-y-8",
      title: "text-xl font-bold text-slate-900 mb-6 flex items-center gap-4",
      formGroup: {
        base: "space-y-8",
        field: {
          label: "block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2",
          input: {
            base: "w-full px-5 py-3.5 bg-white/95 border border-slate-300/60 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md font-medium",
            withIcon: "pl-12"
          },
          textarea: "w-full px-5 py-3.5 bg-white/95 border border-slate-300/60 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-300 min-h-[120px] shadow-sm hover:shadow-md"
        }
      }
    },
    // Preview section
    preview: {
      base: "bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 p-8 shadow-md",
      title: "text-xl font-bold text-slate-900 mb-6",
      previewCard: {
        base: "bg-white rounded-2xl border border-slate-200/60 p-7 shadow-md",
        header: "flex items-center gap-4 mb-5 pb-5 border-b border-slate-200/50",
        content: "space-y-5"
      }
    }
  },

  // Actions
  actions: {
    base: "flex items-center justify-end gap-5 pt-10 mt-10 border-t border-slate-200/50",
    button: {
      cancel: "px-7 py-3.5 bg-white border border-slate-300/60 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md",
      save: "px-7 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
    }
  }
};

export const routeColors = {
  // Method colors
  methods: {
    get: {
      gradient: "from-green-500 to-emerald-600",
      light: "bg-green-50",
      text: "text-green-700"
    },
    post: {
      gradient: "from-blue-500 to-cyan-600",
      light: "bg-blue-50",
      text: "text-blue-700"
    },
    put: {
      gradient: "from-amber-500 to-orange-600",
      light: "bg-amber-50",
      text: "text-amber-700"
    },
    delete: {
      gradient: "from-rose-500 to-pink-600",
      light: "bg-rose-50",
      text: "text-rose-700"
    },
    patch: {
      gradient: "from-purple-500 to-indigo-600",
      light: "bg-purple-50",
      text: "text-purple-700"
    }
  },

  // Status colors
  status: {
    active: {
      gradient: "from-emerald-500 to-teal-600",
      light: "bg-emerald-50",
      text: "text-emerald-700"
    },
    inactive: {
      gradient: "from-slate-500 to-slate-600",
      light: "bg-slate-50",
      text: "text-slate-700"
    },
    warning: {
      gradient: "from-amber-500 to-orange-600",
      light: "bg-amber-50",
      text: "text-amber-700"
    },
    error: {
      gradient: "from-rose-500 to-pink-600",
      light: "bg-rose-50",
      text: "text-rose-700"
    }
  },

  // Priority colors
  priority: {
    high: {
      gradient: "from-rose-500 to-pink-600",
      light: "bg-rose-50",
      text: "text-rose-700"
    },
    medium: {
      gradient: "from-amber-500 to-orange-600",
      light: "bg-amber-50",
      text: "text-amber-700"
    },
    low: {
      gradient: "from-blue-500 to-cyan-600",
      light: "bg-blue-50",
      text: "text-blue-700"
    }
  }
};

export const dragAndDropStyles = {
  // Drag container
  container: {
    base: "transition-all duration-300",
    draggingOver: "bg-blue-50/50 border-2 border-dashed border-blue-500/50 rounded-2xl"
  },

  // Drag handle
  handle: {
    base: "cursor-move p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-300",
    dragging: "text-blue-500"
  },

  // Drop indicator
  dropIndicator: {
    base: "h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 transition-all duration-300",
    active: "opacity-100 my-4"
  }
};

export const emptyStates = {
  // Empty columns
  columns: {
    base: "flex flex-col items-center justify-center py-20 text-center",
    icon: "text-7xl text-slate-300 mb-8",
    title: "text-2xl font-bold text-slate-700 mb-3",
    subtitle: "text-slate-500 mb-8 max-w-md text-base",
    action: "px-7 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
  },

  // Empty routes
  routes: {
    base: "flex flex-col items-center justify-center py-16 text-center rounded-2xl border-2 border-dashed border-slate-300/60 bg-slate-50/40",
    icon: "text-6xl text-slate-300 mb-5",
    title: "text-xl font-bold text-slate-600 mb-3",
    subtitle: "text-slate-400 text-sm"
  }
};

// Animation classes for route lists
export const listAnimations = {
  itemEnter: "animate-fade-in-up",
  itemExit: "animate-fade-out-down",
  columnEnter: "animate-slide-in-right",
  columnExit: "animate-slide-out-left",
  
  // Stagger animations
  stagger: {
    1: "animation-delay-100",
    2: "animation-delay-200",
    3: "animation-delay-300",
    4: "animation-delay-400",
    5: "animation-delay-500"
  }
};

// Responsive utilities for route management
export const routeResponsive = {
  hideOnMobile: "hidden md:flex",
  showOnMobile: "flex md:hidden",
  mobileGrid: "grid-cols-1",
  tabletGrid: "md:grid-cols-2",
  desktopGrid: "lg:grid-cols-3 xl:grid-cols-4",
  
  // Breakpoints for different layouts
  layouts: {
    compact: "max-w-4xl",
    standard: "max-w-6xl",
    expanded: "max-w-8xl"
  }
};

// Skeleton loading states
export const skeletonStyles = {
  column: {
    base: "animate-pulse bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl",
    header: "h-24",
    item: "h-32 mb-4"
  },
  
  routeItem: {
    base: "animate-pulse bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl",
    header: "h-16 mb-4",
    details: "h-8 mb-3",
    metrics: "h-12 mb-4",
    actions: "h-10"
  }
};

// Custom scrollbar styling
export const scrollbarStyles = {
  container: "scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400",
  dark: "scrollbar-thumb-slate-600 scrollbar-track-slate-800"
};

// Page-level styles for contract-management
export const contractManagementStyles = {
  // Page container
  pageContainer: "font-['Inter',sans-serif] text-slate-800 text-[0.95rem] [&_*]:font-['Inter',sans-serif]",
  mainContent: "flex-grow flex flex-col min-w-0",
  desktopMain: "hidden md:block pt-6 space-y-6",
  mobileMain: "block md:hidden pb-20 space-y-2",
  
  // Tabs
  tabsContainer: "w-full",
  tabsBorder: "relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 px-4 py-3 sm:px-5 sm:py-4 text-foreground shadow-md shadow-black/5 mb-6",
  tabsList: "relative z-10 h-auto p-0 w-full justify-start gap-0",
  tabsTrigger: "px-6 py-3 text-sm font-medium text-slate-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent hover:text-slate-900 transition-colors",
  tabsTriggerIcon: "bi me-2",
  tabsContent: "mt-0",
  
  // Export button
  exportButton: "btn btn-outline-secondary d-flex align-items-center gap-2 !bg-white",
  
  // Mobile
  mobileTitle: "text-lg font-bold bg-gradient-to-br from-slate-900 to-blue-600 bg-clip-text text-transparent tracking-tight",
  mobileSubtitle: "text-[10px] text-slate-500",
  mobileEmptyState: "text-center py-8 text-slate-500",
} as const;

