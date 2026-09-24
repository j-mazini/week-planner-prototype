"use client";

import { useMemo, useRef, useEffect, useState } from 'react';
import type { DailyPerformanceData } from '@/lib/vendor-performance-api';
import type { ProcessedVendor } from '../utils';
import { formatMonthYear, getTimeWindowClass, generateCarouselMonths } from '../utils';
import { LoadingSpinner } from './LoadingSpinner';
import { AnimatedMetricChart } from './AnimatedMetricChart';
import { KpiDashboardAlt } from './KpiDashboardAlt';
import { PerformanceTableRow } from './PerformanceTableRow';
import { cn } from '@/lib/utils';
import type { VendorMonthAverages } from './PerformanceModal';

export type CarouselMonth = { year: number; month: number; label: string };

export interface GeneralSummaryStats {
  totalVendors: number;
  avgTw: string;
  avgSpr: string;
  avgSporH: string;
  avgAfd: string;
}

const EMPTY_AVERAGES: VendorMonthAverages = { avgTw: '--:--', avgSpr: '--:--', avgSporH: '--:--', avgAfd: '--:--' };

interface PerformanceDetailViewProps {
  vendor: ProcessedVendor | null;
  selectedYear: number;
  selectedMonth: number;
  monthData: DailyPerformanceData[];
  /** Médias do mês pré-computadas pelo backend (currentMonth de /bff/daily-overview/list). */
  averages?: VendorMonthAverages;
  loading: boolean;
  onMonthSelect: (year: number, month: number) => void;
  /** When provided, only these months are shown (e.g. only months with records). Otherwise last 12 months. */
  carouselMonths?: CarouselMonth[];
  /** True while carousel months (with data) are being loaded; avoids showing "No records" too early. */
  carouselMonthsLoading?: boolean;
  /** When no vendor selected: show current month overview with these stats. */
  generalStats?: GeneralSummaryStats | null;
  /** Loading state for general (current month) summary when no vendor. */
  generalLoading?: boolean;
}

export function PerformanceDetailView({
  vendor,
  selectedYear,
  selectedMonth,
  monthData,
  averages = EMPTY_AVERAGES,
  loading,
  onMonthSelect,
  carouselMonths: carouselMonthsProp,
  carouselMonthsLoading = false,
  generalStats = null,
  generalLoading = false,
}: PerformanceDetailViewProps) {
  const today = useMemo(() => new Date(), []);
  const fallbackMonths = useMemo(() => generateCarouselMonths(today), [today]);
  const carouselMonths = carouselMonthsProp != null && carouselMonthsProp.length > 0 ? carouselMonthsProp : fallbackMonths;
  const carouselRef = useRef<HTMLDivElement>(null);
  const [kpiView, setKpiView] = useState<'charts' | 'summary'>('summary');

  const isGeneralView = vendor == null && (generalStats != null || generalLoading);

  useEffect(() => {
    if (!carouselRef.current) return;
    const selectedMonthIndex = carouselMonths.findIndex(
      (item) => item.year === selectedYear && item.month === selectedMonth
    );
    if (selectedMonthIndex === -1) return;
    const timeoutId = setTimeout(() => {
      const items = carouselRef.current?.querySelectorAll('[data-month-item]');
      if (items?.[selectedMonthIndex]) {
        items[selectedMonthIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [carouselMonths, selectedYear, selectedMonth]);

  const calculateAverages = averages;

  const processedTableRows = useMemo(() => {
    const daysWithData = monthData.filter((dayData) => {
      return !(
        dayData.route === 'N/A' &&
        dayData.stops === 'N/A' &&
        dayData.sporH === 'N/A' &&
        dayData.tw === 'N/A' &&
        dayData.spr === 'N/A'
      );
    });
    if (daysWithData.length === 0) {
      return (
        <tr>
          <td colSpan={16} className="text-center py-4 text-xs text-gray-400 italic">
            No data available for this month.
          </td>
        </tr>
      );
    }
    return daysWithData.reverse().map((dayData, idx) => (
      <PerformanceTableRow key={`${dayData.day}-${dayData.route}-${idx}`} dayData={dayData} index={idx} />
    ));
  }, [monthData]);

  if (!vendor && !isGeneralView) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-500" role="status">
        <p className="text-xs font-medium">No vendor selected</p>
        <p className="text-[10px] mt-0.5">Choose a vendor above to see their performance (metrics and daily breakdown) here.</p>
      </div>
    );
  }

  if (!vendor && generalLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 flex items-center justify-center" role="status">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (isGeneralView && generalStats) {
    return (
      <div className="space-y-4">
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <span
            className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-white text-slate-800 border-gray-200 font-semibold flex-shrink-0 shadow-sm"
            aria-current="true"
          >
            {formatMonthYear(selectedYear, selectedMonth)}
          </span>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <h6 className="text-sm font-semibold text-slate-800">
                {formatMonthYear(selectedYear, selectedMonth)} – Overview (all vendors)
              </h6>
              <p className="text-xs text-slate-500">{generalStats.totalVendors} vendors with data</p>
            </div>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setKpiView('summary')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                  kpiView === 'summary' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                )}
              >
                Summary
              </button>
              <button
                type="button"
                onClick={() => setKpiView('charts')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                  kpiView === 'charts' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                )}
              >
                Charts
              </button>
            </div>
          </div>
          {kpiView === 'summary' ? (
            <KpiDashboardAlt metrics={generalStats} shortLabels={false} />
          ) : (
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              <AnimatedMetricChart
                label="Avg TW"
                value={generalStats.avgTw}
                className={getTimeWindowClass(generalStats.avgTw)}
                isNA={generalStats.avgTw === '--:--'}
                type="gauge"
              />
              <AnimatedMetricChart
                label="Avg SPR"
                value={generalStats.avgSpr}
                isNA={generalStats.avgSpr === '--:--'}
                type="thermometer"
              />
              <AnimatedMetricChart
                label="Avg SPOR-H"
                value={generalStats.avgSporH}
                isNA={generalStats.avgSporH === '--:--'}
                type="clock"
              />
              <AnimatedMetricChart
                label="Avg AFD"
                value={generalStats.avgAfd}
                className="text-blue-600"
                isNA={generalStats.avgAfd === '--:--'}
                type="gauge"
              />
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-3 py-2 border-b border-blue-600">
            <h6 className="text-sm font-bold text-slate-800">Daily Breakdown</h6>
          </div>
          <div className="p-4 text-center text-slate-500">
            <p className="text-xs">Select a vendor above to see daily breakdown by day.</p>
          </div>
        </div>
      </div>
    );
  }

  const noMonthsWithData = carouselMonthsProp != null && carouselMonthsProp.length === 0 && !carouselMonthsLoading;

  if (noMonthsWithData) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-500" role="status">
        <p className="text-xs font-medium">No records for this vendor</p>
        <p className="text-[10px] mt-0.5">This vendor has no performance data in the last 12 months.</p>
      </div>
    );
  }

  if (carouselMonthsProp != null && carouselMonthsProp.length === 0 && carouselMonthsLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 flex items-center justify-center" role="status">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date carousel */}
      <div>
        <div
          className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 touch-pan-x"
          ref={carouselRef}
        >
          {carouselMonths.map((item) => {
            const isActive = item.year === selectedYear && item.month === selectedMonth;
            return (
              <button
                key={`${item.year}-${item.month}`}
                data-month-item
                type="button"
                className={`px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap text-xs font-medium transition-all duration-200 border flex-shrink-0 bg-white border-gray-200 ${
                  isActive
                    ? 'text-slate-800 border-blue-300 font-semibold shadow-sm'
                    : 'text-slate-600 hover:border-gray-300'
                }`}
                onClick={() => onMonthSelect(item.year, item.month)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics cards */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h6 className="text-sm font-semibold text-slate-800">
            {vendor?.firstName} {vendor?.lastName} – {formatMonthYear(selectedYear, selectedMonth)} Performance
          </h6>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setKpiView('summary')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                kpiView === 'summary' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              )}
            >
              Summary
            </button>
            <button
              type="button"
              onClick={() => setKpiView('charts')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                kpiView === 'charts' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              )}
            >
              Charts
            </button>
          </div>
        </div>
        {kpiView === 'summary' ? (
          <KpiDashboardAlt metrics={calculateAverages} shortLabels />
        ) : (
          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <AnimatedMetricChart
              label="TW"
              value={calculateAverages.avgTw}
              className={getTimeWindowClass(calculateAverages.avgTw)}
              isNA={calculateAverages.avgTw === '--:--'}
              type="gauge"
            />
            <AnimatedMetricChart
              label="SPR"
              value={calculateAverages.avgSpr}
              isNA={calculateAverages.avgSpr === '--:--'}
              type="thermometer"
            />
            <AnimatedMetricChart
              label="SPOR-H"
              value={calculateAverages.avgSporH}
              isNA={calculateAverages.avgSporH === '--:--'}
              type="clock"
            />
            <AnimatedMetricChart
              label="AFD"
              value={calculateAverages.avgAfd}
              className="text-blue-600"
              isNA={calculateAverages.avgAfd === '--:--'}
              type="gauge"
            />
          </div>
        )}
      </div>

      {/* Daily breakdown table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-blue-600">
          <h6 className="text-sm font-bold text-slate-800">Daily Breakdown</h6>
        </div>
        {loading ? (
          <div className="p-4">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-blue-600">
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Day</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Route</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Not Received">NR</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Failed Pick">FP</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Business Address">BA</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Not Home">NH</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Customer">CM</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Closed on Arrival">CA</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Pick Up">PU</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="OK">OK</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Home Not">HN</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Paid">PD</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide">SPR</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide">SPOR-H</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Route Hours (worked hours)">HR RTE</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide" title="Route Time Window %">RTW</th>
                  <th className="text-left px-2 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide">AFD</th>
                </tr>
              </thead>
              <tbody>{processedTableRows}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
