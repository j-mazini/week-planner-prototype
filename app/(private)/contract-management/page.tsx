'use client';

import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import NavbarWrapper from "@/components/navbar-wrapper";
import { BootstrapLoader } from "@/components/bootstrap-loader";
import { DgpPageFrame, MobilePageShell } from "@/app/(private)/components";
import { ExportButton, type ExportFormat } from '@/components/export-button';
import { RoutesHeader } from './components/RoutesHeader';
import { ContractManagementTabBody, type ContractManagementTabValue } from './components/ContractManagementTabBody';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFullNameFromToken } from '@/lib/auth';
import { contractManagementStyles } from './styles';
import { createDeposit, updateDeposit, fetchDeposits, type Deposit } from '@/lib/vendors-api';
import { 
  type RouteInDepositDTO,
  type LoopDTO,
  type LoopInDepositDTO,
  type ServiceTypeDTO,
  deleteLoop,
  createLoop,
  updateLoop,
  fetchServiceTypesDTO,
  createServiceType,
  updateServiceType,
  deleteServiceType,
  fetchAllRoutes,
  fetchAdhocServiceTypes,
  type DepositWithLoopsAndRoutesDTO,
} from '@/lib/serviceTypes';
import { fetchRoutes } from '@/lib/api/routes';
import { type Route } from '@/lib/api/routes';
import {
  createAdhocService,
  updateAdhocService,
  type AdhocService,
  type AdhocServiceCreateDTO,
  type AdhocServiceUpdateDTO,
} from '@/lib/types-config-api';
import { useDeposits } from './hooks/useDeposits';
import { useServicePartners } from '@/hooks/useServicePartners';
import { useSidebar } from '@/components/ui/sidebar';

// Lazy load modals
const DepositModal = lazy(() => import('./components/DepositModal').then(m => ({ default: m.default })));
const DepositEditModal = lazy(() => import('./components/DepositEditModal').then(m => ({ default: m.default })));
const LoopModal = lazy(() => import('./components/LoopModal').then(m => ({ default: m.default })));
const RouteModal = lazy(() => import('./components/RouteModal').then(m => ({ default: m.default })));
const RouteViewModal = lazy(() => import('./components/RouteViewModal').then(m => ({ default: m.default })));
const ServiceTypeModal = lazy(() => import('./components/ServiceTypeModal').then(m => ({ default: m.default })));
const AdhocServiceModal = lazy(() => import('./components/Modals/AdhocServiceModal').then(m => ({ default: m.default })));

// Format current date utility
const formatCurrentDate = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return now.toLocaleDateString('en-US', options);
};

function CloseSidebarOnAnyModalOpen({
  showDepositModal,
  showDepositEditModal,
  showLoopModal,
  showRouteModal,
  showRouteViewModal,
  showRouteModalBA,
  showServiceTypeModal,
}: {
  showDepositModal: boolean;
  showDepositEditModal: boolean;
  showLoopModal: boolean;
  showRouteModal: boolean;
  showRouteViewModal: boolean;
  showRouteModalBA: boolean;
  showServiceTypeModal: boolean;
}) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const anyOpen =
    showDepositModal ||
    showDepositEditModal ||
    showLoopModal ||
    showRouteModal ||
    showRouteViewModal ||
    showRouteModalBA ||
    showServiceTypeModal;
  useEffect(() => {
    if (!anyOpen) return;
    if (isMobile) setOpenMobile(false);
    setOpen(false);
  }, [anyOpen, isMobile, setOpen, setOpenMobile]);
  return null;
}

const TABS: { value: ContractManagementTabValue; label: string; shortLabel: string; icon: string }[] = [
  { value: 'depot-management', label: 'Depot Management', shortLabel: 'Depot', icon: 'bi-building' },
  { value: 'ba-costs-centers', label: 'BA Costs Centers', shortLabel: 'BA Costs', icon: 'bi-cash-stack' },
  { value: 'ad-hoc-services', label: 'Ad-Hoc Services', shortLabel: 'Ad-Hoc', icon: 'bi-puzzle' },
  { value: 'service-partner', label: 'Service Partner', shortLabel: 'Partner', icon: 'bi-people' },
];

const RoutesManagement = () => {
  const [activeTab, setActiveTab] = useState<ContractManagementTabValue>('depot-management');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [userFullName, setUserFullName] = useState<string>('User');
  
  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDepositEditModal, setShowDepositEditModal] = useState(false);
  const [showLoopModal, setShowLoopModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showRouteViewModal, setShowRouteViewModal] = useState(false);
  const [showRouteModalBA, setShowRouteModalBA] = useState(false);
  const [showServiceTypeModal, setShowServiceTypeModal] = useState(false);
  
  // Selected items
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [selectedLoop, setSelectedLoop] = useState<LoopDTO | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteInDepositDTO | null>(null);
  const [selectedRouteForView, setSelectedRouteForView] = useState<{ route: RouteInDepositDTO; depositName?: string } | null>(null);
  const [selectedRouteForEdit, setSelectedRouteForEdit] = useState<Route | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceTypeDTO | null>(null);
  const [selectedDepositId, setSelectedDepositId] = useState<number | undefined>(undefined);
  const [selectedLoopId, setSelectedLoopId] = useState<number | undefined>(undefined);
  const [defaultIsAdhocCategory, setDefaultIsAdhocCategory] = useState<boolean>(false);
  const [adhocReloadKey, setAdhocReloadKey] = useState(0);
  const [showAdhocServiceModal, setShowAdhocServiceModal] = useState(false);
  const [selectedAdhocService, setSelectedAdhocService] = useState<AdhocService | null>(null);
  const [routesReloadKey, setRoutesReloadKey] = useState(0);

  // Hooks
  const { loadDepositsWithRoutes, depositsWithLoops, isLoadingDepositsWithRoutes, error } = useDeposits();
  const { servicePartners } = useServicePartners();
  
  // Service types state
  const [serviceTypesByDeposit, setServiceTypesByDeposit] = useState<Map<number, ServiceTypeDTO[]>>(new Map());
  const [routesByServiceType, setRoutesByServiceType] = useState<Map<number, RouteInDepositDTO[]>>(new Map());

  useEffect(() => {
    setCurrentDate(formatCurrentDate());
    const fullName = getFullNameFromToken();
    if (fullName) {
      setUserFullName(fullName);
    }
  }, []);

  // Load service types and routes
  const loadServiceTypes = useCallback(async () => {
    try {
      const [serviceTypesData, routesData] = await Promise.all([
        fetchServiceTypesDTO(),
        fetchAllRoutes().catch(err => {
          console.error('Error fetching routes:', err);
          return [];
        })
      ]);
      
      // Group service types by depositId
      const byDeposit = new Map<number, ServiceTypeDTO[]>();
      serviceTypesData.forEach(st => {
        if (st.depositId) {
          if (!byDeposit.has(st.depositId)) {
            byDeposit.set(st.depositId, []);
          }
          byDeposit.get(st.depositId)!.push(st);
        }
      });
      setServiceTypesByDeposit(byDeposit);
      
      // Group routes by serviceTypeId
      const byServiceType = new Map<number, RouteInDepositDTO[]>();
      routesData.forEach(route => {
        if (route.serviceTypeId) {
          if (!byServiceType.has(route.serviceTypeId)) {
            byServiceType.set(route.serviceTypeId, []);
          }
          byServiceType.get(route.serviceTypeId)!.push(route);
        }
      });
      setRoutesByServiceType(byServiceType);
    } catch (error) {
      console.error('Error loading service types:', error);
    }
  }, []);

  // Load deposits with routes when depot management tab is active
  useEffect(() => {
    if (activeTab === 'depot-management') {
      loadDepositsWithRoutes();
      loadServiceTypes();
    }
  }, [activeTab, loadDepositsWithRoutes, loadServiceTypes]);

  // Deposit handlers
  const handleCloseDepositModal = useCallback(() => {
    setShowDepositModal(false);
  }, []);

  const handleSaveDeposit = useCallback(async (depositData: { depositName: string; description?: string; customerId?: number }) => {
    try {
      await createDeposit(depositData);
      if (activeTab === 'depot-management') {
        await loadDepositsWithRoutes();
      }
      setShowDepositModal(false);
    } catch (error) {
      console.error('Error creating deposit:', error);
      alert(`Error creating deposit: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [activeTab, loadDepositsWithRoutes]);

  const _handleEditDeposit = useCallback((deposit: DepositWithLoopsAndRoutesDTO) => {
    setSelectedDeposit({
      depositId: deposit.depositId,
      depositName: deposit.depositName,
      description: undefined,
      customerId: undefined,
      createdBy: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    });
    setShowDepositEditModal(true);
  }, []);

  const _handleDeleteDeposit = useCallback(async (_deposit: DepositWithLoopsAndRoutesDTO) => {
    // Handled in DepotManagementTab
  }, []);

  // Loop handlers
  const _handleEditLoop = useCallback((loop: LoopInDepositDTO, depositId: number) => {
    // Convert LoopInDepositDTO to the format expected by LoopModal
    setSelectedLoop({
      loopId: loop.loopId,
      loop_name: loop.loop_name,
      loopName: loop.loop_name, // Map snake_case to camelCase for the modal
      description: loop.description,
      depositId: depositId,
    });
    setSelectedDepositId(depositId);
    setShowLoopModal(true);
  }, []);

  const _handleDeleteLoop = useCallback(async (loop: LoopInDepositDTO, _depositId: number) => {
    if (confirm(`Are you sure you want to delete loop "${loop.loop_name}"?`)) {
      try {
        await deleteLoop(loop.loopId);
        await loadDepositsWithRoutes();
      } catch (error) {
        console.error('Error deleting loop:', error);
        alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete loop'}`);
      }
    }
  }, [loadDepositsWithRoutes]);

  // Service Type handlers
  const _handleEditServiceType = useCallback((serviceType: ServiceTypeDTO, _depositId: number) => {
    setSelectedServiceType(serviceType);
    setSelectedDepositId(_depositId);
    setDefaultIsAdhocCategory(false); // Not used when editing, but set for consistency
    setShowServiceTypeModal(true);
  }, []);

  const _handleDeleteServiceType = useCallback(async (serviceType: ServiceTypeDTO, _depositId: number) => {
    if (confirm(`Are you sure you want to delete service type "${serviceType.name}"?`)) {
      try {
        await deleteServiceType(serviceType.serviceTypeId);
        await loadServiceTypes();
      } catch (error) {
        console.error('Error deleting service type:', error);
        alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete service type'}`);
      }
    }
  }, [loadServiceTypes]);

  // Route handlers (for Depot Management)
  const handleEditRoute = useCallback((route: RouteInDepositDTO, depositId: number, loopId?: number, serviceTypeId?: number) => {
    setSelectedRoute(route);
    setSelectedDepositId(depositId);
    setSelectedLoopId(loopId);
    // If serviceTypeId is provided, ensure route has it
    if (serviceTypeId && route) {
      setSelectedRoute({ ...route, serviceTypeId: serviceTypeId });
    }
    setShowRouteModal(true);
  }, []);

  const handleDeleteRoute = useCallback(async (route: RouteInDepositDTO, _depositId: number) => {
    if (!route.routeId) {
      alert('Route ID is missing');
      return;
    }
    
    if (confirm(`Are you sure you want to remove the route "${route.routeName || `Route ${route.routeId}`}"?`)) {
      try {
        const { deleteRoute } = await import('@/lib/serviceTypes');
        await deleteRoute(route.routeId);
        await loadDepositsWithRoutes();
        await loadServiceTypes();
      } catch (error) {
        console.error('Error deleting route:', error);
        alert(`Error: ${error instanceof Error ? error.message : 'Failed to remove route'}`);
      }
    }
  }, [loadDepositsWithRoutes, loadServiceTypes]);

  const handleViewRoute = useCallback((route: RouteInDepositDTO, depositName?: string) => {
    setSelectedRouteForView({ route, depositName });
    setShowRouteViewModal(true);
  }, []);

  // Route handlers (for BA Costs Centers)
  const handleNewRouteBA = useCallback(() => {
    setSelectedRouteForEdit(null);
    setSelectedDepositId(undefined);
    setSelectedLoopId(undefined);
    setShowRouteModalBA(true);
  }, []);

  const handleEditRouteBA = useCallback((route: Route) => {
    setSelectedRouteForEdit(route);
    setSelectedDepositId(route.depositId);
    setSelectedLoopId(undefined);
    setShowRouteModalBA(true);
  }, []);

  const handleDeleteRouteBA = useCallback(async (route: Route) => {
    if (!route.routeId) {
      alert('Route ID is missing');
      return;
    }
    
    if (confirm(`Are you sure you want to remove the route "${route.routeName || `Route ${route.routeId}`}"?`)) {
      try {
        const { deleteRoute } = await import('@/lib/api/routes');
        await deleteRoute(route.routeId);
        // Trigger reload by updating key
        setRoutesReloadKey(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting route:', error);
        alert(`Error: ${error instanceof Error ? error.message : 'Failed to remove route'}`);
      }
    }
  }, []);

  // Ad-Hoc Services handlers (nova tabela adhoc_services)
  const handleNewAdHocServiceType = useCallback(() => {
    setSelectedAdhocService(null);
    setShowAdhocServiceModal(true);
  }, []);

  const handleEditAdhocService = useCallback((adhocService: AdhocService) => {
    setSelectedAdhocService(adhocService);
    setShowAdhocServiceModal(true);
  }, []);

  const handleSaveAdhocService = useCallback(
    async (data: AdhocServiceCreateDTO | AdhocServiceUpdateDTO, id?: number) => {
      if (id != null) {
        await updateAdhocService(id, data as AdhocServiceUpdateDTO);
      } else {
        await createAdhocService(data as AdhocServiceCreateDTO);
      }
      setAdhocReloadKey(prev => prev + 1);
    },
    []
  );

  const _handleEditAdHocServiceType = useCallback((serviceType: ServiceTypeDTO) => {
    setSelectedServiceType(serviceType);
    setDefaultIsAdhocCategory(true); // Not used when editing, but set for consistency
    setShowServiceTypeModal(true);
  }, []);

  const _handleDeleteAdHocServiceType = useCallback(async (_serviceType: ServiceTypeDTO) => {
    // Handled in AdHocServicesTab
  }, []);

  // Loop handlers
  const handleSaveLoop = useCallback(async (loopData: { loopName: string; depositId: number; description?: string; customerId?: number; active?: boolean; isAdhocCategory?: boolean }) => {
    try {
      // Map camelCase loopName to snake_case loop_name for API compatibility
      const payload = {
        ...loopData,
        loop_name: loopData.loopName
      };

      if (selectedLoop?.loopId) {
        await updateLoop(selectedLoop.loopId, payload);
      } else {
        await createLoop(payload);
      }
      await loadDepositsWithRoutes();
      setShowLoopModal(false);
      setSelectedLoop(null);
      setSelectedDepositId(undefined);
    } catch (error) {
      console.error('Error saving loop:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save loop'}`);
      throw error;
    }
  }, [selectedLoop, loadDepositsWithRoutes]);

  // Export handler - individual exports for each tab
  type ExportDataRow = Record<string, string | number | boolean | null>;
  const handleExport = useCallback(async (_format: ExportFormat): Promise<ExportDataRow[] | Blob | null> => {
    try {
      let data: ExportDataRow[] = [];

      switch (activeTab) {
        case 'depot-management':
          // Export only deposits (individual, not aggregated)
          const deposits = await fetchDeposits();
          data = deposits.map(deposit => ({
            depositId: deposit.depositId || 0,
            depositName: deposit.depositName || '',
            description: deposit.description || '',
            customerId: deposit.customerId || null,
            createdBy: deposit.createdBy || null,
            createdAt: deposit.createdAt || null,
            updatedAt: deposit.updatedAt || null,
          })).filter(row => row.depositId > 0); // Remove invalid entries
          break;
        case 'ba-costs-centers':
          // Export only routes (individual)
          const routes = await fetchRoutes();
          data = routes.map(route => {
            const exportRow: ExportDataRow = {
              routeId: route.routeId || 0,
              routeName: route.routeName || '',
              active: route.active ?? false,
              customerId: route.customerId || null,
              depositId: route.depositId || null,
            };
            // Only include serviceTypeId if it's a valid positive integer
            if (route.serviceTypeId != null && Number.isInteger(route.serviceTypeId) && route.serviceTypeId > 0) {
              exportRow.serviceTypeId = route.serviceTypeId;
            }
            // Only include loopId if it exists and is a valid positive integer
            const routeWithLoop = route as Route & { loopId?: number };
            if (routeWithLoop.loopId != null && Number.isInteger(routeWithLoop.loopId) && routeWithLoop.loopId > 0) {
              exportRow.loopId = routeWithLoop.loopId;
            }
            return exportRow;
          }).filter(row => (row.routeId as number) > 0); // Remove invalid entries
          break;
        case 'ad-hoc-services':
          // Export only adhoc service types (individual)
          const adhocServiceTypes = await fetchAdhocServiceTypes();
          data = adhocServiceTypes.map(st => ({
            serviceTypeId: st.serviceTypeId || 0,
            name: st.name || '',
            description: st.description || '',
            depositId: st.depositId || null,
            active: st.active ?? true,
            createBy: st.createBy || null,
            createdAt: st.createdAt || null,
            updatedAt: st.updatedAt || null,
            servicePartnerId: st.servicePartnerId || null,
          })).filter(row => (row.serviceTypeId as number) > 0);
          break;
        case 'service-partner':
          return [];
        default:
          return [];
      }

      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }, [activeTab]);


  const depotExportButton = (
    <ExportButton
      onExport={handleExport}
      filename={`depot-management-${new Date().toISOString().split('T')[0]}`}
      className={contractManagementStyles.exportButton}
      variant="outline"
      label="Export"
      showOnlyExcelAndPdf={true}
    />
  );
  const baCostsExportButton = (
    <ExportButton
      onExport={handleExport}
      filename={`ba-costs-centers-${new Date().toISOString().split('T')[0]}`}
      className={contractManagementStyles.exportButton}
      variant="outline"
      label="Export"
      showOnlyExcelAndPdf={true}
    />
  );
  const adHocExportButton = (
    <ExportButton
      onExport={handleExport}
      filename={`ad-hoc-services-${new Date().toISOString().split('T')[0]}`}
      className={contractManagementStyles.exportButton}
      variant="outline"
      label="Export"
      showOnlyExcelAndPdf={true}
    />
  );
  const servicePartnerExportButton = (
    <ExportButton
      onExport={handleExport}
      filename={`service-partner-${new Date().toISOString().split('T')[0]}`}
      className={contractManagementStyles.exportButton}
      variant="outline"
      label="Export"
      showOnlyExcelAndPdf={true}
    />
  );

  const tabBodyProps = {
    tabValue: activeTab,
    depotProps: {
      serviceTypesByDeposit,
      routesByServiceType,
      onViewRoute: handleViewRoute,
      onEditRoute: handleEditRoute,
      onDeleteRoute: handleDeleteRoute,
      depositsWithLoops,
      isLoadingDepositsWithRoutes: isLoadingDepositsWithRoutes,
      error,
      reloadDepositsWithRoutes: loadDepositsWithRoutes,
      reloadServiceTypes: loadServiceTypes,
      exportButton: depotExportButton,
      servicePartners,
    },
    baCostsProps: {
      key: routesReloadKey,
      onNewRoute: handleNewRouteBA,
      onEditRoute: handleEditRouteBA,
      onDeleteRoute: handleDeleteRouteBA,
      exportButton: baCostsExportButton,
    },
    adHocProps: {
      key: adhocReloadKey,
      onNewServiceType: handleNewAdHocServiceType,
      onEditAdhocService: handleEditAdhocService,
      exportButton: adHocExportButton,
    },
    servicePartnerProps: {
      exportButton: servicePartnerExportButton,
    },
  };

  return (
    <NavbarWrapper>
      <BootstrapLoader />
      <DgpPageFrame className={contractManagementStyles.pageContainer}>
        <div id="main-content" className={contractManagementStyles.mainContent}>
          {/* Desktop */}
          <main className={contractManagementStyles.desktopMain}>
            <RoutesHeader userFullName={userFullName} currentDate={currentDate} />

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContractManagementTabValue)} className={contractManagementStyles.tabsContainer}>
              <div className={contractManagementStyles.tabsBorder}>
                <TabsList className={contractManagementStyles.tabsList}>
                  {TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={contractManagementStyles.tabsTrigger}
                    >
                      <i className={`${contractManagementStyles.tabsTriggerIcon} ${tab.icon}`} aria-hidden />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

            </Tabs>
          </main>

          {/* Mobile */}
          <MobilePageShell
            title="Contract Management"
            subtitle={currentDate}
            className="pt-4"
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContractManagementTabValue)} className="w-full">
              <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2 shadow-sm">
                <TabsList className="h-auto w-full flex flex-nowrap gap-1 overflow-x-auto rounded-lg bg-transparent p-0 border-0">
                  {TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex-shrink-0 px-3 py-2 text-xs font-medium rounded-md data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                      title={tab.label}
                    >
                      <i className={`bi ${tab.icon} me-1`} aria-hidden />
                      {tab.shortLabel}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          </MobilePageShell>

          {/* Shared tab body — rendered once for both desktop and mobile to avoid duplicate fetches */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 sm:p-6 shadow-sm md:mt-0 mt-3 md:mx-0 mx-3">
            <ContractManagementTabBody {...tabBodyProps} tabValue={activeTab} />
          </div>
        </div>

        <Suspense fallback={null}>
          <CloseSidebarOnAnyModalOpen
            showDepositModal={showDepositModal}
            showDepositEditModal={showDepositEditModal}
            showLoopModal={showLoopModal}
            showRouteModal={showRouteModal}
            showRouteViewModal={showRouteViewModal}
            showRouteModalBA={showRouteModalBA}
            showServiceTypeModal={showServiceTypeModal}
          />

          <DepositModal
            show={showDepositModal}
            onClose={handleCloseDepositModal}
            onSave={handleSaveDeposit}
          />

          <DepositEditModal
            show={showDepositEditModal}
            onClose={() => {
              setShowDepositEditModal(false);
              setSelectedDeposit(null);
            }}
            onSave={async (updatedDeposit: Deposit) => {
              await updateDeposit(updatedDeposit.depositId, updatedDeposit);
              if (activeTab === 'depot-management') {
                await loadDepositsWithRoutes();
              }
              setShowDepositEditModal(false);
              setSelectedDeposit(null);
            }}
            deposit={selectedDeposit}
          />

          <LoopModal
            show={showLoopModal}
            onClose={() => {
              setShowLoopModal(false);
              setSelectedLoop(null);
              setSelectedDepositId(undefined);
            }}
            onSave={handleSaveLoop}
            loop={selectedLoop}
            depositId={selectedDepositId}
          />

          <RouteModal
            show={showRouteModal}
            onClose={() => {
              setShowRouteModal(false);
              setSelectedRoute(null);
              setSelectedDepositId(undefined);
              setSelectedLoopId(undefined);
            }}
            onSave={async (_route: RouteInDepositDTO) => {
              if (activeTab === 'depot-management') {
                await loadDepositsWithRoutes();
                await loadServiceTypes(); // Reload to get updated routes by service type
              }
              setShowRouteModal(false);
              setSelectedRoute(null);
              setSelectedDepositId(undefined);
              setSelectedLoopId(undefined);
            }}
            route={selectedRoute}
            depositId={selectedDepositId}
            loopId={selectedLoopId}
            customerId={undefined}
          />

          <RouteViewModal
            show={showRouteViewModal}
            onClose={() => {
              setShowRouteViewModal(false);
              setSelectedRouteForView(null);
            }}
            route={selectedRouteForView?.route || null}
            depositName={selectedRouteForView?.depositName}
          />

          <RouteModal
            show={showRouteModalBA}
            onClose={() => {
              setShowRouteModalBA(false);
              setSelectedRouteForEdit(null);
              setSelectedDepositId(undefined);
              setSelectedLoopId(undefined);
            }}
            onSave={async (_route: RouteInDepositDTO) => {
              try {
                setShowRouteModalBA(false);
                setSelectedRouteForEdit(null);
                setSelectedDepositId(undefined);
                setSelectedLoopId(undefined);
                // Trigger reload by updating key
                setRoutesReloadKey(prev => prev + 1);
              } catch (error) {
                console.error('Error in onSave:', error);
                throw error;
              }
            }}
            customUpdateRoute={async (routeId: number, routeData: Partial<RouteInDepositDTO>) => {
              // Use updateRoute from lib/routes for BA Costs Centers
              const { updateRoute } = await import('@/lib/api/routes');
              const updated = await updateRoute(routeId, routeData);
              // Convert Route to RouteInDepositDTO
              return {
                routeId: updated.routeId ?? routeId,
                routeName: updated.routeName ?? '',
                active: updated.active ?? true,
                customerId: updated.customerId ?? 0,
                depositId: updated.depositId ?? 0,
                serviceTypeId: updated.serviceTypeId,
                servicePartnerId: updated.servicePartnerId,
              } as RouteInDepositDTO;
            }}
            route={
              selectedRouteForEdit && typeof selectedRouteForEdit.routeId === 'number'
                ? {
                    routeId: selectedRouteForEdit.routeId,
                    routeName: selectedRouteForEdit.routeName ?? '',
                    active: selectedRouteForEdit.active ?? true,
                    customerId: selectedRouteForEdit.customerId ?? 0,
                    depositId: selectedRouteForEdit.depositId ?? selectedDepositId ?? 0,
                    serviceTypeId: selectedRouteForEdit.serviceTypeId,
                    servicePartnerId: selectedRouteForEdit.servicePartnerId,
                  }
                : null
            }
            depositId={selectedDepositId}
            loopId={selectedLoopId}
            customerId={undefined}
            showServicePartner
          />

          <ServiceTypeModal
            show={showServiceTypeModal}
            onClose={() => {
              setShowServiceTypeModal(false);
              setSelectedServiceType(null);
              setSelectedDepositId(undefined);
            }}
            onSave={async (serviceTypeData: Omit<ServiceTypeDTO, 'serviceTypeId'>) => {
              try {
                if (selectedServiceType?.serviceTypeId) {
                  // Edit mode - preserve depositId if editing from deposit context
                  const dataToSave = selectedDepositId 
                    ? { ...serviceTypeData, depositId: selectedDepositId }
                    : serviceTypeData;
                  await updateServiceType(selectedServiceType.serviceTypeId, dataToSave);
                } else {
                  // Create mode - use depositId from context if available
                  const dataToSave = selectedDepositId 
                    ? { ...serviceTypeData, depositId: selectedDepositId }
                    : serviceTypeData;
                  await createServiceType(dataToSave);
                }
                await loadServiceTypes();
                setAdhocReloadKey(prev => prev + 1);
                setShowServiceTypeModal(false);
                setSelectedServiceType(null);
                setSelectedDepositId(undefined);
              } catch (error) {
                console.error('Error saving service type:', error);
                alert(`Error: ${error instanceof Error ? error.message : 'Failed to save service type'}`);
                throw error;
              }
            }}
            serviceType={selectedServiceType}
            depositId={selectedDepositId}
            defaultIsAdhoc={defaultIsAdhocCategory}
          />

          <AdhocServiceModal
            show={showAdhocServiceModal}
            onClose={() => {
              setShowAdhocServiceModal(false);
              setSelectedAdhocService(null);
            }}
            onSave={async (data, id) => {
              try {
                await handleSaveAdhocService(data, id);
                setShowAdhocServiceModal(false);
                setSelectedAdhocService(null);
              } catch (error) {
                console.error('Error saving adhoc service:', error);
                alert(`Error: ${error instanceof Error ? error.message : 'Failed to save adhoc service'}`);
                throw error;
              }
            }}
            adhocService={selectedAdhocService}
          />
        </Suspense>
      </DgpPageFrame>
    </NavbarWrapper>
  );
};

export default RoutesManagement;

