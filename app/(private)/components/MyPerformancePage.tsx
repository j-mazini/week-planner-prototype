"use client";

import { useAuth } from "@/hooks/useAuth";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { hasAuthSession, getBearerAuthHeader } from "@/lib/auth";
import { useDateStore } from "@/lib/date-store";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { PerformanceLayout } from "./PerformanceLayout";
import { type PerformanceView } from "./PerformanceTabs";
import { DailyPerformanceData } from "../daily-performance-insight/types";
import { DaysCarousel } from "../daily-performance-insight/DaysCarousel";
import { OperationCard } from "../daily-performance-insight/OperationCard";
import { MonthSelector } from "../daily-performance-insight/components/MonthSelector";
import { isDayOff } from "../daily-performance-insight/utils";
import { dailyPerformanceInsightStyles } from "../daily-performance-insight/styles";
import { MonthCarousel } from "../current-performance/components/MonthCarousel";
import { MonthlyAverages } from "../current-performance/components/MonthlyAverages";
import { DailyBreakdownTable } from "../current-performance/components/DailyBreakdownTable";
import { useCurrentPerformanceData } from "../current-performance/hooks/useCurrentPerformanceData";

function DailyPerformanceView() {
  const router = useRouter();
  const { selectedDate: storedDate, setSelectedDate } = useDateStore();
  const [performanceData, setPerformanceData] = useState<DailyPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : "0";

  const selectedDate = useMemo(() => {
    const date = storedDate instanceof Date ? storedDate : new Date(storedDate);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }, [storedDate]);
  const displayMonth = useMemo(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    [selectedDate]
  );

  useEffect(() => {
    if (!hasAuthSession()) router.push("/home");
  }, [router]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== "shared-date-storage" || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed.state?.selectedDate) {
          const nextDate = new Date(parsed.state.selectedDate);
          if (nextDate.getTime() !== selectedDate.getTime()) setSelectedDate(nextDate);
        }
      } catch (error) {
        console.error("Error parsing storage event:", error);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [selectedDate, setSelectedDate]);

  const fetchDailyPerformance = useCallback(async (dateToFetch: Date) => {
    if (userId === "0") return;
    setLoading(true);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/bff/day-overview/${userId}/${format(dateToFetch, "yyyy-MM-dd")}?metrics=performance`,
        { method: "GET", headers: { ...getBearerAuthHeader() }, credentials: "include" }
      );
      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          setPerformanceData([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const operations = Array.isArray(data) ? data : [data];
      const unique = new Map<number, DailyPerformanceData>();
      operations.forEach((operation: DailyPerformanceData) => {
        if (operation.operationId && !unique.has(operation.operationId)) unique.set(operation.operationId, operation);
      });
      setPerformanceData(Array.from(unique.values()).map((operation) =>
        isDayOff(operation) ? { ...operation, isSpms: true } : operation
      ));
    } catch (error) {
      console.error("Error fetching performance data:", error);
      setPerformanceData([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId !== "0") fetchDailyPerformance(selectedDate);
  }, [selectedDate, userId, fetchDailyPerformance]);

  const handlePrevMonth = useCallback(() => {
    const previous = new Date(selectedDate);
    previous.setDate(1);
    previous.setMonth(previous.getMonth() - 1);
    setSelectedDate(previous);
  }, [selectedDate, setSelectedDate]);
  const handleNextMonth = useCallback(() => {
    const next = new Date(selectedDate);
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    setSelectedDate(next);
  }, [selectedDate, setSelectedDate]);
  const handleDayClick = useCallback((day: number) => {
    setSelectedDate(new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day));
  }, [displayMonth, setSelectedDate]);

  return (
    <>
      <div className="performance-toolbar">
        <div><span className="performance-eyebrow">SELECTED DAY</span><strong className="performance-selected-date">{format(selectedDate, "EEEE, dd MMMM yyyy")}</strong></div>
        <MonthSelector displayMonth={displayMonth} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} />
      </div>
      <DaysCarousel displayMonth={displayMonth} selectedDate={selectedDate} onDayClick={handleDayClick} hasNoData={!loading && performanceData.length === 0} isLoading={loading} />
      <div className={dailyPerformanceInsightStyles.pageContent} aria-busy={loading}>
        {loading ? (
          <div className={dailyPerformanceInsightStyles.loadingContainer}><div className="flex items-center gap-2"><i className={dailyPerformanceInsightStyles.loadingSpinner} /><span className={dailyPerformanceInsightStyles.loadingText}>Loading data...</span></div></div>
        ) : performanceData.length === 0 ? (
          <div className={dailyPerformanceInsightStyles.emptyStateContainer}><i className={dailyPerformanceInsightStyles.emptyStateIcon} /><span className={dailyPerformanceInsightStyles.emptyStateText}>No data available for the selected date.</span></div>
        ) : performanceData.map((operation, index) => (
          <OperationCard key={operation.operationId || `operation-${index}`} operation={operation} index={index} totalOperations={performanceData.length} />
        ))}
      </div>
    </>
  );
}

function MonthlyPerformanceView() {
  const today = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const { monthData, averages, loading, error } = useCurrentPerformanceData(selectedYear, selectedMonth);
  const handleMonthSelect = useCallback((year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }, []);

  return (
    <>
      <MonthCarousel selectedYear={selectedYear} selectedMonth={selectedMonth} onMonthSelect={handleMonthSelect} today={today} />
      <div className="performance-month-content" aria-busy={loading}>
        <MonthlyAverages averages={averages} />
        <DailyBreakdownTable monthData={monthData} loading={loading} error={error} />
      </div>
    </>
  );
}

export default function MyPerformancePage({ initialView }: { initialView: PerformanceView }) {
  const [view, setView] = useState<PerformanceView>(initialView);
  return (
    <PerformanceLayout view={view} onViewChange={setView}>
      <section id="performance-panel-daily" role="tabpanel" aria-labelledby="performance-tab-daily" hidden={view !== "daily"}>
        <DailyPerformanceView />
      </section>
      <section id="performance-panel-monthly" role="tabpanel" aria-labelledby="performance-tab-monthly" hidden={view !== "monthly"}>
        <MonthlyPerformanceView />
      </section>
    </PerformanceLayout>
  );
}
