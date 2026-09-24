"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { getUserIdFromToken, hasAuthSession, getBearerAuthHeader } from "../../../lib/auth";
import { useDateStore } from "../../../lib/date-store";
import { getApiBaseUrl } from "../../../lib/apiBaseUrl";
import { StandardPageLayout, PageHeader, PageSection, PageContent, PerformanceTabs } from "../components";
import { DailyPerformanceData } from "./types";
import { DaysCarousel } from "./DaysCarousel";
import { OperationCard } from "./OperationCard";
import { MonthSelector } from "./components/MonthSelector";
import { isDayOff } from "./utils";
import { dailyPerformanceInsightStyles } from "./styles";

export default function DailyPerformanceInsight() {
  const router = useRouter();
  const { selectedDate: storedDate, setSelectedDate } = useDateStore();
  const [performanceData, setPerformanceData] = useState<DailyPerformanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>("0");

  // Garantir que selectedDate seja sempre um Date object válido
  const selectedDate = useMemo(() => {
    const date = storedDate instanceof Date ? storedDate : new Date(storedDate);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return new Date(); // Fallback para hoje se a data for inválida
    }
    return date;
  }, [storedDate]);

  // Redirect only when not authenticated (Admin 1 and Supervisor 3 are allowed to access this page)
  useEffect(() => {
    if (!hasAuthSession()) {
      router.push('/home');
    }
  }, [router]);

  // Não força a data para hoje - usa a data do store compartilhado

  // displayMonth é derivado do selectedDate para manter sincronização
  const displayMonth = useMemo(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  }, [selectedDate]);

  // Listener para sincronizar quando a data muda em outra aba (storage event só funciona entre abas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shared-date-storage' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.state?.selectedDate) {
            const newDate = new Date(parsed.state.selectedDate);
            // Só atualiza se for diferente da data atual
            if (newDate.getTime() !== selectedDate.getTime()) {
              setSelectedDate(newDate);
            }
          }
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedDate, setSelectedDate]);

  // Busca o ID do usuário
  useEffect(() => {
    const id = getUserIdFromToken();
    if (id) {
      setUserId(id.toString());
    }
  }, []);

  // Data fetching function
  const fetchDailyPerformance = useCallback(
    async (dateToFetch: Date) => {
      if (userId === "0") return;
      
      setLoading(true);
      try {
        const formattedDate = format(dateToFetch, "yyyy-MM-dd");
        
        // Force example data for November 13 (day off)----remove later
        const isNovember13 = dateToFetch.getMonth() === 10 && dateToFetch.getDate() === 13;
        if (isNovember13) {
          const mockDayOffData: DailyPerformanceData = {
            operationId: 99999,
            operationDate: formattedDate,
            status: "Day Off",
            note: "Day off - Folga",
            dailyCash: {
              rate: 0,
              dailyServiceCharge: 0
            },
            route: {
              routeId: 0,
              routeName: "DAY OFF"
            },
            timeWindows: {
              percentageOnTime: 0
            },
            deliveryDetails: {
              totalAfd: 0,
              paidStops: {
                pu: 0,
                ok: 0,
                hn: 0,
                pd: null
              },
              unpaidStops: {
                nr: 0,
                fp: 0,
                rd: 0,
                ba: 0,
                nh: 0,
                cm: 0,
                ca: 0
              },
              departTime: null,
              arriveTime: null
            },
            dailyMetrics: {
              totalStops: 0,
              sporh: 0,
              breakMinutes: 0
            },
            isSpms: true
          };
          setPerformanceData([mockDayOffData]);
          setLoading(false);
          return;
        }
        
        const response = await fetch(
          `${getApiBaseUrl()}/bff/day-overview/${userId}/${formattedDate}?metrics=performance`,
          {
            method: "GET",
            headers: { ...getBearerAuthHeader() },
            credentials: "include",
          }
        );

        if (!response.ok) {
          if (response.status === 404 || response.status === 500) {
            setPerformanceData([]);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const performanceDataArray = Array.isArray(data) ? data : [data];

        if (!performanceDataArray || performanceDataArray.length === 0) {
          setPerformanceData([]);
          return;
        }

        // Remove duplicatas baseado no operationId
        const uniqueOperations = new Map<number, DailyPerformanceData>();
        performanceDataArray.forEach((operation: DailyPerformanceData) => {
          if (operation.operationId && !uniqueOperations.has(operation.operationId)) {
            uniqueOperations.set(operation.operationId, operation);
          }
        });
        const uniqueDataArray = Array.from(uniqueOperations.values());

        // Força isSpms como true (verified) quando for "day off"
        const processedData = uniqueDataArray.map((operation: DailyPerformanceData) => {
          if (isDayOff(operation)) {
            return { ...operation, isSpms: true };
          }
          return operation;
        });

        setPerformanceData(processedData);
      } catch (error) {
        console.error("Error fetching performance data:", error);
        setPerformanceData([]);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Fetch data when date or userId changes
  useEffect(() => {
    if (userId !== "0") {
      fetchDailyPerformance(selectedDate);
    }
  }, [selectedDate, userId, fetchDailyPerformance]);

  // Handlers para navegação memoizados
  const handlePrevMonth = useCallback(() => {
    const prev = new Date(selectedDate);
    prev.setMonth(prev.getMonth() - 1);
    prev.setDate(1);
    setSelectedDate(prev);
  }, [selectedDate, setSelectedDate]);

  const handleNextMonth = useCallback(() => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    setSelectedDate(next);
  }, [selectedDate, setSelectedDate]);

  const handleDayClick = useCallback((day: number) => {
    const newDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    setSelectedDate(newDate);
  }, [displayMonth, setSelectedDate]);

  // Renderiza o conteúdo memoizado
  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <div className={dailyPerformanceInsightStyles.loadingContainer}>
          <div className="flex items-center gap-2">
            <i className={dailyPerformanceInsightStyles.loadingSpinner}></i>
            <span className={dailyPerformanceInsightStyles.loadingText}>Loading data...</span>
          </div>
        </div>
      );
    }
    
    if (performanceData.length === 0) {
      return (
        <div className={dailyPerformanceInsightStyles.emptyStateContainer}>
          <i className={dailyPerformanceInsightStyles.emptyStateIcon}></i>
          <span className={dailyPerformanceInsightStyles.emptyStateText}>No data available for the selected date.</span>
        </div>
      );
    }

    return performanceData.map((operation, index) => (
      <OperationCard 
        key={operation.operationId || `operation-${index}`}
        operation={operation} 
        index={index}
        totalOperations={performanceData.length}
      />
    ));
  }, [loading, performanceData]);

  return (
    <StandardPageLayout bottomPadding="pb-[100px]">
      <PageHeader alignHeader="between">
        <PerformanceTabs />
        <MonthSelector
          displayMonth={displayMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
      </PageHeader>

      <PageSection>
        <DaysCarousel 
          displayMonth={displayMonth}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
          hasNoData={!loading && performanceData.length === 0}
          isLoading={loading}
        />
      </PageSection>
      
      <PageContent className={dailyPerformanceInsightStyles.pageContent}>
        {renderContent}
      </PageContent>
    </StandardPageLayout>
  );
}

