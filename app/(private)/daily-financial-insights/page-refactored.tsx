'use client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavbarWrapper from '@/components/navbar-wrapper';
import { PageHeader } from '@/components/page-header';
import { GradientDotsBackground } from '@/components/gradient-dots-background';
import { getUserTypeFromToken, hasAuthSession } from '@/lib/auth';
import { filterInsightData, calculatePageTotals } from './dataProcessor';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

// Custom Hooks
import { useDailyFinancialData } from './hooks/useDailyFinancialData';
import { useFilters } from './hooks/useFilters';
import { useTableSorting } from './hooks/useTableSorting';
import { useOperationModal } from './hooks/useOperationModal';

// Components
import { FilterBar } from './components/FilterBar';
import { InsightsTable } from './components/InsightsTable';
import { Pagination } from './components/Pagination';
import { OperationModal } from './components/OperationModal';
import { Toast } from './components/Toast';

const DailyFinancialInsights: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Custom Hooks
  const {
    filters,
    searchInput,
    handleDateChange,
    handleSearchInputChange,
    handleSearchKeyPress,
    applySearch,
  } = useFilters();

  const {
    insightRows,
    loading,
    pagination,
    costModels,
    vendors,
    routes,
    vehicles,
    adhocServices,
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
  }, vendors, adhocServices);

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

  // Fetch data when filters or pagination change
  useEffect(() => {
    if (initialLoadDone && filters.dateFrom) {
      const effectiveDateTo = filters.dateTo?.trim() ? filters.dateTo : filters.dateFrom;
      const urlSearchParams = new URLSearchParams();
      fetchWithParams(filters.dateFrom, effectiveDateTo, urlSearchParams, currentPage, itemsPerPage, filters.search);
    }
  }, [filters.dateFrom, filters.dateTo, filters.depot, filters.loop, filters.payment, currentPage, itemsPerPage, filters.search, fetchWithParams, initialLoadDone]);

  // Filter and sort data
  const baseFilteredData = useMemo(() => {
    return filterInsightData(insightRows, filters);
  }, [insightRows, filters]);

  const { sortField, sortDirection, handleSort, sortedData } = useTableSorting(baseFilteredData);

  const pageTotals = useMemo(() => {
    return calculatePageTotals(sortedData);
  }, [sortedData]);

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

  return (
    <NavbarWrapper>
      <GradientDotsBackground className="font-['Inter',sans-serif] text-[#2c3e50] text-[0.9rem] relative min-h-screen">
        <div className="pt-16 max-w-[1600px] mx-auto p-6 space-y-6">
          <PageHeader title="Daily Financial Insights" />
          
          <FilterBar
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            search={searchInput}
            onDateChange={handleDateChange}
            onSearchChange={handleSearchInputChange}
            onSearchKeyPress={handleSearchKeyPress}
            onSearchClear={() => {}}
            onAddNewRegister={handleAddNewRegister}
          />

          <InsightsTable
            loading={loading}
            filteredData={sortedData}
            pageTotals={pageTotals}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            costModels={costModels}
            getVrnBadgeVariant={getVrnBadgeVariant}
          />

          <Pagination
            pagination={pagination}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            loading={loading}
          />
        </div>
      </GradientDotsBackground>

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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </NavbarWrapper>
  );
};

export default DailyFinancialInsights;



