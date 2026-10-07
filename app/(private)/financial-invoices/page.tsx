"use client";

import { lazy, Suspense, useEffect, useState, useCallback, useMemo, useRef } from "react";
import NavbarWrapper from "@/components/navbar-wrapper";
import { DgpPageFrame } from "@/app/(private)/components";
import { type Metric } from "@/components/modern-page-header";
import { useRouter } from "next/navigation";
import { startOfMonth, format } from "date-fns";
import { getUserIdFromToken, getUserTypeFromToken } from "@/lib/auth"
import { useSidebar } from "@/components/ui/sidebar";
import { useInvoiceSorting } from './hooks/useInvoiceSorting';
import {
  useInvoicesByMonth,
  useInvoicesByUserLast12,
  useInvoicesLast12,
  useInvalidateInvoices,
} from "@/hooks/useInvoicesQuery";
import { DesktopView } from './components/DesktopView';
import { MobileContentView } from './components/MobileContentView';
import { formatCurrency, getMonthYear } from './utils';
import { BUSINESS_RULES } from "@/src/constants/businessRules";
import { useServicePartners } from "@/hooks/useServicePartners";
import { fetchVendors, type Vendor } from "@/lib/vendors";

import { ModalLoading } from "@/components/modal-loading";
import type { InvoiceDetailsModalRef } from "@/components/invoice-details-modal";

const InvoiceDetailsModal = lazy(() => import("@/components/invoice-details-modal"));
const NewInvoiceModal = lazy(() => import("@/components/new-invoice-modal"));
const MultipleInvoicesModal = lazy(() => import("@/components/multiple-invoices-modal"));

// Helper component to close sidebar when modals are opened
function CloseSidebarOnModalOpen({ open }: { open: boolean }) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (!open) return;
    // Close sidebar when a modal is opened (prevents overlay/z-index conflicts)
    if (isMobile) setOpenMobile(false);
    setOpen(false);
  }, [open, isMobile, setOpen, setOpenMobile]);

  return null;
}

export default function FinancialInvoicesPage() {
  const router = useRouter();
  const [userTypeId, setUserTypeId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isMultipleInvoicesModalOpen, setIsMultipleInvoicesModalOpen] = useState(false);
  const [selectedYearForMultiple] = useState<number>(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [spmsValidationEnabled, setSpmsValidationEnabled] = useState<boolean>(true);
  const invoiceModalRef = useRef<InvoiceDetailsModalRef>(null);
  const [selectedServicePartnerId, setSelectedServicePartnerId] = useState('');
  const { servicePartners } = useServicePartners();
  const [invoiceVendors, setInvoiceVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    fetchVendors().then(setInvoiceVendors).catch(() => setInvoiceVendors([]));
  }, []);

  const normalizeName = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').toLowerCase().trim();

  const vendorNameToSPId = useMemo(() => {
    const m = new Map<string, number>();
    invoiceVendors.forEach(v => {
      if (v.fullName && v.servicePartnerId != null) {
        m.set(normalizeName(v.fullName), Number(v.servicePartnerId));
      }
    });
    return m;
  }, [invoiceVendors]);

  const spIdToName = useMemo(() => {
    const m = new Map<number, string>();
    servicePartners.forEach(sp => m.set(sp.servicePartnerId, sp.partnerName));
    return m;
  }, [servicePartners]);

  const isDriver = userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER;
  const isAdmin = userTypeId === BUSINESS_RULES.USER_TYPE.ADMIN;
  const isAllPeriods = isAdmin && selectedPeriod === 'all';
  const isByMonth = isAdmin && selectedPeriod !== 'all';

  const monthYear = useMemo(() => getMonthYear(selectedMonth), [selectedMonth]);

  const driverQuery = useInvoicesByUserLast12(isDriver ? userId : null);
  const adminMonthQuery = useInvoicesByMonth({
    month: isByMonth ? monthYear.month : null,
    year: isByMonth ? monthYear.year : null,
    userId: isByMonth ? userId : null,
  });
  const adminAllQuery = useInvoicesLast12({ enabled: isAllPeriods });

  const activeQuery = isDriver ? driverQuery : isAllPeriods ? adminAllQuery : adminMonthQuery;
  const invoices = useMemo(() => activeQuery.data ?? [], [activeQuery.data]);
  const isLoading = activeQuery.isLoading || activeQuery.isFetching;
  const invalidateInvoices = useInvalidateInvoices();

  const allowedUserIds = useMemo<Set<number> | undefined>(() => {
    if (!selectedServicePartnerId) return undefined;
    const spId = Number(selectedServicePartnerId);
    const selectedSpName = spIdToName.get(spId);
    const allowed = new Set<number>();
    // 1) From vendors list (/bff/vendors)
    invoiceVendors.forEach(v => {
      if (Number(v.servicePartnerId) === spId) allowed.add(v.userId);
    });
    // 2) From the invoices already loaded (use whatever the backend returned)
    invoices.forEach(inv => {
      if (!inv.userId) return;
      if (selectedSpName && inv.servicePartnerName === selectedSpName) {
        allowed.add(Number(inv.userId));
      }
    });
    // Empty Set means "filter is on, but no matches" — don't fall back to undefined,
    // otherwise the modal would show ALL users as if no filter were applied.
    return allowed;
  }, [selectedServicePartnerId, invoiceVendors, invoices, spIdToName]);

  // Filter invoices based on search term and service partner
  const filteredInvoices = useMemo(() => {
    let list = invoices;
    // O filtro de Service Partner já é aplicado no backend via query string
    // (?servicePartnerId=...). Só refazemos no client se a resposta vier com
    // dados extras de outros SPs (ex.: cache, request concorrente).
    if (selectedServicePartnerId !== '') {
      const spId = Number(selectedServicePartnerId);
      const selectedSpName = spIdToName.get(spId);
      list = list.filter(invoice => {
        if (invoice.userId && allowedUserIds && allowedUserIds.has(invoice.userId)) return true;
        if (selectedSpName && invoice.servicePartnerName === selectedSpName) return true;
        const sp = vendorNameToSPId.get(normalizeName(invoice.courier || ''));
        return sp != null && sp === spId;
      });
    }
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase().trim();
    return list.filter(invoice =>
      (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(term)) ||
      (invoice.courier && invoice.courier.toLowerCase().includes(term))
    );
  }, [invoices, searchTerm, selectedServicePartnerId, vendorNameToSPId, allowedUserIds, spIdToName]);

  // Use custom hook for sorting with filtered invoices
  const { sortedInvoices, sortField, sortDirection, handleSort } = useInvoiceSorting(filteredInvoices);

  // Enrich sorted invoices with servicePartnerName derived from vendor → SP mapping
  const enrichedSortedInvoices = useMemo(() => {
    return sortedInvoices.map(invoice => {
      if (invoice.servicePartnerName) return invoice;
      const courier = normalizeName(invoice.courier || '');
      const spId = vendorNameToSPId.get(courier);
      const servicePartnerName = spId ? spIdToName.get(spId) : undefined;
      return servicePartnerName ? { ...invoice, servicePartnerName } : invoice;
    });
  }, [sortedInvoices, vendorNameToSPId, spIdToName]);

  // userTypeId / userId from session (auth_user) or legacy JWT in storage
  useEffect(() => {
    const uid = getUserIdFromToken();
    const ut = getUserTypeFromToken();
    if (uid != null) setUserId(uid);
    if (ut != null) setUserTypeId(ut);
  }, []);

  // Redirect based on userTypeId
  useEffect(() => {
    if (userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR) {
      router.push('/daily-operations-reports');
    } 
  }, [userTypeId, router]);

  // Separate query for periods extraction (admin only) — drives the month dropdown.
  const periodsQuery = useInvoicesLast12({
    servicePartnerId: selectedServicePartnerId || undefined,
    enabled: isAdmin,
  });
  const allInvoicesForPeriods = useMemo(() => periodsQuery.data ?? [], [periodsQuery.data]);

  const handleMonthChange = useCallback((newMonth: Date) => {
    setSelectedMonth(startOfMonth(newMonth));
  }, []);

  // Generate available months from all invoices data (for periods extraction)
  const availableMonths = useMemo(() => {
    // Use allInvoicesForPeriods to extract periods, fallback to invoices if not loaded yet
    const invoicesToUse = allInvoicesForPeriods.length > 0 ? allInvoicesForPeriods : invoices;

    const now = new Date();
    const rollingPeriodSet = new Set<string>();

    // Always include current month + previous 11 months,
    // even if no invoice exists for those periods.
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      rollingPeriodSet.add(key);
    }

    // Also keep periods coming from API data (in case backend returns an extra valid period)
    invoicesToUse.forEach((invoice) => {
      if (!invoice.referenceDate || invoice.referenceDate.trim() === '' || !invoice.invoiceId) return;

      // Extract YYYY-MM directly from the string to avoid timezone conversion issues.
      const periodKey = invoice.referenceDate.trim().substring(0, 7);
      if (!/^\d{4}-\d{2}$/.test(periodKey)) return;

      const month = parseInt(periodKey.split('-')[1], 10);
      if (month < 1 || month > 12) return;

      rollingPeriodSet.add(periodKey);
    });

    const periods = Array.from(rollingPeriodSet)
      .filter((period) => {
        // Do not show future periods
        const [year, month] = period.split('-').map(Number);
        const periodDate = new Date(year, month - 1, 1);
        const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
        return periodDate <= currentDate;
      })
      .sort((a, b) => b.localeCompare(a));

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return periods.map(period => {
      const [year, month] = period.split('-');
      const monthIndex = parseInt(month, 10) - 1;
      return {
        value: period,
        label: `${months[monthIndex]} ${year}`,
        date: new Date(parseInt(year, 10), monthIndex, 1)
      };
    });
  }, [allInvoicesForPeriods, invoices]);

  // Handle month change from Select
  const handleMonthSelectChange = useCallback((value: string) => {
    setSelectedPeriod(value);
    if (value !== 'all') {
      const selectedMonthData = availableMonths.find(month => month.value === value);
      if (selectedMonthData) {
        handleMonthChange(selectedMonthData.date);
      }
    }
  }, [availableMonths, handleMonthChange]);

  // Handlers
  const handleViewInvoice = useCallback((invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailsModalOpen(true);
  }, []);

  // Calculate totals (memoized)
  const totalValue = useMemo(() => {
    return formatCurrency(sortedInvoices.reduce((sum, inv) => sum + (inv.totalPayment || 0), 0).toString());
  }, [sortedInvoices]);

  // Calcular métricas para o header
  const headerMetrics: Metric[] = useMemo(() => {
    const totalInvoices = sortedInvoices.length;
    const totalAmount = sortedInvoices.reduce((sum, inv) => sum + (inv.totalPayment || 0), 0);
    const uniqueCouriers = new Set(sortedInvoices.map(inv => inv.courier).filter(Boolean)).size;
    return [
      { label: 'Total Invoices', value: totalInvoices },
      { label: 'Total Amount', value: formatCurrency(totalAmount.toString()) },
      { label: 'Couriers', value: uniqueCouriers },
    ];
  }, [sortedInvoices]);

  // Formatar subtitle com o período selecionado
  const subtitle = useMemo(() => {
    if (selectedPeriod === 'all') {
      return 'All periods';
    }
    const selectedMonthData = availableMonths.find(month => month.value === selectedPeriod);
    if (selectedMonthData) {
      return `Period: ${format(selectedMonthData.date, 'MMM yyyy')}`;
    }
    return undefined;
  }, [selectedPeriod, availableMonths]);

  return (
    <NavbarWrapper>
      <div className="w-full min-w-0">
        <DgpPageFrame
          width="ultra"
          containerClassName="mx-auto w-full px-0"
          className="font-sans text-slate-800 text-sm"
        >
          <div id="main-content" className="flex-grow flex flex-col min-w-0 relative page-stagger">
            {/* Desktop SP filter */}
            {servicePartners.length > 0 && (
              <div className="hidden md:flex justify-start px-6 pt-6 pb-0">
                <select
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56"
                  value={selectedServicePartnerId}
                  onChange={(e) => setSelectedServicePartnerId(e.target.value)}
                >
                  <option value="">All Service Partners</option>
                  {servicePartners.map((sp) => (
                    <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                      {sp.partnerName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Desktop Version */}
            <DesktopView
              subtitle={subtitle}
              headerMetrics={headerMetrics}
              userTypeId={userTypeId ?? 0}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedPeriod={selectedPeriod}
              availableMonths={availableMonths}
              onPeriodChange={handleMonthSelectChange}
              sortedInvoices={enrichedSortedInvoices}
              isLoading={isLoading}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onViewInvoice={handleViewInvoice}
              selectedMonth={isAdmin ? selectedMonth : null}
              onNewInvoice={() => setIsNewInvoiceModalOpen(true)}
              onMultipleInvoices={() => setIsMultipleInvoicesModalOpen(true)}
              spmsValidationEnabled={spmsValidationEnabled}
              onSpmsValidationToggle={() => setSpmsValidationEnabled((v) => !v)}
              totalValue={totalValue}
            />

            {/* Mobile Version */}
            {servicePartners.length > 0 && (
              <div className="md:hidden flex justify-start px-4 pb-2">
                <select
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56"
                  value={selectedServicePartnerId}
                  onChange={(e) => setSelectedServicePartnerId(e.target.value)}
                >
                  <option value="">All Service Partners</option>
                  {servicePartners.map((sp) => (
                    <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                      {sp.partnerName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <MobileContentView
              subtitle={subtitle}
              headerMetrics={headerMetrics}
              userTypeId={userTypeId ?? 0}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedPeriod={selectedPeriod}
              availableMonths={availableMonths}
              onPeriodChange={handleMonthSelectChange}
              sortedInvoices={enrichedSortedInvoices}
              isLoading={isLoading}
              onViewInvoice={handleViewInvoice}
              selectedMonth={selectedMonth}
              onNewInvoice={() => setIsNewInvoiceModalOpen(true)}
              onMultipleInvoices={() => setIsMultipleInvoicesModalOpen(true)}
              spmsValidationEnabled={spmsValidationEnabled}
              onSpmsValidationToggle={() => setSpmsValidationEnabled((v) => !v)}
              totalValue={totalValue}
            />
          </div>
        </DgpPageFrame>
      </div>

      {/* Fecha a sidebar quando modais são abertos */}
      <CloseSidebarOnModalOpen open={isDetailsModalOpen} />
      <CloseSidebarOnModalOpen open={isNewInvoiceModalOpen} />
      <CloseSidebarOnModalOpen open={isMultipleInvoicesModalOpen} />

      {/* Modals */}
      {selectedInvoiceId && isDetailsModalOpen && (
          <Suspense fallback={<ModalLoading />}>
            <InvoiceDetailsModal
          ref={invoiceModalRef}
          invoiceId={selectedInvoiceId}
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
        />
          </Suspense>
      )}

      {isNewInvoiceModalOpen && (
          <Suspense fallback={<ModalLoading />}>
            <NewInvoiceModal
        open={isNewInvoiceModalOpen}
        onOpenChange={setIsNewInvoiceModalOpen}
        onInvoiceCreated={() => {
          invalidateInvoices();
        }}
        skipSpmsValidation={!spmsValidationEnabled}
      />
          </Suspense>
        )}

      {isMultipleInvoicesModalOpen && (
          <Suspense fallback={<ModalLoading />}>
            <MultipleInvoicesModal
        open={isMultipleInvoicesModalOpen}
        onOpenChange={setIsMultipleInvoicesModalOpen}
        onInvoicesCreated={() => {
          invalidateInvoices();
        }}
        initialYear={selectedYearForMultiple}
        skipSpmsValidation={!spmsValidationEnabled}
      />
          </Suspense>
        )}
    </NavbarWrapper>
  );
}
