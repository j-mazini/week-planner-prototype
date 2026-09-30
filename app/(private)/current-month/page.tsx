"use client";

import { useState, useCallback, useMemo } from "react";
import { StandardPageLayout, PageHeader, PageSection, PageContent } from "../components";
import { DayDetails } from "./DayDetails";
import { formatCurrency, getVehicleIcon } from "./utils";
import {
  MonthCarousel,
  SummaryCard,
  InfoGrid,
  EarningsList,
  LoadingState,
  ErrorState,
  NoDataState,
} from "./components";
import { useCurrentMonthData } from "./hooks/useCurrentMonthData";
import { useDayDetails } from "./hooks/useDayDetails";
import { DailyEarning, Operation } from "./types";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ModernPageHeader } from "@/components/modern-page-header";
import { CalendarDays, CirclePoundSterling, BriefcaseBusiness } from "lucide-react";
import NavbarWrapper from "@/components/navbar-wrapper";

export default function CurrentMonthPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const { monthData, loading, error } = useCurrentMonthData(selectedYear, selectedMonth);
  const {
    selectedDays,
    showDayDetails,
    selectedDateName,
    fetchDayDetails,
    handleBack,
  } = useDayDetails();

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }), 
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

  // Função para calcular o total do dia
  const calculateDayTotal = useCallback((earning: DailyEarning): string => {
    if (earning.calculatedAmount) {
      return earning.calculatedAmount;
    }

    if (earning.operations && earning.operations.length > 0) {
      const uniqueOperations = earning.operations.reduce(
        (acc: Operation[], current: Operation) => {
          const isDuplicate = acc.find((item) => item.operationId === current.operationId);
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        },
        []
      );

      const total = uniqueOperations.reduce((sum, operation) => {
        return sum + parseFloat(operation.amountTotal || "0");
      }, 0);
      return total.toFixed(2);
    }

    return earning.totalAmount || earning.amount;
  }, []);

  // Handler para clicar em um dia e ver os detalhes
  const handleDayClick = useCallback(
    (date: string, dateName: string) => {
      fetchDayDetails(date, dateName);
    },
    [fetchDayDetails]
  );


  // Calcula valores derivados memoizados
  const summaryData = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth, 1);
    const monthName = selectedDate.toLocaleString('en-GB', { month: 'long' });
    const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const summaryMonthLabel = `${monthNameCapitalized}/${selectedYear} Earnings`;

    const totalEarnings = monthData?.currentMonth?.total || 0;
    const daysWorked = monthData?.currentMonth?.daysWorked || 0;
    const avgDaily = monthData?.currentMonth?.averagePerDay || 0;

    return { summaryMonthLabel, totalEarnings, daysWorked, avgDaily };
  }, [selectedYear, selectedMonth, monthData]);

  // Lista de earnings reversa memoizada
  const reversedEarnings = useMemo(() => {
    if (!monthData?.dailyEarnings) return [];
    return [...monthData.dailyEarnings].reverse();
  }, [monthData?.dailyEarnings]);

  // Info grid items memoizados
  const infoItems = useMemo(() => [
    { label: 'Days Worked', value: summaryData.daysWorked, valueColor: 'neutral' as const },
    { label: 'Avg. Daily', value: currencyFormatter.format(summaryData.avgDaily), valueColor: 'success' as const }
  ], [summaryData.daysWorked, summaryData.avgDaily, currencyFormatter]);

  // Tela de Detalhes do Dia
  if (showDayDetails && selectedDateName) {
    return (
      <NavbarWrapper>
        <div className="mx-auto w-full max-w-content-wide px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
          <ModernPageHeader
            title={selectedDateName}
            subtitle="Daily earnings and route details."
            gradientFrom="slate-900"
            gradientTo="teal-600"
            metrics={[{ label: "Operations", value: selectedDays.length, icon: <CalendarDays size={14} /> }]}
          />
          <DayDetails selectedDays={selectedDays} selectedDateName={selectedDateName} onBack={handleBack} />
        </div>
      </NavbarWrapper>
    );
  }

  return (
    <StandardPageLayout width="wide" bottomPadding="pb-[clamp(3.5rem,8vh,4.375rem)]">
      <PageHeader alignHeader="left">
        <ModernPageHeader
          title="Current Month"
          subtitle="Your earnings and completed work for the selected month."
          gradientFrom="slate-900"
          gradientTo="teal-600"
          metrics={[
            { label: "Earnings", value: currencyFormatter.format(summaryData.totalEarnings), icon: <CirclePoundSterling size={14} /> },
            { label: "Days worked", value: summaryData.daysWorked, icon: <CalendarDays size={14} /> },
            { label: "Daily average", value: currencyFormatter.format(summaryData.avgDaily), icon: <BriefcaseBusiness size={14} /> },
          ]}
          metricsLayout="grid4compact"
        />
      </PageHeader>

      <PageSection>
        <MonthCarousel months={monthsCarousel} onMonthClick={handleMonthClick} />
      </PageSection>

      <PageContent>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : !monthData ? (
          <NoDataState />
        ) : (
          <>
            <SummaryCard 
              label={summaryData.summaryMonthLabel} 
              value={currencyFormatter.format(summaryData.totalEarnings)} 
            />

            <InfoGrid items={infoItems} />

            <EarningsList 
              earnings={reversedEarnings}
              calculateDayTotal={calculateDayTotal}
              formatCurrency={formatCurrency}
              getVehicleIcon={getVehicleIcon}
              onDayClick={handleDayClick}
            />
          </>
        )}
      </PageContent>
    </StandardPageLayout>
  );
}
