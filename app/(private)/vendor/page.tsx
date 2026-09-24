'use client';
import React, { lazy, Suspense, useState, useMemo, useCallback, useLayoutEffect, useEffect } from 'react';
import NavbarWrapper from "@/components/navbar-wrapper";
import { DgpPageFrame } from "@/app/(private)/components";
import { ModernPageHeader } from "@/components/modern-page-header";
import { BootstrapLoader } from "@/components/bootstrap-loader";
import { useSidebar } from '@/components/ui/sidebar';
import { StatusBadge } from "@/components/status-badge";
import type { Vendor } from '@/lib/vendors-api';
import { useVendors } from './hooks/useVendors';
import { useSelectData } from './hooks/useSelectData';
import { useServicePartners } from '@/hooks/useServicePartners';
import { getExpiringSoonStatus, isExpired, isExpiringSoon, getTrainingExpiryDate } from './utils/vendor-utils';
import VendorFilters from './components/VendorFilters';
import VendorMobileView from './components/VendorMobileView';
import VendorTable from './components/VendorTable';
import { Pagination, type VendorPaginationState } from './components/Pagination';
import { vendorStyles } from './styles';
import './vendor-theme.css';

import { ModalLoading } from "@/components/modal-loading";

const VendorModal = lazy(() => import("./components/VendorModal"));
const VendorInfoModal = lazy(() => import("./components/VendorInfoModal"));

// Helper component to close sidebar when modals are opened
function CloseSidebarOnModalOpen({ open }: { open: boolean }) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  // useLayoutEffect executes synchronously before painting, closing sidebar instantly
  useLayoutEffect(() => {
    if (!open) return;
    // Close sidebar immediately when a modal is opened
    if (isMobile) setOpenMobile(false);
    setOpen(false);
  }, [open, isMobile, setOpen, setOpenMobile]);

  return null;
}

const VendorDashboard = () => {
  const { vendors, isLoading, addVendor, editVendor, loadVendorsByServicePartner } = useVendors();
  const { deposits, vendorTypes, userTypes, routes, vehicles, costModels } = useSelectData();
  const { servicePartners } = useServicePartners();
  const [filter, setFilter] = useState({ search: '', status: 'all', vendorType: 'all', servicePartnerId: '' });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [infoModalType, setInfoModalType] = useState<'training' | 'documents' | null>(null);
  const [infoModalVendor, setInfoModalVendor] = useState<Vendor | null>(null);
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 25 });

  // Load vendors by service partner when filter changes
  useEffect(() => {
    // When "All Service Partners" is selected (empty string), load all vendors with no filter
    const partnerId = filter.servicePartnerId !== '' ? filter.servicePartnerId : undefined;
    loadVendorsByServicePartner(partnerId);
  }, [filter.servicePartnerId, loadVendorsByServicePartner]);

  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [filter.search, filter.status, filter.vendorType, filter.servicePartnerId]);

  const handleOpenModal = useCallback((mode: 'add' | 'edit', vendor: Vendor | null = null) => {
    setModalMode(mode);
    setSelectedVendor(vendor);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedVendor(null);
  }, []);

  const handleSave = useCallback(async (formData: Partial<Vendor>) => {
    // Validate if email already exists (only in add mode)
    if (modalMode === 'add' && formData.email) {
      const emailExists = vendors.some(v => v.email && v.email.toLowerCase() === formData.email?.toLowerCase());
      if (emailExists) {
        throw new Error('This email is already registered. Please use another email.');
      }
    }

    if (modalMode === 'add') {
      await addVendor(formData as Omit<Vendor, 'id'>);
    } else {
      if (formData.id !== undefined) {
        await editVendor(formData.id, formData);
      }
    }

    // Re-apply service partner filter after save to ensure newly created/edited vendors appear correctly
    const partnerId = filter.servicePartnerId !== '' ? filter.servicePartnerId : undefined;
    await loadVendorsByServicePartner(partnerId);
  }, [modalMode, vendors, addVendor, editVendor, filter.servicePartnerId, loadVendorsByServicePartner]);

  // Filtering Logic
  const filteredVendors = useMemo(() => {
    const today = new Date();
    const result = vendors.filter(vendor => {
      // Search
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const nameMatch = `${vendor.firstName} ${vendor.lastName}`.toLowerCase().includes(searchLower);
        const emailMatch = vendor.email && vendor.email.toLowerCase().includes(searchLower);
        const supplierIdMatch = vendor.supplierId && vendor.supplierId.toLowerCase().includes(searchLower);
        const depotMatch = vendor.depot && vendor.depot.toLowerCase().includes(searchLower);

        // Resolve route name if possible
        let routeNameMatch = false;
        if (vendor.routeIdLink && routes) {
          const route = routes.find(r => String(r.routeId) === String(vendor.routeIdLink));
          if (route && route.routeName && route.routeName.toLowerCase().includes(searchLower)) {
            routeNameMatch = true;
          }
        }

        if (!nameMatch && !emailMatch && !supplierIdMatch && !depotMatch && !routeNameMatch) return false;
      }

      // Vendor Type
      if (filter.vendorType !== 'all' && vendor.vendorType !== filter.vendorType) return false;

      // Note: Service Partner filtering is now done at API level via loadVendorsByServicePartner
      // so we don't need to filter here anymore

      // Status Logic
      if (filter.status !== 'all') {
        const isActive = vendor.status 
          ? vendor.status === 'Active'
          : (!vendor.finishDate || new Date(vendor.finishDate) > today);
        const isInactive = vendor.status
          ? vendor.status === 'Inactive'
          : (!!vendor.finishDate && new Date(vendor.finishDate) <= today);
        const isPending = (!vendor.criminalRecordDate || !vendor.dvlaCheckDate);
        const isExpiring = getExpiringSoonStatus(vendor) !== 'None';

        if (filter.status === 'active' && !isActive) return false;
        if (filter.status === 'inactive' && !isInactive) return false;
        if (filter.status === 'pending' && !isPending) return false;
        if (filter.status === 'expiring' && (!isExpiring || !isActive)) return false;
      }

      return true;
    });

    return result;
  }, [vendors, filter, routes]);

  // Pagination: slice filtered list and compute pagination state
  const paginationState = useMemo((): VendorPaginationState => {
    const totalItems = filteredVendors.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pagination.itemsPerPage));
    const currentPage = Math.min(Math.max(1, pagination.currentPage), totalPages);
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: pagination.itemsPerPage,
    };
  }, [filteredVendors.length, pagination.currentPage, pagination.itemsPerPage]);

  const paginatedVendors = useMemo(() => {
    const start = (paginationState.currentPage - 1) * paginationState.itemsPerPage;
    return filteredVendors.slice(start, start + paginationState.itemsPerPage);
  }, [filteredVendors, paginationState.currentPage, paginationState.itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
    setPagination(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
  }, []);

  // Header metrics: single pass over filtered list (performance)
  const headerMetrics = useMemo(() => {
    const today = new Date();
    let active = 0;
    let inactive = 0;
    let pending = 0;
    for (const v of filteredVendors) {
      if (v.status) {
        if (v.status === 'Active') active++;
        else inactive++;
      } else {
        if (!v.finishDate || new Date(v.finishDate) > today) active++;
        else inactive++;
      }
      if (!v.criminalRecordDate || !v.dvlaCheckDate) pending++;
    }
    return {
      total: filteredVendors.length,
      active,
      inactive,
      pending,
    };
  }, [filteredVendors]);

  // Stable metrics array for header KPIs (avoids unnecessary re-renders, includes icons)
  const headerMetricsForKpis = useMemo(
    () => [
      { label: 'Total', value: headerMetrics.total, icon: <i className="bi bi-people text-sm opacity-80" aria-hidden /> },
      { label: 'Active', value: headerMetrics.active, icon: <i className="bi bi-check-circle-fill text-emerald-600 text-sm" aria-hidden /> },
      { label: 'Inactive', value: headerMetrics.inactive, icon: <i className="bi bi-x-circle-fill text-slate-400 text-sm" aria-hidden /> },
      { label: 'Pending', value: headerMetrics.pending, icon: <i className="bi bi-clock-history text-amber-500 text-sm" aria-hidden /> },
    ],
    [headerMetrics.total, headerMetrics.active, headerMetrics.inactive, headerMetrics.pending]
  );

  // Render Helpers - Memoized to avoid recreation
  const getStatusBadge = useCallback((sub: Vendor) => {
    if (sub.status) {
      return sub.status === 'Active' 
        ? <StatusBadge status="active">Active</StatusBadge>
        : <StatusBadge status="inactive">Inactive</StatusBadge>;
    }
    const today = new Date();
    if (!sub.finishDate || new Date(sub.finishDate) > today) {
      return <StatusBadge status="active">Active</StatusBadge>;
    }
    return <StatusBadge status="inactive">Inactive</StatusBadge>;
  }, []);

  const getTrainingBadge = useCallback((sub: Vendor) => {
    const isComplete = sub.cargoTraining && sub.dangerousGoodsTraining && sub.manualHandlingTraining;
    
    if (!isComplete) {
      return <StatusBadge status="incomplete">Incomplete</StatusBadge>;
    }

    // When all trainings are complete, apply the same expiring soon rule as documents
    // Check if any training is expired or expiring soon (30 days)
    const trainingDates = [
      sub.cargoTrainingDate,
      sub.dangerousGoodsTrainingDate,
      sub.manualHandlingTrainingDate,
    ];

    let hasExpired = false;
    let hasExpiringSoon = false;

    for (const completedDate of trainingDates) {
      if (completedDate) {
        const expiryDate = getTrainingExpiryDate(completedDate);
        if (expiryDate) {
          if (isExpired(expiryDate)) {
            hasExpired = true;
            break; // If found an expired one, prioritize this status
          } else if (isExpiringSoon(expiryDate)) {
            // Check if it's expiring soon (30 days before expiry)
            hasExpiringSoon = true;
          }
        }
      }
    }

    // Apply the same logic as documents: Expired > Expiring Soon > Complete
    if (hasExpired) {
      return <StatusBadge status="expired">Expired</StatusBadge>;
    } else if (hasExpiringSoon) {
      return <StatusBadge status="expiring">Expiring Soon</StatusBadge>;
    }

    return <StatusBadge status="active">Complete</StatusBadge>;
  }, []);

  const getDocumentsBadge = useCallback((sub: Vendor) => {
    const isVerified = sub.criminalRecordDate && sub.dvlaCheckDate;
    
    if (!isVerified) {
      return <StatusBadge status="pending">Pending</StatusBadge>;
    }

    // Check if any document is expired or expiring soon
    const expiryDates = [
      sub.visaValidity,
      sub.licenceExpiringDate,
      sub.passportExpiringDate,
    ];

    let hasExpired = false;
    let hasExpiringSoon = false;

    for (const expiryDate of expiryDates) {
      if (expiryDate) {
        if (isExpired(expiryDate)) {
          hasExpired = true;
          break; // If found an expired one, prioritize this status
        } else if (isExpiringSoon(expiryDate)) {
          hasExpiringSoon = true;
        }
      }
    }

    if (hasExpired) {
      return <StatusBadge status="expired">Expired</StatusBadge>;
    } else if (hasExpiringSoon) {
      return <StatusBadge status="expiring">Expiring Soon</StatusBadge>;
    }

    return <StatusBadge status="verified">Verified</StatusBadge>;
  }, []);

  const handleNewClick = useCallback(() => {
    handleOpenModal('add');
  }, [handleOpenModal]);

  const handleEditClick = useCallback((vendor: Vendor) => {
    handleOpenModal('edit', vendor);
  }, [handleOpenModal]);

  const handleShowTraining = useCallback((vendor: Vendor) => {
    setInfoModalVendor(vendor);
    setInfoModalType('training');
  }, []);

  const handleShowDocuments = useCallback((vendor: Vendor) => {
    setInfoModalVendor(vendor);
    setInfoModalType('documents');
  }, []);

  const handleCloseInfoModal = useCallback(() => {
    setInfoModalVendor(null);
    setInfoModalType(null);
  }, []);

  return (
    <NavbarWrapper>
      <div className="vendor-theme">
      <BootstrapLoader />
      <DgpPageFrame className={vendorStyles.pageContainer} width="wide">
        <div id="main-content" className={vendorStyles.mainContent}>
          {/* Desktop Version */}
          <main className={vendorStyles.desktopMain}>
            <div className="mb-4">
              <ModernPageHeader
                title="Vendors"
                subtitle="Vendor management and information"
                metrics={headerMetricsForKpis}
                gradientFrom="slate-900"
                gradientTo="teal-600"
                metricsLayout="grid2x2"
              />
            </div>

            {/* Action Bar */}
            <VendorFilters
              filter={filter}
              onFilterChange={setFilter}
              onNewClick={handleNewClick}
              vendors={filteredVendors}
              vendorTypes={vendorTypes}
              costModels={costModels}
              servicePartners={servicePartners}
            />

            {/* Lista (tabela): clique abre a mesma modal de edição */}
            <VendorTable
              vendors={paginatedVendors}
              vendorTypes={vendorTypes}
              costModels={costModels}
              servicePartners={servicePartners}
              isLoading={isLoading}
              onEdit={handleEditClick}
              getStatusBadge={getStatusBadge}
              getTrainingBadge={getTrainingBadge}
              getDocumentsBadge={getDocumentsBadge}
              onShowTraining={handleShowTraining}
              onShowDocuments={handleShowDocuments}
            />
            <Pagination
              pagination={paginationState}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              isLoading={isLoading}
            />
          </main>

          {/* Mobile Version */}
          <VendorMobileView
            vendors={filteredVendors}
            vendorTypes={vendorTypes}
            isLoading={isLoading}
            filter={filter}
            onFilterChange={setFilter}
            onNewClick={handleNewClick}
            onEdit={handleEditClick}
            getStatusBadge={getStatusBadge}
            headerMetrics={headerMetrics}
            kpiMetrics={headerMetricsForKpis}
            servicePartners={servicePartners}
          />
        </div>

        {/* Vendor Modal */}
        {showModal && (
          <Suspense fallback={<ModalLoading />}>
            <VendorModal
          show={showModal}
          mode={modalMode}
          vendor={selectedVendor}
          vendors={vendors}
          deposits={deposits}
          vendorTypes={vendorTypes}
          userTypes={userTypes}
          servicePartners={servicePartners}
          routes={routes}
          vehicles={vehicles}
          costModels={costModels}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
          </Suspense>
        )}

        {/* Closes the sidebar when modals are opened */}
        <CloseSidebarOnModalOpen open={showModal} />
        <CloseSidebarOnModalOpen open={!!infoModalType} />

        {!!infoModalType && (
          <Suspense fallback={<ModalLoading />}>
            <VendorInfoModal
          show={!!infoModalType}
          vendor={infoModalVendor}
          type={infoModalType}
          onClose={handleCloseInfoModal}
        />
          </Suspense>
        )}
      </DgpPageFrame>
      </div>
    </NavbarWrapper>
  );
};

export default VendorDashboard;
