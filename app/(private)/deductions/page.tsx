"use client";

import { useState, useCallback, useMemo } from "react";
import { StandardPageLayout, PageHeader, PageSection, PageContent } from "../components";
import { useDeductions } from "./hooks/useDeductions";
import {
  MonthCarousel,
  SummaryCard,
  DeductionsList,
  ProgressSection,
  ErrorState,
  LoadingState,
} from "./components";
import { deductionsStyles } from "./styles";
import { calculateTotalDeductions } from "./utils";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ModernPageHeader } from "@/components/modern-page-header";
import { CircleDollarSign, ReceiptText } from "lucide-react";

export default function DeductionsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const selectedDate = useMemo(
    () => new Date(selectedYear, selectedMonth, 1),
    [selectedYear, selectedMonth]
  );

  const {
    deductions: rawDeductions,
    error,
    isLoading,
  } = useDeductions(selectedDate);

  const deductions = rawDeductions;

  const totalDeductions = useMemo(
    () => calculateTotalDeductions(deductions),
    [deductions]
  );

  const installmentProgressItems = useMemo(
    () => deductions.filter(d => (d.totalInstallments || 1) > 1),
    [deductions]
  );

  // Formatador de moeda memoizado
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }),
    []
  );

  // Navegação de meses
  const handleMonthClick = useCallback((year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }, []);

  // Gera lista de meses para o carrossel
  const monthsCarousel = useMemo(() => {
    const months: { year: number; month: number; label: string; isSelected: boolean }[] = [];
    const currentDate = new Date(selectedYear, selectedMonth, 1);

    // 6 meses para trás
    for (let i = 6; i >= 1; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('en-US', { month: 'short' }).replace('.', '').toUpperCase();
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: `${monthName}/${date.getFullYear()}`,
        isSelected: date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
      });
    }

    // Mês atual
    const monthName = currentDate.toLocaleString('en-US', { month: 'short' }).replace('.', '').toUpperCase();
    months.push({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      label: `${monthName}/${currentDate.getFullYear()}`,
      isSelected: true
    });

    // 6 meses para frente
    for (let i = 1; i <= 6; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() + i);
      const monthName = date.toLocaleString('en-US', { month: 'short' }).replace('.', '').toUpperCase();
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: `${monthName}/${date.getFullYear()}`,
        isSelected: date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
      });
    }

    return months;
  }, [selectedYear, selectedMonth]);

  // Label do mês memoizado
  const monthLabel = useMemo(() => {
    const monthName = selectedDate.toLocaleString("en-US", { month: "long" });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  }, [selectedDate]);

  return (
    <StandardPageLayout width="wide" bottomPadding="pb-[70px]">
      <PageHeader alignHeader="left">
        <ModernPageHeader
          title="Deductions"
          subtitle="Review deductions and track repayment progress."
          gradientFrom="slate-900"
          gradientTo="teal-600"
          metrics={[
            { label: "Total this month", value: currencyFormatter.format(totalDeductions), icon: <CircleDollarSign size={14} /> },
            { label: "Entries", value: deductions.length, icon: <ReceiptText size={14} /> },
          ]}
          metricsLayout="grid2x2"
        />
      </PageHeader>

      <PageSection>
        <MonthCarousel months={monthsCarousel} onMonthClick={handleMonthClick} />
      </PageSection>

      <PageContent className={deductionsStyles.pageContent}>
        {error ? (
          <ErrorState error={error} />
        ) : isLoading && deductions.length === 0 ? (
          <LoadingState />
        ) : (
          <>
            {isLoading && (
              <div className={deductionsStyles.loadingBarWrapper}>
                <div
                  className={deductionsStyles.loadingBarInner}
                  style={{ width: "60%" }}
                />
              </div>
            )}
            <SummaryCard
              key={`summary-${selectedDate.getFullYear()}-${selectedDate.getMonth()}`}
              monthLabel={monthLabel}
              year={selectedDate.getFullYear()}
              totalDeductions={totalDeductions}
              currencyFormatter={currencyFormatter}
            />

            <DeductionsList
              key={`deductions-${selectedDate.getFullYear()}-${selectedDate.getMonth()}`}
              deductions={deductions}
              currencyFormatter={currencyFormatter}
            />

            <ProgressSection
              key={`progress-${selectedDate.getFullYear()}-${selectedDate.getMonth()}`}
              installmentProgressItems={installmentProgressItems}
              currencyFormatter={currencyFormatter}
            />
          </>
        )}
      </PageContent>
    </StandardPageLayout>
  );
}
