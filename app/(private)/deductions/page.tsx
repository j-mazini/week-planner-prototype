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
import { useServicePartners } from "@/hooks/useServicePartners";
import { useAuth } from "@/hooks/useAuth";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function DeductionsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedServicePartnerId, setSelectedServicePartnerId] = useState('');
  const { servicePartners } = useServicePartners();
  const { user } = useAuth();
  // Filtro de Service Partner: visível apenas para ADMIN (não Supervisor/Driver).
  const isAdmin = (user?.roles ?? []).includes('admin');

  const selectedDate = useMemo(
    () => new Date(selectedYear, selectedMonth, 1),
    [selectedYear, selectedMonth]
  );

  const {
    deductions: rawDeductions,
    error,
    isLoading,
  } = useDeductions(selectedDate, selectedServicePartnerId !== '' ? Number(selectedServicePartnerId) : undefined);

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
    <StandardPageLayout bottomPadding="pb-[70px]">
      <PageHeader />

      <PageSection>
        <MonthCarousel months={monthsCarousel} onMonthClick={handleMonthClick} />
      </PageSection>

      {isAdmin && servicePartners.length > 0 && (
        <PageSection>
          <div className="flex justify-start px-1 pb-2">
            <select
              value={selectedServicePartnerId}
              onChange={(e) => setSelectedServicePartnerId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56"
            >
              <option value="">All Service Partners</option>
              {servicePartners.map((sp) => (
                <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                  {sp.partnerName}
                </option>
              ))}
            </select>
          </div>
        </PageSection>
      )}

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
