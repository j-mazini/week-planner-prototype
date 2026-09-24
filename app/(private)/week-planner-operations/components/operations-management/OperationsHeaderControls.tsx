"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, CalendarOff } from "lucide-react";
import { ModernPageHeader, type Metric } from "@/components/modern-page-header";
import { getDayNameEn, formatDate, getISOWeekNumber } from "@/app/(private)/week-planner/utils/dateUtils";
import { weekPlannerOperationsStyles } from "../../styles";
import type { FrontendOperationRecord } from "../../types/operations-management";
import "../../operations-management.css";

function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

type Props = {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onExportCSV?: () => void | Promise<void>;
  onExportPDF?: () => void | Promise<void>;
  onAddNew: () => void;
  onAddAdhocService?: () => void;
  onAddDayOff?: () => void;
  operationsData?: FrontendOperationRecord[];
};

export const OperationsHeaderControls = React.memo(function OperationsHeaderControls({
  selectedDate,
  onDateChange,
  onExportCSV,
  onExportPDF,
  onAddNew,
  onAddAdhocService,
  onAddDayOff,
  operationsData = [],
}: Props) {
  const metrics = useMemo(() => {
    if (!operationsData || operationsData.length === 0) {
      return [] as Metric[];
    }
    const total = operationsData.length;
    const working = operationsData.filter(op => op.Status === 'Working').length;
    const pending = operationsData.filter(op => op.Status === 'Pending').length;
    return [
      { label: 'Total Operations', value: total },
      { label: 'Working', value: working },
      { label: 'Pending', value: pending },
    ] as Metric[];
  }, [operationsData]);

  // Title: page name + day of week (English) + date (UK format) + week number
  const headerTitleContent = useMemo(() => {
    if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) return 'Daily Operations Management';
    const pageName = 'Daily Operations Management';
    const dayName = getDayNameEn(selectedDate);
    const dateUK = formatDate(selectedDate, 'dd/mm');
    const weekNum = getISOWeekNumber(selectedDate);
    const weekNumber = weekNum !== null ? weekNum.toString().padStart(2, '0') : '00';
    return `${pageName} - ${dayName} - ${dateUK} - Week ${weekNumber}`;
  }, [selectedDate]);

  return (
    <div className={weekPlannerOperationsStyles.headerContainer}>
      <ModernPageHeader
        title={headerTitleContent}
        metrics={metrics}
        dashboard={
          <div className={weekPlannerOperationsStyles.headerActions}>
            {/* Day selector — light background for contrast */}
            <div className={weekPlannerOperationsStyles.headerActionsDateWrapper}>
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap bg-white/95 rounded-lg px-2 py-1.5 border border-slate-200/80 shadow-sm">
                <span className="text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 flex-shrink-0 text-slate-600" aria-hidden />
                  Day
                </span>
                <div className="flex items-center rounded-md overflow-hidden border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => onDateChange(addDays(selectedDate || new Date().toISOString().slice(0, 10), -1))}
                    className="p-2 text-slate-700 hover:bg-slate-200/70 transition-colors disabled:opacity-50"
                    title="Previous day"
                    aria-label="Previous day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="date"
                    value={selectedDate || ""}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="min-w-[8rem] px-2 py-1.5 text-sm border-0 bg-transparent text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                    title="Select date"
                    aria-label="Select date"
                  />
                  <button
                    type="button"
                    onClick={() => onDateChange(addDays(selectedDate || new Date().toISOString().slice(0, 10), 1))}
                    className="p-2 text-slate-700 hover:bg-slate-200/70 transition-colors disabled:opacity-50"
                    title="Next day"
                    aria-label="Next day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onAddNew}
              className={weekPlannerOperationsStyles.headerAddButton}
              type="button"
              title="Add Record"
              aria-label="Add Record"
            >
              <svg className={weekPlannerOperationsStyles.headerAddIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Record
            </button>

            {onAddAdhocService ? (
              <button
                onClick={onAddAdhocService}
                className={weekPlannerOperationsStyles.headerAdhocButton}
                type="button"
                title="Add Adhoc Service"
                aria-label="Add Adhoc Service"
              >
                Add Adhoc Service
              </button>
            ) : null}

            {onAddDayOff ? (
              <button
                onClick={onAddDayOff}
                className={weekPlannerOperationsStyles.headerDayOffButton}
                type="button"
                title="Add Day off"
                aria-label="Add Day off"
              >
                <CalendarOff className={weekPlannerOperationsStyles.headerDayOffIcon} aria-hidden />
                Add Day off
              </button>
            ) : null}

            {onExportCSV ? (
              <button
                type="button"
                onClick={() => void onExportCSV()}
                className={weekPlannerOperationsStyles.headerSecondaryButton}
                title="Export CSV"
                aria-label="Export CSV"
              >
                Export CSV
              </button>
            ) : null}

            {onExportPDF ? (
              <button
                type="button"
                onClick={() => void onExportPDF()}
                className={weekPlannerOperationsStyles.headerSecondaryButton}
                title="Export PDF"
                aria-label="Export PDF"
              >
                Export PDF
              </button>
            ) : null}
          </div>
        }
        gradientFrom="slate-900"
        gradientTo="blue-600"
      />
    </div>
  );
});


