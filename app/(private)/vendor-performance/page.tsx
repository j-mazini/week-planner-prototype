"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import NavbarWrapper from "@/components/navbar-wrapper";
import { DgpPageFrame, MobilePageShell } from "@/app/(private)/components";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useVendorMonthData } from "./hooks/useVendorMonthData";
import { useAllVendors } from "./hooks/useAllVendors";
import { useAvailableMonthsForVendor } from "./hooks/useAvailableMonthsForVendor";
import { useGeneralSummary } from "./hooks/useGeneralSummary";
import { type ProcessedVendor } from "./utils";
import type { Vendor } from "@/lib/vendors";
import { ModernPageHeader } from "@/components/modern-page-header";
import { VendorSelect } from "./components/VendorSelect";
import { PerformanceDetailView } from "./components/PerformanceDetailView";
import { ErrorMessage } from "./components/ErrorMessage";
import { useServicePartners } from "@/hooks/useServicePartners";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_SERVICE_PARTNERS_VALUE = "all";

function vendorToProcessedVendor(v: Vendor): ProcessedVendor {
  const nameParts = (v.fullName || "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  return {
    id: v.userId || 0,
    firstName,
    lastName,
    email: v.email,
    avgTw: "--:--",
    avgSpr: "--:--",
    avgSporH: "--:--",
    avgAfd: "--:--",
    routeName:''
  };
}

export default function VendorPerformancePage() {
  const today = useMemo(() => new Date(), []);
  const [periodMonth, _setPeriodMonth] = useState(today.getMonth());
  const [periodYear, _setPeriodYear] = useState(today.getFullYear());
  const [selectedVendor, setSelectedVendor] = useState<ProcessedVendor | null>(null);
  const [detailYear, setDetailYear] = useState(today.getFullYear());
  const [detailMonth, setDetailMonth] = useState(today.getMonth());

  const [selectedServicePartnerId, setSelectedServicePartnerId] = useState('');
  const { servicePartners } = useServicePartners();

  const servicePartnerIdForFilter = selectedServicePartnerId ? Number(selectedServicePartnerId) : undefined;
  const { vendors: allVendors, loading: vendorsLoading, error: vendorsError } = useAllVendors(servicePartnerIdForFilter);
  const { stats: generalStats, loading: generalSummaryLoading, error: generalSummaryError } = useGeneralSummary(
    periodMonth,
    periodYear,
    selectedVendor == null
  );
  const { monthsWithData, loading: availableMonthsLoading } = useAvailableMonthsForVendor(selectedVendor?.id ?? null);
  const { monthData, averages: detailAverages, loading: detailLoading, loadMonthData } = useVendorMonthData();

  const vendorsForSelect = useMemo(() => allVendors.map(vendorToProcessedVendor), [allVendors]);

  const subtitle = useMemo(() => {
    if (selectedVendor != null) {
      return format(new Date(detailYear, detailMonth, 1), "MMMM yyyy", { locale: enUS });
    }
    return format(new Date(periodYear, periodMonth, 1), "MMMM yyyy", { locale: enUS });
  }, [selectedVendor, detailYear, detailMonth, periodYear, periodMonth]);

  const handleVendorChange = useCallback(
    async (vendor: ProcessedVendor | null) => {
      setSelectedVendor(vendor);
      if (vendor) {
        setDetailYear(today.getFullYear());
        setDetailMonth(today.getMonth());
      }
    },
    [today]
  );

  const handleDetailMonthSelect = useCallback(
    async (year: number, month: number) => {
      if (!selectedVendor) return;
      setDetailYear(year);
      setDetailMonth(month);
      await loadMonthData(year, month, selectedVendor);
    },
    [selectedVendor, loadMonthData]
  );

  useEffect(() => {
    if (selectedVendor && vendorsForSelect.length > 0 && !vendorsForSelect.some((v: ProcessedVendor) => v.id === selectedVendor.id)) {
      setSelectedVendor(null);
    }
  }, [selectedVendor, vendorsForSelect]);

  useEffect(() => {
    if (!selectedVendor || availableMonthsLoading || monthsWithData.length === 0) return;
    const isInList = monthsWithData.some((m) => m.year === detailYear && m.month === detailMonth);
    if (isInList) {
      loadMonthData(detailYear, detailMonth, selectedVendor).catch(() => {});
      return;
    }
    const first = monthsWithData[0];
    if (first) {
      setDetailYear(first.year);
      setDetailMonth(first.month);
      loadMonthData(first.year, first.month, selectedVendor).catch(() => {});
    }
  }, [selectedVendor, availableMonthsLoading, monthsWithData, detailYear, detailMonth, loadMonthData]);

  const headerMetrics = useMemo(
    () => [{ label: "Vendors", value: vendorsForSelect.length }],
    [vendorsForSelect.length]
  );

  const errorDisplay = useMemo(() => {
    const err = vendorsError || generalSummaryError || "";
    if (!err) return null;
    const isAuthError = err.includes("token") || err.includes("log");
    const isConnectionError =
      err.toLowerCase().includes("unable to connect") || err.toLowerCase().includes("next_public_api");
    const message = isAuthError
      ? "Session may have expired. Please log in again."
      : isConnectionError
        ? "Could not reach the server. Check that the backend is running and NEXT_PUBLIC_API_URL in .env.local is set (e.g. http://localhost:3001)."
        : err;
    return {
      message,
      onRetry: isConnectionError ? () => window.location.reload() : undefined,
    };
  }, [vendorsError, generalSummaryError]);

  const filtersSection = (
    <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm space-y-2">
      {servicePartners.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="service-partner-select" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Service Partner
          </label>
          <Select
            value={selectedServicePartnerId || ALL_SERVICE_PARTNERS_VALUE}
            onValueChange={(v) => setSelectedServicePartnerId(v === ALL_SERVICE_PARTNERS_VALUE ? "" : v)}
          >
            <SelectTrigger id="service-partner-select" className="w-full min-w-[200px] max-w-[320px]">
              <SelectValue placeholder="All Service Partners" />
            </SelectTrigger>
            <SelectContent className="max-h-[280px]">
              <SelectScrollUpButton />
              <SelectItem value={ALL_SERVICE_PARTNERS_VALUE}>All Service Partners</SelectItem>
              {servicePartners.map((sp) => (
                <SelectItem key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                  {sp.partnerName}
                </SelectItem>
              ))}
              <SelectScrollDownButton />
            </SelectContent>
          </Select>
        </div>
      )}
      <VendorSelect
        vendors={vendorsForSelect}
        value={selectedVendor}
        onChange={handleVendorChange}
        loading={vendorsLoading}
        placeholder="Select a vendor"
      />
    </div>
  );

  const detailContent = (
    <PerformanceDetailView
      vendor={selectedVendor}
      selectedYear={selectedVendor != null ? detailYear : periodYear}
      selectedMonth={selectedVendor != null ? detailMonth : periodMonth}
      monthData={monthData}
      averages={detailAverages}
      loading={detailLoading}
      onMonthSelect={handleDetailMonthSelect}
      carouselMonths={selectedVendor != null ? monthsWithData : undefined}
      carouselMonthsLoading={selectedVendor != null ? availableMonthsLoading : false}
      generalStats={selectedVendor == null ? generalStats : null}
      generalLoading={selectedVendor == null ? generalSummaryLoading : false}
    />
  );

  return (
    <NavbarWrapper>
      <DgpPageFrame
        width="ultra"
        containerClassName="mx-auto px-4 py-6 sm:px-6 lg:px-8"
        className="font-sans text-slate-800 text-sm"
      >
        {errorDisplay && (
          <div className="mb-4">
            <ErrorMessage message={errorDisplay.message} onRetry={errorDisplay.onRetry} />
          </div>
        )}

        {/* Desktop */}
        <main className="hidden md:block space-y-4 page-stagger">
          <ModernPageHeader
            title="Vendor Performance"
            subtitle={subtitle}
            metrics={headerMetrics}
            gradientFrom="slate-900"
            gradientTo="indigo-600"
          />

          {filtersSection}

          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden p-4 sm:p-6">
            {detailContent}
          </div>
        </main>

        {/* Mobile */}
        <MobilePageShell
          title="Vendor Performance"
          subtitle={subtitle}
          filters={filtersSection}
          className="pt-4"
        >
          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden p-4">
            {detailContent}
          </div>
        </MobilePageShell>
      </DgpPageFrame>
    </NavbarWrapper>
  );
}

