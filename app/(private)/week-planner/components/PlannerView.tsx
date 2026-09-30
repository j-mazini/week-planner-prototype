"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download, CheckCircle, Sparkles, UserMinus, CalendarDays } from 'lucide-react';
import DailyComparisonView from './DailyComparisonView';
import WeeklyView from './WeeklyView';
import StickyVendorsPanel from './StickyVendorsPanel';
import DayOffModal, { type DayOffEntry } from './DayOffModal';
import DayScheduleModal from './DayScheduleModal';
import ExportDayScheduleModal from './ExportDayScheduleModal';
import ExportWeekScheduleModal from './ExportWeekScheduleModal';
import PdfPreviewModal, { type PdfEntry } from './PdfPreviewModal';
import ConfirmationModal from './modals/ConfirmationModal';
import ColorLegend from './Common/ColorLegend';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import type { Route, DepositWithRoutesDTO } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import type { VendorCostModel } from '@/lib/vendors';
import { getWeekDates, formatDate, getWeekStart, getWeekEnd, parseLocalDate, getISOWeekNumber } from '../utils/dateUtils';
import { filterAllowedDeposits } from '@/lib/allowedDeposits';
import { registerDayOff } from '@/lib/day-off-api';
import { useCloseSidebarOnModal } from '../hooks/useCloseSidebarOnModal';
import type { DragItem } from '../hooks/useDragAndDrop';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

type PlannerViewProps = {
  date: string; // YYYY-MM-DD format
  data: {
    assignments: WeekPlannerRecord[];
    routes: Route[];
    vendors: Vendor[];
    depositsWithRoutes?: DepositWithRoutesDTO[];
  };
  dayOffEntries?: DayOffEntry[];
  vendors?: Record<string, unknown>[] | null; // Pre-fetched vendors to avoid duplicate requests (null = not loaded yet, [] = loaded but empty)
  onDrop: (e: React.DragEvent<Element>, routeId: number, dateStr: string) => void;
  onEdit: (assignment: WeekPlannerRecord) => void;
  onAssignVendor?: (
    userId: number,
    routeId: number,
    date: string,
    overrides?: {
      vehicleId?: number;
      costModelId?: number;
      routeSort?: "yes" | "no";
      notes?: string;
    }
  ) => void;
  onOpenDraftAssignmentForRoute?: (
    routeId: number,
    date: string,
    depositId?: number,
    depositName?: string,
    routeName?: string,
    editData?: { userId?: number; vehicleId?: number; routeSort?: string; notes?: string; registrationPlate?: string },
  ) => void;
  onDateChange?: (date: string) => void;
  onExportDaySchedule?: (
    selectedDate: string,
    assignments?: WeekPlannerRecord[],
    context?: { dayOffEntries?: DayOffEntry[]; depositsWithRoutes?: DepositWithRoutesDTO[]; vendors?: Vendor[]; exportDepositId?: number; exportDepositName?: string; exportDepositIds?: number[] },
    options?: { returnBlob?: boolean }
  ) => Promise<void | { blob: Blob; filename: string }>;
  onExportWeekSchedule?: (
    depositId: number,
    depositName: string,
    weekDateStrings: string[],
    assignments: WeekPlannerRecord[],
    context?: { dayOffEntries?: DayOffEntry[]; depositsWithRoutes?: DepositWithRoutesDTO[]; vendors?: Vendor[]; showWeekends?: boolean },
    options?: { returnBlob?: boolean }
  ) => Promise<void | { blob: Blob; filename: string }>;
  /** Export week planner to Excel; showWeekends deve refletir o toggle "Show Weekends" da UI */
  onExportExcel?: (showWeekends: boolean) => Promise<void>;
  onSubmitWeek?: () => void | Promise<void>;
  onDefaultSchedule?: (excludeWeekends?: boolean) => void;
  onDaySchedule?: (date: string) => void;
  onDayOffChange?: (entries: DayOffEntry[]) => void;
  onAssignmentDelete?: (assignment: WeekPlannerRecord, options?: { forceDelete?: boolean }) => Promise<void>;
  onRemoveManagementFunction?: (functionTitle: string) => Promise<void>;
  onEditManagementFunction?: (newTitle: string, assignments: WeekPlannerRecord[]) => Promise<void>;
  onEditFlexRoute?: (route: Route) => void;
  onEditAdHocService?: (route: Route) => void;
  onCreateDailyTeamSupport?: (userId: number, routeId: number, date: string) => Promise<void>;
  onCreateAdHocService?: (
    userId: number,
    adhocServiceId: number,
    date: string,
    depositId?: number,
    depositName?: string,
    notes?: string,
    adhocSort?: number,
    dates?: string[],
    vehicleId?: number
  ) => Promise<void>;
  onCreateBaopService?: (
    userId: number,
    routeId: number,
    date: string,
    depositId?: number,
    depositName?: string,
    notes?: string,
    adhocSort?: number
  ) => Promise<void>;
  onCreateManagementSupport?: (data: { 
    userId: number; 
    vendorName: string;
    title: string;
    dates: string[];
    vendorCostModel?: VendorCostModel | null;
    depositId?: number | null;
    managementTeamFunctionId?: number | null;
  }) => Promise<void>;
  canAddManagementSupport?: boolean;
  canAddFlexRoute?: boolean;
  /** Quando true, esconde o campo Adhoc Sort nas modais (para `SUPERVISOR`) */
  hideAdhocSort?: boolean;
  /** When provided, parent controls showWeekends (e.g. for Assign Week to respect it). Otherwise PlannerView uses internal state. */
  showWeekends?: boolean;
  onShowWeekendsChange?: (show: boolean) => void;
  /** When true, enables the Save Week button (there are unsaved in-memory changes) */
  hasUnsavedChanges?: boolean;
};

const PlannerView: React.FC<PlannerViewProps> = ({
  date,
  data,
  dayOffEntries = [],
  vendors,
  onDrop,
  onEdit,
  onAssignVendor,
  onOpenDraftAssignmentForRoute,
  onDateChange,
  onExportDaySchedule,
  onExportWeekSchedule,
  onExportExcel,
  onSubmitWeek,
  onDefaultSchedule,
  onDaySchedule,
  onDayOffChange,
  onAssignmentDelete,
  onRemoveManagementFunction,
  onEditManagementFunction,
  onEditFlexRoute,
  onEditAdHocService,
  onCreateDailyTeamSupport,
  onCreateAdHocService,
  onCreateBaopService,
  onCreateManagementSupport,
  canAddManagementSupport = true,
  canAddFlexRoute = true,
  hideAdhocSort = false,
  showWeekends: showWeekendsProp,
  onShowWeekendsChange,
  hasUnsavedChanges = false,
}) => {
  // Trava síncrona contra double-submit do "Save Week" (o handleSaveWeek é async
  // e longo; sem isto o botão segue clicável durante todo o save).
  const { isSubmitting: isSavingWeek, guard: submitWeekGuard } = useSubmitGuard();
  // Regra: Day View apenas em mobile; fora disso, usar Weekly View.
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });
  // Rule: on <768px force day view; otherwise show normal (weekly) view.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    update();

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    // Safari fallback
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  const viewMode: 'daily' | 'weekly' = isMobile ? 'daily' : 'weekly';
  const [internalShowWeekends, setInternalShowWeekends] = useState(false); // Default: Hide Weekends
  // Use controlled value when parent provides it; otherwise use internal state
  const showWeekends = showWeekendsProp ?? internalShowWeekends;
  const setShowWeekends = useCallback((v: boolean) => {
    if (onShowWeekendsChange) {
      onShowWeekendsChange(v);
    } else {
      setInternalShowWeekends(v);
    }
  }, [onShowWeekendsChange]);
  const [currentDate, setCurrentDate] = useState(parseLocalDate(date));
  const [showDayOffModal, setShowDayOffModal] = useState(false);
  const [showDayScheduleModal, setShowDayScheduleModal] = useState(false);
  const [showExportDayScheduleModal, setShowExportDayScheduleModal] = useState(false);
  const [showExportWeekScheduleModal, setShowExportWeekScheduleModal] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [previewPdfs, setPreviewPdfs] = useState<PdfEntry[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    title: string;
    message: string;
    details?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);
  const [localDayOffEntries, setLocalDayOffEntries] = useState<DayOffEntry[]>(dayOffEntries);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [draggedFromCell, setDraggedFromCell] = useState<HTMLElement | null>(null);

  // Fecha a sidebar sempre que algum modal do planner for aberto
  useCloseSidebarOnModal(
    showDayOffModal,
    showDayScheduleModal,
    showExportDayScheduleModal,
    showExportWeekScheduleModal,
    showConfirmationModal,
  );

  // Use ref to track previous dayOffEntries to avoid infinite loops
  const prevDayOffEntriesRef = useRef<string>(JSON.stringify(dayOffEntries));
  const isInternalUpdateRef = useRef(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Vendors available for Day Off modal: start from vendors already loaded in planner,
  // then merge in ALL vendors from GET /bff/vendor (prop `vendors`) converted to Vendor shape.
  const dayOffVendors: Vendor[] = useMemo(() => {
    const byId = new Map<number, Vendor>();

    // Seed with existing vendors from planner data
    (data.vendors ?? []).forEach((d) => {
      if (d.userId && d.userId > 0) {
        byId.set(d.userId, d);
      }
    });

    // Merge vendors from /bff/vendor (all vendors)
    if (vendors && Array.isArray(vendors)) {
      vendors.forEach((raw) => {
        const v = raw as Record<string, unknown>;
        const userId = Number(v.userId ?? 0);
        if (!userId || userId <= 0) {
          return;
        }
        if (byId.has(userId)) {
          return;
        }

        const fullName =
          (typeof v.fullName === "string" && v.fullName.trim()) ||
          `${String(v.name || "")} ${String(v.lastName || "")}`.trim() ||
          "Unknown Vendor";

        byId.set(userId, {
          userId: userId,
          fullName: fullName,
          drivingLicenceExpiryDate: v.drivingLicenceExpiryDate
            ? String(v.drivingLicenceExpiryDate)
            : null,
          dvlaCheckDate: v.dvlaCheckDate ? String(v.dvlaCheckDate) : null,
          vendorTypeId:
            v.vendorTypeId != null ? Number(v.vendorTypeId) : null,
          costModelId:
            v.costModelId != null ? Number(v.costModelId) : null,
          routeId: v.routeId != null ? Number(v.routeId) : null,
          vehicleId: v.vehicleId != null ? Number(v.vehicleId) : null,
        });
      });
    }

    return Array.from(byId.values()).sort((a, b) =>
      (a.fullName ?? "").localeCompare(b.fullName ?? "", undefined, {
        sensitivity: "base",
      }),
    );
  }, [data.vendors, vendors]);

  // Calculate week dates - always weekly view
  const weekDates = useMemo(() => {
    return getWeekDates(date);
  }, [date]);

  const weekStart = useMemo(() => getWeekStart(date), [date]);
  const weekEnd = useMemo(() => getWeekEnd(date), [date]);

  const weekNumber = useMemo(() => {
    const week = getISOWeekNumber(date);
    return week !== null ? week.toString().padStart(2, '0') : '00';
  }, [date]);

  // Título: data à frente do nome da página (visualização da data primeiro)
  const headerTitleContent = useMemo(() => {
    const pageName = 'Weekly Planner';
    const weekStartUK = formatDate(weekStart, 'dd/mm');
    const weekEndUK = formatDate(weekEnd, 'dd/mm');
    return `${weekStartUK} – ${weekEndUK} (Week ${weekNumber}) · ${pageName}`;
  }, [weekStart, weekEnd, weekNumber]);

  // Update current date when prop changes
  useEffect(() => {
    setCurrentDate(parseLocalDate(date));
  }, [date]);

  // Sync local day off entries with prop - using ref to prevent infinite loops
  useEffect(() => {
    // Skip update if this is an internal update (from our own handlers)
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    
    // Compare by JSON string to check if arrays are actually different
    const currentStr = JSON.stringify(dayOffEntries);
    const prevStr = prevDayOffEntriesRef.current;
    
    // Only update if the arrays are actually different
    if (prevStr !== currentStr) {
      setLocalDayOffEntries(dayOffEntries);
      prevDayOffEntriesRef.current = currentStr;
    }
  }, [dayOffEntries]);


  // Header metrics
  const headerMetrics = useMemo(() => {
    const weekDateStrs = weekDates.map(d => formatDate(d, 'yyyy-mm-dd'));
    const assignmentsCount = data.assignments.filter(a => 
      weekDateStrs.includes(a.date)
    ).length;

    const uniqueVendors = new Set(
      data.assignments
        .filter(a => weekDateStrs.includes(a.date))
        .map(a => a.name)
    ).size;

    return {
      assignments: assignmentsCount,
      vendors: uniqueVendors,
    };
  }, [data.assignments, weekDates]);

  // Date navigation - always weekly
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    const dateStr = formatDate(newDate, 'yyyy-mm-dd');
    setCurrentDate(newDate);
    onDateChange?.(dateStr);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    const dateStr = formatDate(newDate, 'yyyy-mm-dd');
    setCurrentDate(newDate);
    onDateChange?.(dateStr);
  };

  // Month and year selection
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2000, i, 1);
    return {
      value: i,
      label: date.toLocaleDateString('en-US', { month: 'long' }),
    };
  });

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleMonthChange = (month: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month);
    const dateStr = formatDate(newDate, 'yyyy-mm-dd');
    setCurrentDate(newDate);
    onDateChange?.(dateStr);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    const dateStr = formatDate(newDate, 'yyyy-mm-dd');
    setCurrentDate(newDate);
    onDateChange?.(dateStr);
  };

  // Nota: não há toggle manual; view é definida por tamanho de ecrã.
  // Helper function to check if an assignment belongs to a specific vendor
  const isAssignmentForVendor = useCallback((assignment: WeekPlannerRecord, userId: number): boolean => {
    const raw = assignment.raw as Record<string, unknown> | undefined;
    const vendor = data.vendors.find(d => d.userId === userId);
    
    if (!vendor) return false;
    
    // Check by userId in raw data
    if (raw?.userId && Number(raw.userId) === userId) {
      return true;
    }
    
    // Check by userId in nested vendor object
    if (raw?.vendor && typeof raw.vendor === 'object') {
      const vendorObj = raw.vendor as Record<string, unknown>;
      if (vendorObj.userId && Number(vendorObj.userId) === userId) {
        return true;
      }
    }
    
    // Check by userId (for management support assignments)
    if (raw?.userId && Number(raw.userId) === vendor.userId) {
      return true;
    }
    
    // Check by name comparison
    if (assignment.name && vendor.fullName) {
      if (assignment.name === vendor.fullName || 
          assignment.name.toLowerCase() === vendor.fullName.toLowerCase()) {
        return true;
      }
    }
    
    return false;
  }, [data.vendors]);

  // Handle day off registration
  const handleSaveDayOff = async (dayOffData: { userId: number; dates: string[]; reason: string; notes: string }) => {
    try {
      // Day Off cannot be created for today or past dates - only from tomorrow onwards (based on current_date)
      const today = new Date();
      const todayStr = formatDate(today, 'yyyy-mm-dd');
      const hasRetroactiveDate = dayOffData.dates.some((d) => d <= todayStr);
      if (hasRetroactiveDate) {
        throw new Error('Day off cannot be created for today or past dates. Only dates from tomorrow onwards are allowed.');
      }

      // Remover datas já marcadas como OFF (permitir criação parcial)
      const existingOffDates = new Set(
        localDayOffEntries
          .filter((entry) => entry.userId === dayOffData.userId)
          .map((entry) => entry.date),
      );
      const datesToCreate = (dayOffData.dates || []).filter((d) => !existingOffDates.has(d));
      if (datesToCreate.length === 0) {
        throw new Error('This vendor is already marked as day off.');
      }

      // Find ALL assignments for the vendor on the selected dates (excluding OFF assignments)
      const allVendorAssignments = data.assignments.filter(a => {
        // Check if assignment is on one of the day off dates
        if (!datesToCreate.includes(a.date)) {
          return false;
        }

        // Keep Management and Support entries untouched when creating Day Off.
        // They are not regular route assignments and should not be auto-removed.
        const raw = a.raw as Record<string, unknown> | undefined;
        const isManagementSupport =
          (typeof a.weekPlannerId === 'number' && a.weekPlannerId < 0) ||
          raw?.dailyTeamSupportId != null ||
          raw?.category === 'management' ||
          String(a.route || '').toLowerCase().includes('management and support');

        if (isManagementSupport) {
          return false;
        }
        
        // Exclude OFF assignments (they are not conflicts)
        const isDayOff = a.isDayOff === "true" || 
                        raw?.isDayOff === true || 
                        raw?.isDayOff === "true" ||
                        String(a.route || "").toUpperCase() === "OFF";
        
        if (isDayOff) {
          return false;
        }
        
        // Check if assignment belongs to the vendor
        return isAssignmentForVendor(a, dayOffData.userId);
      });

      // Automatically remove all assignments for the vendor on these dates.
      // We process deletions concurrently via Promise.allSettled to ensure UI removes items cleanly
      // without encountering "Stale State" bugs during the async loop. 
      // The forceDelete bypasses the NotAllocated conversion — for Day Off, all records must be hard-deleted.
      if (allVendorAssignments.length > 0 && onAssignmentDelete) {
        await Promise.allSettled(
          allVendorAssignments.map((assignment) =>
            onAssignmentDelete(assignment, { forceDelete: true })
          )
        );
      }

      // Proceed with day off registration
      await completeDayOffRegistration({ ...dayOffData, dates: datesToCreate });
    } catch (error) {
      console.error('Error registering day off:', error);
      throw error;
    }
  };

  // Helper function to complete day off registration
  const completeDayOffRegistration = async (dayOffData: { userId: number; dates: string[]; reason: string; notes: string }) => {
    // Check for conflicting day off entries (safety check)
    const existingOffDates = new Set(
      localDayOffEntries
        .filter((entry) => entry.userId === dayOffData.userId)
        .map((entry) => entry.date),
    );
    const datesToCreate = (dayOffData.dates || []).filter((d) => !existingOffDates.has(d));
    if (datesToCreate.length === 0) {
      throw new Error('This vendor is already marked as day off.');
    }

    // Register day off
    const createdEntries = await registerDayOff({ ...dayOffData, dates: datesToCreate });
    const newEntries = [...localDayOffEntries, ...createdEntries];
    const dedupedEntries = Array.from(
      new Map(newEntries.map((entry) => [`${entry.userId}-${entry.date}`, entry])).values()
    );
    setLocalDayOffEntries(dedupedEntries);
    
    // Mark as internal update to prevent loop
    isInternalUpdateRef.current = true;
    const newEntriesStr = JSON.stringify(dedupedEntries);
    prevDayOffEntriesRef.current = newEntriesStr;
    
    if (onDayOffChange) {
      onDayOffChange(dedupedEntries);
    }
    setShowDayOffModal(false);
  };


  return (
    <div className="w-full space-y-2">
              {/* Page Header */}
      <div
        ref={headerRef}
        className={[
          "relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/60",
          "bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55",
          "p-4 sm:p-5 text-foreground shadow-md shadow-black/5",
        ].join(" ")}
      >
        {/* Glass highlights */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-60" />
        <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_50%)]" />
                </div>
                
        <div className="relative z-10 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
          {/* Title + metrics */}
          <div className="min-w-0">
                    <div className="flex flex-col gap-1">
              <h1 className="m-0 text-3xl font-semibold tracking-tight">
                <span className="bg-gradient-to-br from-slate-900 to-indigo-600 bg-clip-text text-transparent dark:from-white dark:to-indigo-300">
                        {headerTitleContent}
                </span>
                      </h1>
                    </div>

            {/* Metrics (scrollable on small screens) */}
            <div className="mt-2">
              <div className="flex gap-2 overflow-x-auto pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-[150px] flex-col gap-0.5 rounded-lg border border-border/60 bg-background/55 px-3 py-2 backdrop-blur-md shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignments</span>
                  <span className="text-lg font-bold text-foreground">{headerMetrics.assignments}</span>
                  </div>
                <div className="flex min-w-[150px] flex-col gap-0.5 rounded-lg border border-border/60 bg-background/55 px-3 py-2 backdrop-blur-md shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vendors</span>
                  <span className="text-lg font-bold text-foreground">{headerMetrics.vendors}</span>
                      </div>
                      </div>
                      </div>
                    </div>

        </div>

                {/* Controls Section - bloco da semana e botões alinhados na mesma linha */}
        <div className="relative z-10 w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    {/* Select Week - alinhado em altura com os botões (h-9) */}
            <div className="flex flex-wrap items-center gap-2 min-h-9">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/55 px-1.5 py-0 backdrop-blur-md h-9">
                        <button
                          onClick={handlePrev}
                          type="button"
                          title="Previous Week"
                          className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border/60 bg-background/50 text-xs font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/30 active:scale-[0.99]"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <select
                          value={currentDate.getMonth()}
                          onChange={(e) => handleMonthChange(Number(e.target.value))}
                          className="h-9 min-w-0 rounded-md border border-border/60 bg-background/50 px-2 text-xs font-medium text-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-ring/30 [&_option]:text-slate-900 dark:[&_option]:text-slate-100"
                        >
                          {months.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={currentDate.getFullYear()}
                          onChange={(e) => handleYearChange(Number(e.target.value))}
                          className="h-9 min-w-0 rounded-md border border-border/60 bg-background/50 px-2 text-xs font-medium text-foreground backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-ring/30 [&_option]:text-slate-900 dark:[&_option]:text-slate-100"
                        >
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={handleNext}
                          type="button"
                          title="Next Week"
                          className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border/60 bg-background/50 text-xs font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/30 active:scale-[0.99]"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

            {/* Botões da página - alinhados ao bloco da semana */}
            <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
              <button
                onClick={() => setShowWeekends(!showWeekends)}
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/55 px-3 text-xs font-medium text-foreground backdrop-blur-md transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/30 active:scale-[0.99]"
              >
                <Calendar className="h-4 w-4" />
                <span>{showWeekends ? 'Hide Weekends' : 'Show Weekends'}</span>
              </button>

              {onDayOffChange && (
                <button
                  onClick={() => setShowDayOffModal(true)}
                  type="button"
                  title="Register day off"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/55 px-3 text-xs font-medium text-foreground backdrop-blur-md transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/30 active:scale-[0.99]"
                >
                  <UserMinus className="h-4 w-4" />
                  <span>Day Off</span>
                </button>
              )}

              {onExportDaySchedule && (
                <button
                  type="button"
                  title="Export Day Schedule"
                  onClick={() => setShowExportDayScheduleModal(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/55 px-3 text-xs font-medium text-foreground backdrop-blur-md transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/30 active:scale-[0.99]"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Day</span>
                </button>
              )}

              {onExportWeekSchedule && (
                <button
                  type="button"
                  title="Export Week Schedule by deposit"
                  onClick={() => setShowExportWeekScheduleModal(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/55 px-3 text-xs font-medium text-foreground backdrop-blur-md transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/30 active:scale-[0.99]"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Week</span>
                </button>
              )}

              {onExportExcel && (
                <button
                  type="button"
                  title={showWeekends ? "Export Excel (week including weekends)" : "Export Excel (weekdays only)"}
                  onClick={() => onExportExcel(showWeekends)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/55 px-3 text-xs font-medium text-foreground backdrop-blur-md transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/30 active:scale-[0.99]"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Excel</span>
                </button>
              )}

              {onDefaultSchedule && (
                <button
                  onClick={() => onDefaultSchedule(!showWeekends)}
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-indigo-400/50 bg-indigo-500/80 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.99]"
                  title={showWeekends ? "Generate default schedule for all core routes for the entire week (including weekends)" : "Generate default schedule for all core routes for weekdays only (Mon–Fri)"}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Generate Week</span>
                </button>
              )}

              {onDaySchedule && (
                <button
                  onClick={() => setShowDayScheduleModal(true)}
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-indigo-400/50 bg-indigo-500/80 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.99]"
                  title="Generate schedule for a specific day of the week"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Day</span>
                </button>
              )}

              {onSubmitWeek && (
                <button
                  onClick={submitWeekGuard(() => onSubmitWeek?.())}
                  type="button"
                  disabled={!hasUnsavedChanges || isSavingWeek}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border border-green-400/50 bg-gradient-to-r from-green-500 to-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 active:scale-[0.99] ${!hasUnsavedChanges ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={hasUnsavedChanges ? "Save week - All core routes must be assigned for all days" : "No unsaved changes"}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Save Week</span>
                </button>
              )}
            </div>
                </div>
              </div>
      </div>

      {/* Legenda (cores do planner) */}
      <ColorLegend />

      {/* Main Content */}
      <div className="w-full">
        {viewMode === 'daily' ? (
          <DailyComparisonView
            startDate={currentDate}
            daysToShow={showWeekends ? 7 : 5}
            showWeekends={showWeekends}
            data={data}
            depositsWithRoutes={data.depositsWithRoutes}
            onDrop={onDrop}
            onEdit={onEdit}
            onDateChange={(newDate) => {
              setCurrentDate(newDate);
              onDateChange?.(formatDate(newDate, 'yyyy-mm-dd'));
            }}
            draggedItem={draggedItem}
            draggedFromCell={draggedFromCell}
            onDragStart={(e, data, cell) => {
              setDraggedItem(data);
              setDraggedFromCell(cell);
            }}
            onCreateAdHocService={onCreateAdHocService}
            hideAdhocSort={hideAdhocSort}
          />
        ) : (
          <WeeklyView
            date={formatDate(currentDate, 'yyyy-mm-dd')}
            data={{
              assignments: data.assignments,
              routes: data.routes,
              vendors: data.vendors,
            }}
            dayOffEntries={localDayOffEntries}
            depositsWithRoutes={data.depositsWithRoutes}
            showWeekends={showWeekends}
            onDrop={onDrop}
            onEdit={onEdit}
            onAssignVendor={onAssignVendor}
            onOpenDraftAssignmentForRoute={onOpenDraftAssignmentForRoute}
            onCreateDailyTeamSupport={onCreateDailyTeamSupport}
            onCreateAdHocService={onCreateAdHocService}
            onCreateBaopService={onCreateBaopService}
            onCreateManagementSupport={onCreateManagementSupport}
            canAddManagementSupport={canAddManagementSupport}
            canAddFlexRoute={canAddFlexRoute}
            onAssignmentDelete={onAssignmentDelete}
            onRemoveManagementFunction={onRemoveManagementFunction}
            onEditManagementFunction={onEditManagementFunction}
            onEditFlexRoute={onEditFlexRoute}
            onEditAdHocService={onEditAdHocService}
            hideAdhocSort={hideAdhocSort}
          />
        )}
      </div>

      {/* Vendors Drawer - mostra a semana inteira em um grid de vendors não alocados, alinhado ao week planner */}
      <StickyVendorsPanel
        routes={data.routes}
        assignments={data.assignments}
        date={formatDate(currentDate, 'yyyy-mm-dd')}
        showWeekends={showWeekends}
        dayOffEntries={localDayOffEntries}
        headerRef={headerRef}
        isDailyView={false}
        vendors={vendors}
        onVendorDragStart={() => {
          // Optional: visual feedback
        }}
      />

              {/* Day Off Modal */}
              {onDayOffChange && (
                <DayOffModal
                  open={showDayOffModal}
                  onClose={() => setShowDayOffModal(false)}
                  onSave={handleSaveDayOff}
                  vendors={dayOffVendors}
                  currentDate={currentDate}
                />
              )}

              {/* Confirmation Modal */}
              {confirmationData && (
                <ConfirmationModal
                  open={showConfirmationModal}
                  onClose={() => {
                    if (confirmationData?.onCancel) {
                      confirmationData.onCancel();
                    }
                    setShowConfirmationModal(false);
                    setConfirmationData(null);
                  }}
                  onConfirm={async () => {
                    if (confirmationData) {
                      try {
                        await confirmationData.onConfirm();
                        setShowConfirmationModal(false);
                        setConfirmationData(null);
                      } catch (error) {
                        // Error is handled in onConfirm
                        console.error('Error in confirmation:', error);
                      }
                    }
                  }}
                  title={confirmationData.title}
                  message={confirmationData.message}
                  details={confirmationData.details}
                  variant="warning"
                  confirmText="Yes, Remove Assignments"
                  cancelText="Cancel"
                />
              )}

              {/* Day Schedule Modal */}
              <DayScheduleModal
                open={showDayScheduleModal}
                onClose={() => setShowDayScheduleModal(false)}
                onConfirm={(selectedDate) => {
                  onDaySchedule?.(selectedDate);
                }}
                currentDate={currentDate}
              />

              {/* Export Day Schedule Modal */}
              <ExportDayScheduleModal
                open={showExportDayScheduleModal}
                onClose={() => setShowExportDayScheduleModal(false)}
                onConfirm={async (selectedDates, selectedDepositIds) => {
                  const allDeposits = filterAllowedDeposits(data.depositsWithRoutes || []);
                  const deposits = selectedDepositIds === 'all'
                    ? allDeposits
                    : allDeposits.filter((d) => d.depositId != null && (selectedDepositIds as number[]).includes(d.depositId));
                  const depositIds = deposits.map((d) => d.depositId).filter((id): id is number => id != null);
                  const ctx = {
                    dayOffEntries: localDayOffEntries,
                    depositsWithRoutes: data.depositsWithRoutes,
                    vendors: data.vendors,
                    exportDepositIds: depositIds,
                  };
                  try {
                    const collected: PdfEntry[] = [];
                    for (const selectedDate of selectedDates) {
                      const result = await onExportDaySchedule?.(selectedDate, data.assignments, ctx, { returnBlob: true });
                      if (result && typeof result === 'object' && result.blob) {
                        collected.push({ blob: result.blob, filename: result.filename });
                      }
                    }
                    if (collected.length > 0) {
                      setPreviewPdfs(collected);
                      setShowPdfPreview(true);
                      setShowExportDayScheduleModal(false);
                    }
                  } catch (error) {
                    console.error('Error exporting day PDF:', error);
                  }
                }}
                currentDate={currentDate}
                assignments={data.assignments}
                depositsWithRoutes={data.depositsWithRoutes}
              />

              {/* Export Week Schedule Modal — one PDF per depot, same styling as Day Schedule */}
              <ExportWeekScheduleModal
                open={showExportWeekScheduleModal}
                onClose={() => setShowExportWeekScheduleModal(false)}
                onConfirm={async (deposits, meta) => {
                  const weekDatesArr = getWeekDates(currentDate);
                  const withWeekends = meta?.includeWeekends ?? showWeekends;
                  const weekDateStrings = withWeekends
                    ? weekDatesArr.map((d) => formatDate(d, 'yyyy-mm-dd'))
                    : weekDatesArr.filter((_, i) => i < 5).map((d) => formatDate(d, 'yyyy-mm-dd'));
                  const ctx = {
                    dayOffEntries: localDayOffEntries,
                    depositsWithRoutes: data.depositsWithRoutes,
                    vendors: data.vendors,
                    showWeekends: withWeekends,
                  };
                  try {
                    const collected: PdfEntry[] = [];
                    for (const dep of deposits) {
                      const result = await onExportWeekSchedule?.(dep.depositId, dep.depositName, weekDateStrings, data.assignments, ctx, { returnBlob: true });
                      if (result && typeof result === 'object' && result.blob) {
                        collected.push({ blob: result.blob, filename: result.filename });
                      }
                    }
                    if (collected.length > 0) {
                      setPreviewPdfs(collected);
                      setShowPdfPreview(true);
                      setShowExportWeekScheduleModal(false);
                    }
                  } catch (error) {
                    console.error('Error exporting week PDF:', error);
                  }
                }}
                currentDate={currentDate}
                depositsWithRoutes={data.depositsWithRoutes}
                showWeekends={showWeekends}
              />

              {/* PDF Preview Modal */}
              <PdfPreviewModal
                open={showPdfPreview}
                onClose={() => { setShowPdfPreview(false); setPreviewPdfs([]); }}
                pdfs={previewPdfs}
              />
    </div>
  );
};

export default PlannerView;

