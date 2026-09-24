"use client";

import React, { lazy, Suspense, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import NavbarWrapper from "@/components/navbar-wrapper";
import { DgpPageFrame } from "@/app/(private)/components";
import { ModernPageHeader } from "@/components/modern-page-header";
import { useSidebar } from '@/components/ui/sidebar';
import { fetchVehiclesPaginated, fetchAllVehiclesWithFilters, createVehicle, updateVehicle, deleteVehicle, fetchVehicleTypes, PaginationState, type VehicleType } from "@/lib/vehicles";
import { fetchDeposits, type Deposit } from "@/lib/vendors-api";
import { useServicePartners } from '@/hooks/useServicePartners';
import { parseISO, isValid } from 'date-fns';
import { VehicleFilters } from './components/VehicleFilters';
import { VehicleCardGrid } from './components/VehicleCardGrid';
import { VehicleTable } from './components/VehicleTable';
import { Pagination } from './components/Pagination';
import MobileVehicleFilters from './components/MobileVehicleFilters';
import { mapBackendToFrontend, mapFrontendToBackend, type Vehicle, type VehicleFormData } from './utils/vehicleMappers';
import { availableFuelTypes } from './constants';
import { vehiclesStyles } from './styles';

import { ModalLoading } from "@/components/modal-loading";

const VehicleModal = lazy(() => import("./components/VehicleModal").then(m => ({ default: m.VehicleModal })));
const DeleteVehicleModal = lazy(() => import("./components/DeleteVehicleModal").then(m => ({ default: m.DeleteVehicleModal })));

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

type ModalMode = 'add' | 'edit';

const VehiclesDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [servicePartnerFilter, setServicePartnerFilter] = useState('');
  const { servicePartners, loading: servicePartnersLoading } = useServicePartners();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | undefined>(undefined);
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    // Em telas menores que 767px, padrão é 100, senão 10
    if (typeof window !== 'undefined' && window.innerWidth < 767) {
      return 100;
    }
    return 10;
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const userSelectedItemsPerPage = useRef<boolean>(false);
  const [globalHeaderMetrics, setGlobalHeaderMetrics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    available: 0,
  });
  const metricsRequestSeq = useRef(0);

  // Fetch vehicles from backend with pagination
  const loadVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm.trim() || undefined,
        active: statusFilter === 'all' ? undefined : statusFilter === 'Active' ? true : false,
        fuelType: fuelTypeFilter !== 'all' ? fuelTypeFilter : undefined,
        servicePartnerId: servicePartnerFilter !== '' ? Number(servicePartnerFilter) : undefined,
      };

      const response = await fetchVehiclesPaginated(filters);
      const mappedVehicles = response.data.map(mapBackendToFrontend);
      setVehicles(mappedVehicles);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      alert(`Error loading vehicles: ${error instanceof Error ? error.message : "Unknown error"}`);
      setVehicles([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: itemsPerPage
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, fuelTypeFilter, servicePartnerFilter]);

  // Fetch vehicle types from backend
  const loadVehicleTypes = useCallback(async () => {
    try {
      const types = await fetchVehicleTypes();
      setVehicleTypes(types);
    } catch (error) {
      console.error("Error loading vehicle types:", error);
    }
  }, []);

  // Fetch deposits from backend
  const loadDeposits = useCallback(async () => {
    try {
      const depositsData = await fetchDeposits();
      setDeposits(depositsData);
    } catch (error) {
      console.error("Error loading deposits:", error);
      setDeposits([]);
    }
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, fuelTypeFilter, servicePartnerFilter]);

  // Ajustar itemsPerPage padrão para 100 em telas menores que 767px
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkScreenSize = () => {
      const isSmallScreen = window.innerWidth < 767;
      
      // Apenas ajustar automaticamente se o usuário não tiver selecionado manualmente
      // e se o valor atual for um dos padrões (10 ou 100)
      if (!userSelectedItemsPerPage.current) {
        if (isSmallScreen && itemsPerPage === 10) {
          setItemsPerPage(100);
        } else if (!isSmallScreen && itemsPerPage === 100) {
          setItemsPerPage(10);
        }
      }
    };

    // Verificar imediatamente
    checkScreenSize();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [itemsPerPage]);

  // Load vehicles when pagination or filters change
  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const loadGlobalHeaderMetrics = useCallback(async () => {
    const requestId = ++metricsRequestSeq.current;
    try {
      const filters = {
        search: searchTerm.trim() || undefined,
        active: statusFilter === 'all' ? undefined : statusFilter === 'Active' ? true : false,
        fuelType: fuelTypeFilter !== 'all' ? fuelTypeFilter : undefined,
        servicePartnerId: servicePartnerFilter !== '' ? Number(servicePartnerFilter) : undefined,
      };

      const allBackendVehicles = await fetchAllVehiclesWithFilters(filters);
      const allVehicles = allBackendVehicles.map(mapBackendToFrontend);

      const metrics = {
        total: allVehicles.length,
        active: allVehicles.filter(v => v.status === 'Active').length,
        inactive: allVehicles.filter(v => v.status === 'Inactive').length,
        available: allVehicles.filter(v => v.status === 'Available').length,
      };

      // Ignora respostas antigas (ex: usuário digitou/paginou rápido)
      if (requestId === metricsRequestSeq.current) setGlobalHeaderMetrics(metrics);
    } catch (error) {
      console.error("Error loading global header metrics:", error);
      if (requestId === metricsRequestSeq.current) {
        setGlobalHeaderMetrics({
          total: 0,
          active: 0,
          inactive: 0,
          available: 0,
        });
      }
    }
  }, [searchTerm, statusFilter, fuelTypeFilter, servicePartnerFilter]);

  // Carrega métricas globais (considerando TODOS os veículos que batem com os filtros),
  // evitando usar apenas os itens da paginação atual (ex: 10 por página).
  useEffect(() => {
    const debounceMs = 350;
    const t = setTimeout(() => {
      void loadGlobalHeaderMetrics();
    }, debounceMs);

    return () => {
      clearTimeout(t);
    };
  }, [loadGlobalHeaderMetrics]);

  // Load vehicle types on mount
  useEffect(() => {
    loadVehicleTypes();
  }, [loadVehicleTypes]);

  // Load deposits on mount
  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  // Handler para ordenação
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      // Se já está ordenando por este campo, inverte a direção
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Novo campo, começa com ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Handler para mudança de página
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  }, [pagination.totalPages]);

  // Handler para mudança de itens por página
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset para primeira página quando mudar itens por página
    userSelectedItemsPerPage.current = true; // Marcar que o usuário escolheu manualmente
  }, []);

  // Criar mapa de servicePartnerId -> partnerName
  const servicePartnerMap = useMemo(() => {
    const map = new Map<number, string>();
    servicePartners.forEach(sp => {
      map.set(sp.servicePartnerId, sp.partnerName);
    });
    return map;
  }, [servicePartners]);

  // Apply sorting and client-side service partner filter
  const filteredVehicles = useMemo(() => {
    let list = vehicles;
    if (servicePartnerFilter !== '') {
      const spId = Number(servicePartnerFilter);
      list = list.filter(v => v.servicePartnerId != null && Number(v.servicePartnerId) === spId);
    }
    if (!sortField) return list;

    const sorted = [...vehicles].sort((a, b) => {
      let aRaw: unknown;
      let bRaw: unknown;

      // Special handling for servicePartners field - use the partner name
      if (sortField === 'servicePartners') {
        const aSpId = typeof a.servicePartnerId === 'string' ? parseInt(a.servicePartnerId, 10) : a.servicePartnerId;
        const bSpId = typeof b.servicePartnerId === 'string' ? parseInt(b.servicePartnerId, 10) : b.servicePartnerId;
        aRaw = aSpId != null ? servicePartnerMap.get(aSpId) : null;
        bRaw = bSpId != null ? servicePartnerMap.get(bSpId) : null;
      } else {
        aRaw = a[sortField as keyof typeof a];
        bRaw = b[sortField as keyof typeof b];
      }

      const toComparable = (raw: unknown): string | number | null => {
        // Special handling for registrationDate field (YYYY-MM-DD)
        if (sortField === 'registrationDate') {
          if (!raw || (typeof raw === 'string' && !raw.trim())) return null;
          const dateStr = String(raw).trim();
          try {
            const d = parseISO(dateStr);
            if (!isValid(d)) return null;
            return d.getTime();
          } catch {
            return null;
          }
        }

        if (raw == null) return null;

        if (typeof raw === 'string') return raw.toLowerCase().trim();
        if (typeof raw === 'number') return raw;

        // Fallback: converter para string
        return String(raw).toLowerCase();
      };

      const aValue = toComparable(aRaw);
      const bValue = toComparable(bRaw);

      // Tratamento de valores nulos/undefined - sempre vão para o final
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Comparação
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [vehicles, sortField, sortDirection, servicePartnerFilter, servicePartnerMap]);

  const openModal = useCallback((mode: ModalMode, vehicle?: Vehicle) => {
    setModalMode(mode);
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingVehicle(undefined);
  }, []);

  const handleSaveVehicle = useCallback(async (formData: VehicleFormData) => {
    setIsSaving(true);
    try {
      const backendData = mapFrontendToBackend(formData);

      if (modalMode === 'edit' && editingVehicle) {
        await updateVehicle(editingVehicle.id, backendData);
      } else {
        await createVehicle(backendData);
      }

      // Reload vehicles after saving
      await loadVehicles();
      // Recarrega métricas globais após mudança (create/update)
      await loadGlobalHeaderMetrics();
      closeModal();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert(`Error saving vehicle: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  }, [modalMode, editingVehicle, closeModal, loadVehicles, loadGlobalHeaderMetrics]);

  const handleDeleteClick = useCallback((vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!vehicleToDelete) return;

    setIsDeleting(true);
    try {
      await deleteVehicle(vehicleToDelete.id);
      // Reload vehicles after deleting
      await loadVehicles();
      // Recarrega métricas globais após mudança (delete)
      await loadGlobalHeaderMetrics();
      setIsDeleteModalOpen(false);
      setVehicleToDelete(undefined);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('foreign key constraint') || 
          errorMessage.includes('violates foreign key') ||
          errorMessage.includes('operations_management')) {
        alert(
          'Cannot delete this vehicle because it is being used in operations.\n\n' +
          'To delete this vehicle, first remove or change all operations that use it.'
        );
      } else {
        alert(`Error deleting vehicle: ${errorMessage}`);
      }
    } finally {
      setIsDeleting(false);
    }
  }, [vehicleToDelete, loadVehicles, loadGlobalHeaderMetrics]);

  const handleDeleteCancel = useCallback(() => {
    setIsDeleteModalOpen(false);
    setVehicleToDelete(undefined);
  }, []);

  const handleEdit = useCallback((vehicle: Vehicle) => {
    openModal('edit', vehicle);
  }, [openModal]);

  return (
    <NavbarWrapper>
      <>
        <DgpPageFrame className={vehiclesStyles.pageContainer} width="wide">
          <div id="main-content" className={vehiclesStyles.mainContent}>
            {/* Desktop Version */}
            <main className={vehiclesStyles.desktopMain}>
              <div className="mb-4">
                <ModernPageHeader
                  title="Vehicles"
                  subtitle="Vehicle fleet management"
                  metrics={[
                    { label: 'Total', value: globalHeaderMetrics.total },
                    { label: 'Active', value: globalHeaderMetrics.active },
                    { label: 'Inactive', value: globalHeaderMetrics.inactive },
                  ]}
                  gradientFrom="slate-900"
                  gradientTo="indigo-600"
                />
              </div>

              <VehicleFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                fuelTypeFilter={fuelTypeFilter}
                availableFuelTypes={availableFuelTypes}
                filteredVehicles={filteredVehicles}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onFuelTypeFilterChange={setFuelTypeFilter}
                onAddClick={() => openModal('add')}
                servicePartnerFilter={servicePartnerFilter}
                servicePartners={servicePartners}
                onServicePartnerFilterChange={setServicePartnerFilter}
              />

              <VehicleTable
                vehicles={filteredVehicles}
                servicePartners={servicePartners}
                isLoading={isLoading}
                isDeleting={isDeleting}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />

              <Pagination
                pagination={pagination}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={isLoading}
                currentItemsCount={vehicles.length}
              />
            </main>

            {/* Mobile Version */}
            <main className={vehiclesStyles.mobileMain}>
              <div className="mb-4">
                <ModernPageHeader
                  title="Vehicles"
                  subtitle="Vehicle fleet management"
                  metrics={[
                    { label: 'Total', value: globalHeaderMetrics.total },
                    { label: 'Active', value: globalHeaderMetrics.active },
                    { label: 'Inactive', value: globalHeaderMetrics.inactive },
                  ]}
                  gradientFrom="slate-900"
                  gradientTo="indigo-600"
                />
              </div>

              <MobileVehicleFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                fuelTypeFilter={fuelTypeFilter}
                availableFuelTypes={availableFuelTypes}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onFuelTypeFilterChange={setFuelTypeFilter}
                onAddClick={() => openModal('add')}
                servicePartnerFilter={servicePartnerFilter}
                servicePartners={servicePartners}
                onServicePartnerFilterChange={setServicePartnerFilter}
              />

              <VehicleCardGrid
                vehicles={filteredVehicles}
                isLoading={isLoading}
                onCardClick={handleEdit}
                servicePartners={servicePartners}
              />

              {/* Mobile Pagination */}
              <Pagination
                pagination={pagination}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={isLoading}
                currentItemsCount={vehicles.length}
              />
            </main>
          </div>
        </DgpPageFrame>

        {/* Fecha a sidebar quando modais são abertos */}
        <CloseSidebarOnModalOpen open={isModalOpen} />
        <CloseSidebarOnModalOpen open={isDeleteModalOpen} />

        {isModalOpen && (
          <Suspense fallback={<ModalLoading />}>
            <VehicleModal
          mode={modalMode}
          vehicle={editingVehicle}
          isOpen={isModalOpen}
          isSaving={isSaving}
          vehicleTypes={vehicleTypes}
          servicePartners={servicePartners}
          servicePartnersLoading={servicePartnersLoading}
          onClose={closeModal}
          onSave={handleSaveVehicle}
        />
          </Suspense>
        )}

        {isDeleteModalOpen && (
          <Suspense fallback={<ModalLoading />}>
            <DeleteVehicleModal
          isOpen={isDeleteModalOpen}
          vehicleVrn={vehicleToDelete?.vrn || ''}
          isDeleting={isDeleting}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
          </Suspense>
        )}
      </>
    </NavbarWrapper>
  );
};

export default VehiclesDashboard;

