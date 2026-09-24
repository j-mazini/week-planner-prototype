'use client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DgpPageFrame } from "@/app/(private)/components";
import { ModernPageHeader, type Metric } from "@/components/modern-page-header";
import { useSidebar } from '@/components/ui/sidebar';
import NavbarWrapper from '@/components/navbar-wrapper';
import { getUserTypeFromToken, hasAuthSession } from '@/lib/auth';
import { format, parseISO } from 'date-fns';
import { type InsightRow } from './types';
import { extractLoop, formatCurrency } from './utils';
import { filterInsightData, calculatePageTotals } from './dataProcessor';
import { dailyFinancialInsightsStyles } from './styles';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

// Custom Hooks
import { useDailyFinancialData } from './hooks/useDailyFinancialData';
import { useFilters } from './hooks/useFilters';
import { useTableSorting } from './hooks/useTableSorting';
import { useOperationModal } from './hooks/useOperationModal';
import { useDeleteOperation } from './hooks/useDeleteOperation';
import { useServicePartners } from '@/hooks/useServicePartners';
import { fetchVendors, type Vendor } from '@/lib/vendors';

// Components
import { PageContent } from './components/PageContent';
import { MobileFilters } from './components/MobileFilters';
import { MobileView } from './components/MobileView';
import { OperationModal } from './components/OperationModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Toast } from './components/Toast';

// Componente helper para fechar a sidebar quando modais são abertos
function CloseSidebarOnModalOpen({ open }: { open: boolean }) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (!open) return;
    // Fecha a sidebar quando um modal é aberto (previne conflitos de overlay/z-index)
    if (isMobile) setOpenMobile(false);
    setOpen(false);
  }, [open, isMobile, setOpen, setOpenMobile]);

  return null;
}

const DailyFinancialInsightsContent: React.FC = () => {
  const SINGLE_DAY_ITEMS_PER_PAGE = 500;
  const RANGE_ITEMS_PER_PAGE = 50;
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(SINGLE_DAY_ITEMS_PER_PAGE);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [selectedServicePartnerId, setSelectedServicePartnerId] = useState('');
  const { servicePartners } = useServicePartners();
  const [spVendors, setSpVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    fetchVendors().then(setSpVendors).catch(() => setSpVendors([]));
  }, []);

  // Custom Hooks
  const {
    filters,
    searchInput,
    handleDateChange,
    handleSearchInputChange,
    handleSearchKeyPress,
    handleToggle,
    applySearch,
    clearSearch,
  } = useFilters();
  const hasEndDate = Boolean(filters.dateTo?.trim());

  const {
    insightRows,
    loading,
    pagination,
    depositsData,
    costModels,
    vendors,
    routes,
    vehicles,
    adhocServices,
    depotToDepositIdMapRef,
    fetchWithParams,
    fetchInitialData,
    fetchModalData,
  } = useDailyFinancialData(filters.depot, filters.loop, filters.payment);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applySearch();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInput, applySearch]);

  // Refresh data callback
  const refreshData = useCallback(() => {
    if (filters.dateFrom) {
      const effectiveDateTo = filters.dateTo?.trim() ? filters.dateTo : filters.dateFrom;
      const urlSearchParams = new URLSearchParams();
      fetchWithParams(filters.dateFrom, effectiveDateTo, urlSearchParams, currentPage, itemsPerPage, filters.search);
    }
  }, [filters.dateFrom, filters.dateTo, currentPage, itemsPerPage, filters.search, fetchWithParams]);

  // Operation Modal Hook
  const {
    showModal,
    editingOperationId,
    formData,
    formErrors,
    isSaving,
    openModal,
    closeModal,
    saveOperation,
    updateFormData,
    clearFormError,
  } = useOperationModal(() => {
    setToast({
      message: editingOperationId ? 'Register updated successfully!' : 'Register added successfully!',
      type: 'success'
    });
    refreshData();
  }, vendors, adhocServices, costModels);

  const {
    showDeleteModal,
    rowToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = useDeleteOperation(() => {
    setToast({ message: 'Register deleted successfully.', type: 'success' });
    refreshData();
  });

  // Handle save wrapper
  const handleSaveOperation = async () => {
    const success = await saveOperation(vendors, routes, vehicles);
    if (!success && formErrors.general) {
      setToast({
        message: formErrors.general,
        type: 'error'
      });
    }
  };


  // User type protection
  useEffect(() => {
    if (!hasAuthSession()) {
      router.push('/daily-performance-insight');
      return;
    }
    const userTypeId = getUserTypeFromToken();
    if (userTypeId === null) {
      router.push('/daily-performance-insight');
      return;
    }
    if (userTypeId === BUSINESS_RULES.USER_TYPE.DRIVER) {
      router.push('/daily-performance-insight');
    } else if (userTypeId === BUSINESS_RULES.USER_TYPE.SUPERVISOR) {
      router.push('/daily-operations-reports');
    }
  }, [router]);

  // Initial data fetch
  useEffect(() => {
    if (!initialLoadDone) {
      fetchInitialData();
      fetchModalData();
      setInitialLoadDone(true);
    }
  }, [initialLoadDone, fetchInitialData, fetchModalData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.dateFrom, filters.dateTo, filters.depot, filters.loop, filters.payment, filters.search]);

  // Default do Items per page por modo (usuário ainda pode alterar no select)
  useEffect(() => {
    setItemsPerPage(hasEndDate ? RANGE_ITEMS_PER_PAGE : SINGLE_DAY_ITEMS_PER_PAGE);
    setCurrentPage(1);
  }, [hasEndDate]);

  // Fetch data when filters or pagination change
  useEffect(() => {
    if (initialLoadDone && filters.dateFrom) {
      const effectiveDateTo = filters.dateTo?.trim() ? filters.dateTo : filters.dateFrom;
      const urlSearchParams = new URLSearchParams();
      fetchWithParams(filters.dateFrom, effectiveDateTo, urlSearchParams, currentPage, itemsPerPage, filters.search);
    }
  }, [filters.dateFrom, filters.dateTo, filters.depot, filters.loop, filters.payment, currentPage, itemsPerPage, filters.search, fetchWithParams, initialLoadDone]);

  // extract unique depots
  const uniqueDepots = useMemo(() => {
    const depotsSet = new Set<string>();
    
    depositsData.forEach(deposit => {
      if (deposit.depositName && 
          deposit.serviceTypes && 
          deposit.serviceTypes.length > 0) {
        const hasRoutes = deposit.serviceTypes.some(serviceType => 
          serviceType.routes && serviceType.routes.length > 0
        );
        
        if (hasRoutes) {
          depotsSet.add(deposit.depositName);
        }
      }
    });
    
    insightRows.forEach(row => {
      if (row.depot && row.depot !== 'All') {
        depotsSet.add(row.depot);
      }
    });
    
    return Array.from(depotsSet).sort();
  }, [depositsData, insightRows]);

  // extract unique loops
  const uniqueLoops = useMemo(() => {
    const loopsSet = new Set<string>(['All']);
    
    depositsData.forEach(deposit => {
      if (filters.depot !== 'All') {
        const depositId = depotToDepositIdMapRef.current.get(filters.depot);
        if (depositId !== undefined && deposit.depositId !== depositId) {
          return;
        }
      }
      
      deposit.serviceTypes.forEach(serviceType => {
        serviceType.routes.forEach(route => {
          if (route.routeName) {
            const routeLoop = extractLoop(route.routeName);
            if (routeLoop) {
              loopsSet.add(routeLoop);
            }
          }
        });
      });
    });
    
    insightRows.forEach(row => {
      if (row.route) {
        const loop = extractLoop(row.route);
        if (loop) {
          loopsSet.add(loop);
        }
      }
    });
    
    return Array.from(loopsSet).sort();
  }, [depositsData, insightRows, filters.depot, depotToDepositIdMapRef]);

  // Filter and sort data
  const baseFilteredData = useMemo(() => {
    return filterInsightData(insightRows, filters);
  }, [insightRows, filters]);

  const { sortField, sortDirection, handleSort, sortedData } = useTableSorting(baseFilteredData);

  const vendorNameToSPId = useMemo(() => {
    const m = new Map<string, number>();
    spVendors.forEach(v => {
      if (v.fullName && v.servicePartnerId != null) {
        m.set(v.fullName.toLowerCase().trim(), Number(v.servicePartnerId));
      }
    });
    return m;
  }, [spVendors]);

  const spFilteredData = useMemo(() => {
    if (selectedServicePartnerId === '') return sortedData;
    const spId = Number(selectedServicePartnerId);
    return sortedData.filter(row => {
      const sp = vendorNameToSPId.get((row.courier || '').toLowerCase().trim());
      return sp != null && sp === spId;
    });
  }, [sortedData, selectedServicePartnerId, vendorNameToSPId]);

  const pageTotals = useMemo(() => {
    return calculatePageTotals(spFilteredData);
  }, [spFilteredData]);

  // Badge da placa: verde para elétrico, azul caso contrário (como em Vehicles)
  const vrnBadgeVariantMap = useMemo(() => {
    const m = new Map<string, 'green' | 'blue'>();
    (vehicles || []).forEach((v) => {
      const plate = String(v.registrationPlates ?? v.registrationPlate ?? '').trim().toUpperCase();
      if (!plate) return;
      const fuel = String(v.fuelType ?? '').trim().toLowerCase();
      m.set(plate, fuel === 'electric' ? 'green' : 'blue');
    });
    return m;
  }, [vehicles]);

  const getVrnBadgeVariant = useCallback((vrn?: string | null) => {
    const key = String(vrn ?? '').trim().toUpperCase();
    return vrnBadgeVariantMap.get(key) ?? 'blue';
  }, [vrnBadgeVariantMap]);

  // Calcular métricas para o header
  const headerMetrics: Metric[] = useMemo(() => {
    const totalRecords = spFilteredData.length;
    const uniqueRoutes = new Set(spFilteredData.map(r => r.route).filter(Boolean)).size;
    const uniqueVendors = new Set(spFilteredData.map(r => r.courier).filter(Boolean)).size;
    return [
      { label: 'Total Records', value: totalRecords },
      { label: 'Total Amount', value: formatCurrency(pageTotals.total) },
      { label: 'Routes', value: uniqueRoutes },
      { label: 'Vendors', value: uniqueVendors },
    ];
  }, [spFilteredData, pageTotals]);

  // Formatar subtitle com as datas
  const subtitle = useMemo(() => {
    if (!filters.dateFrom) return undefined;
    const effectiveDateTo = filters.dateTo?.trim() ? filters.dateTo : filters.dateFrom;
    if (filters.dateTo?.trim()) {
      try {
        return `Period: ${format(parseISO(filters.dateFrom), 'dd MMM yyyy')} - ${format(parseISO(effectiveDateTo), 'dd MMM yyyy')}`;
      } catch {
        return `Period: ${filters.dateFrom} - ${effectiveDateTo}`;
      }
    }
    try {
      return `Date: ${format(parseISO(filters.dateFrom), 'dd MMM yyyy')}`;
    } catch {
      return `Date: ${filters.dateFrom}`;
    }
  }, [filters.dateFrom, filters.dateTo]);

  // Page change handlers
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  }, [pagination.totalPages]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Handle add new register
  const handleAddNewRegister = useCallback(() => {
    openModal(undefined, filters.depot);
  }, [openModal, filters.depot]);

  const handleEditOperationRow = useCallback(
    (row: InsightRow) => {
      openModal(row, filters.depot);
    },
    [openModal, filters.depot]
  );

  const handleDeleteOperationRow = useCallback(
    (row: InsightRow) => {
      openDeleteModal(row);
    },
    [openDeleteModal]
  );

  const handleConfirmDeleteOperation = useCallback(async () => {
    const ok = await confirmDelete();
    if (!ok) {
      setToast({ message: 'Could not delete register. Please try again.', type: 'error' });
    }
  }, [confirmDelete]);

  const handleClearFilters = useCallback(() => {
    handleToggle('depot', 'All');
    handleToggle('loop', 'All');
    handleToggle('payment', 'All');
  }, [handleToggle]);

  // Adapter for PeriodPicker: single (e) => handler
  const onDateChangeAdapter = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const key = e.target.name as 'dateFrom' | 'dateTo';
      if (key === 'dateFrom' || key === 'dateTo') handleDateChange(key)(e);
    },
    [handleDateChange]
  );

  return (
    <>
      <div className="w-full min-w-0">
        <DgpPageFrame
          className={dailyFinancialInsightsStyles.pageContainer}
          maxWidthClassName="w-full max-w-full"
          containerClassName="w-full px-2 sm:px-3 md:px-0"
        >
          <div id="main-content" className={dailyFinancialInsightsStyles.mainContent}>
            {/* Desktop */}
            <main className={dailyFinancialInsightsStyles.desktopMain}>
              <PageContent
                subtitle={subtitle}
                headerMetrics={headerMetrics}
                servicePartners={servicePartners}
                selectedServicePartnerId={selectedServicePartnerId}
                onServicePartnerChange={setSelectedServicePartnerId}
                filters={filters}
                searchInput={searchInput}
                onDateChange={onDateChangeAdapter}
                onSearchInputChange={handleSearchInputChange}
                onSearchKeyPress={handleSearchKeyPress}
                onSearchClear={clearSearch}
                onAddNewRegister={handleAddNewRegister}
                onClearFilters={handleClearFilters}
                uniqueLoops={uniqueLoops}
                uniqueDepots={uniqueDepots}
                costModels={costModels}
                onToggle={handleToggle}
                loading={loading}
                filteredData={spFilteredData}
                pageTotals={pageTotals}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                getVrnBadgeVariant={getVrnBadgeVariant}
                pagination={pagination}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                onEditOperationRow={handleEditOperationRow}
                onDeleteOperationRow={handleDeleteOperationRow}
              />
            </main>

            {/* Mobile */}
            <main className={dailyFinancialInsightsStyles.mobileMain}>
              <div className="mb-3 sm:mb-3.5 md:mb-4">
                <ModernPageHeader
                  title="Daily Financial Insights"
                  subtitle={subtitle}
                  metrics={headerMetrics}
                  gradientFrom="slate-900"
                  gradientTo="indigo-600"
                  metricsLayout="grid2x2"
                />
              </div>
              {servicePartners.length > 0 && (
                <div className="flex justify-start px-1 pb-2">
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
              <MobileFilters
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
                search={searchInput}
                filters={filters}
                uniqueDepots={uniqueDepots}
                uniqueLoops={uniqueLoops}
                costModels={costModels}
                onDateChange={onDateChangeAdapter}
                onSearchChange={handleSearchInputChange}
                onSearchClear={clearSearch}
                onToggle={handleToggle}
                onAddNewRegister={handleAddNewRegister}
              />
              <MobileView
                data={spFilteredData}
                loading={loading}
                pageTotals={pageTotals}
                costModels={costModels}
                getVrnBadgeVariant={getVrnBadgeVariant}
                pagination={pagination}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onEditOperationRow={handleEditOperationRow}
                onDeleteOperationRow={handleDeleteOperationRow}
              />
            </main>
          </div>
        </DgpPageFrame>
      </div>

      {/* Fecha a sidebar quando modais são abertos */}
      <CloseSidebarOnModalOpen open={showModal || showDeleteModal} />

      <OperationModal
        show={showModal}
        isSaving={isSaving}
        editingOperationId={editingOperationId}
        formData={formData}
        formErrors={formErrors}
        vendors={vendors}
        routes={routes}
        vehicles={vehicles}
        adhocServices={adhocServices}
        onClose={closeModal}
        onSave={handleSaveOperation}
        onFormDataChange={updateFormData}
        onFormErrorClear={clearFormError}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        row={rowToDelete}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDeleteOperation}
        isDeleting={isDeleting}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

const DailyFinancialInsights: React.FC = () => {
  return (
    <NavbarWrapper>
      <DailyFinancialInsightsContent />
    </NavbarWrapper>
  );
};

export default DailyFinancialInsights;



