"use client";

import { useMemo, useCallback, useEffect } from "react";
import { StandardPageLayout, PageHeader, PageSection, PageContent } from "../components";
import { useDateStore } from "@/lib/date-store";
import { MonthSelector } from "./components/MonthSelector";
import { DaysCarousel } from "./components/DaysCarousel";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { OperationsList } from "./components/OperationsList";
import { useSubcontractorData } from "./hooks/useSubcontractorData";
import { subcontractorStyles } from "./styles";

export default function SubcontractorPage() {
  const { selectedDate: storedDate, setSelectedDate: setDate } = useDateStore();

  // Garantir que date seja sempre um Date object válido
  const date = useMemo(() => {
    try {
      const d = storedDate instanceof Date ? storedDate : new Date(storedDate);
      // Check if date is valid
      if (isNaN(d.getTime())) {
        return new Date(); // Fallback para hoje se a data for inválida
      }
      return d;
    } catch {
      return new Date(); // Fallback em caso de erro
    }
  }, [storedDate]);

  const { data, loading, error } = useSubcontractorData(date);

  // Listener para sincronizar quando a data muda em outra aba (storage event só funciona entre abas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "shared-date-storage" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.state?.selectedDate) {
            const newDate = new Date(parsed.state.selectedDate);
            // Só atualiza se for diferente da data atual
            if (newDate.getTime() !== date.getTime()) {
              setDate(newDate);
            }
          }
        } catch (error) {
          console.error("Error parsing storage event:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [date, setDate]);

  const handlePrevMonth = useCallback(() => {
    const prev = new Date(date);
    prev.setMonth(prev.getMonth() - 1);
    prev.setDate(1);
    setDate(prev);
  }, [date, setDate]);

  const handleNextMonth = useCallback(() => {
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    setDate(next);
  }, [date, setDate]);

  const handleDateSelect = useCallback(
    (selectedDate: Date) => {
      setDate(selectedDate);
    },
    [setDate]
  );

  return (
    <StandardPageLayout width="wide" bottomPadding="pb-[70px]">
      <PageHeader alignHeader="between">
        <MonthSelector
          date={date}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
      </PageHeader>

      <PageSection>
        <DaysCarousel
          date={date}
          loading={loading}
          hasData={data.length > 0}
          hasError={!!error}
          onDateSelect={handleDateSelect}
        />
      </PageSection>

      <PageContent className={subcontractorStyles.pageContent}>
        {loading ? (
          <LoadingState />
        ) : data.length > 0 ? (
          <OperationsList operations={data} />
        ) : (
          <ErrorState message={error || "No data available for the selected date"} />
        )}
      </PageContent>
    </StandardPageLayout>
  );
}
