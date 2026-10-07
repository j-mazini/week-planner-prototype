'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import NavbarWrapper from '@/components/navbar-wrapper';
import { BootstrapLoader } from '@/components/bootstrap-loader';
import { DgpPageFrame, MobilePageShell } from '@/app/(private)/components';
import { AssetsHeader } from './components/AssetsHeader';
import { AssetsTabBody, type AssetsTabValue, type AssetsTabBodyHandlers } from './components/AssetsTabBody';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSidebar } from '@/components/ui/sidebar';
import { useAssetsPage } from './hooks/useAssetsPage';

const VendorTypeModal = lazy(() =>
  import('../contract-management/components/Modals/VendorTypeModal').then((m) => ({ default: m.default }))
);
const UserTypeModal = lazy(() =>
  import('../contract-management/components/Modals/UserTypeModal').then((m) => ({ default: m.default }))
);
const CostModelModal = lazy(() =>
  import('../contract-management/components/Modals/CostModelModal').then((m) => ({ default: m.default }))
);
const VehicleTypeModal = lazy(() =>
  import('../contract-management/components/Modals/VehicleTypeModal').then((m) => ({ default: m.default }))
);
const ManagementTeamFunctionModal = lazy(() =>
  import('../contract-management/components/Modals/ManagementTeamFunctionModal').then((m) => ({ default: m.default }))
);
const AdhocCategoryModal = lazy(() =>
  import('../contract-management/components/Modals/AdhocCategoryModal').then((m) => ({ default: m.default }))
);

const TABS: { value: AssetsTabValue; label: string; shortLabel: string; icon: string }[] = [
  { value: 'vendor-types', label: 'Vendor Types', shortLabel: 'Vendor', icon: 'bi-shop' },
  { value: 'user-types', label: 'User Types', shortLabel: 'User', icon: 'bi-person-badge' },
  { value: 'cost-models', label: 'Cost Models', shortLabel: 'Cost', icon: 'bi-calculator' },
  { value: 'vehicle-types', label: 'Vehicle Types', shortLabel: 'Vehicle', icon: 'bi-truck' },
  { value: 'management_and_support_team', label: 'Management & Support Team', shortLabel: 'Team', icon: 'bi-people' },
  { value: 'adhoc-categories', label: 'Adhoc Categories', shortLabel: 'Categories', icon: 'bi-tags' },
];

function CloseSidebarOnAnyModalOpen({
  showVendorTypeModal,
  showUserTypeModal,
  showCostModelModal,
  showVehicleTypeModal,
  showManagementTeamFunctionModal,
  showAdhocCategoryModal,
}: {
  showVendorTypeModal: boolean;
  showUserTypeModal: boolean;
  showCostModelModal: boolean;
  showVehicleTypeModal: boolean;
  showManagementTeamFunctionModal: boolean;
  showAdhocCategoryModal: boolean;
}) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const anyOpen =
    showVendorTypeModal ||
    showUserTypeModal ||
    showCostModelModal ||
    showVehicleTypeModal ||
    showManagementTeamFunctionModal ||
    showAdhocCategoryModal;
  useEffect(() => {
    if (!anyOpen) return;
    if (isMobile) setOpenMobile(false);
    setOpen(false);
  }, [anyOpen, isMobile, setOpen, setOpenMobile]);
  return null;
}

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<AssetsTabValue>('vendor-types');
  const {
    currentDate,
    userFullName,
    refreshKey,
    showVendorTypeModal,
    showUserTypeModal,
    showCostModelModal,
    showVehicleTypeModal,
    selectedVendorType,
    selectedUserType,
    selectedCostModel,
    selectedVehicleType,
    setShowVendorTypeModal,
    setSelectedVendorType,
    setShowUserTypeModal,
    setSelectedUserType,
    setShowCostModelModal,
    setSelectedCostModel,
    setShowVehicleTypeModal,
    setSelectedVehicleType,
    setShowManagementTeamFunctionModal,
    setSelectedManagementTeamFunction,
    closeVendorType,
    closeUserType,
    closeCostModel,
    closeVehicleType,
    closeManagementTeamFunction,
    onSaveVendorType,
    onSaveUserType,
    onSaveCostModel,
    onSaveVehicleType,
    onSaveManagementTeamFunction,
    showManagementTeamFunctionModal,
    selectedManagementTeamFunction,
    showAdhocCategoryModal,
    setShowAdhocCategoryModal,
    selectedAdhocCategory,
    setSelectedAdhocCategory,
    closeAdhocCategory,
    onSaveAdhocCategory,
  } = useAssetsPage();

  const tabHandlers: AssetsTabBodyHandlers = {
    onNewVendorType: () => {
      setSelectedVendorType(null);
      setShowVendorTypeModal(true);
    },
    onEditVendorType: (v) => {
      setSelectedVendorType(v);
      setShowVendorTypeModal(true);
    },
    onNewUserType: () => {
      setSelectedUserType(null);
      setShowUserTypeModal(true);
    },
    onEditUserType: (v) => {
      setSelectedUserType(v);
      setShowUserTypeModal(true);
    },
    onEditCostModel: (v) => {
      setSelectedCostModel(v);
      setShowCostModelModal(true);
    },
    onNewVehicleType: () => {
      setSelectedVehicleType(null);
      setShowVehicleTypeModal(true);
    },
    onEditVehicleType: (v) => {
      setSelectedVehicleType(v);
      setShowVehicleTypeModal(true);
    },
    onNewManagementTeamFunction: () => {
      setSelectedManagementTeamFunction(null);
      setShowManagementTeamFunctionModal(true);
    },
    onEditManagementTeamFunction: (v) => {
      setSelectedManagementTeamFunction(v);
      setShowManagementTeamFunctionModal(true);
    },
    onNewAdhocCategory: () => {
      setSelectedAdhocCategory(null);
      setShowAdhocCategoryModal(true);
    },
    onEditAdhocCategory: (v) => {
      setSelectedAdhocCategory(v);
      setShowAdhocCategoryModal(true);
    },
  };

  return (
    <NavbarWrapper>
      <BootstrapLoader />
      <DgpPageFrame width="ultra" containerClassName="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Desktop */}
        <main className="hidden md:block space-y-6 page-stagger">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AssetsTabValue)} className="w-full">
            <AssetsHeader userFullName={userFullName} currentDate={currentDate} />

            <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-4 text-foreground shadow-md">
              <TabsList className="h-auto w-full flex flex-wrap justify-start gap-0 rounded-none border-0 bg-transparent p-0">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 text-xs sm:text-sm font-medium text-slate-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent hover:text-slate-900 transition-colors whitespace-nowrap min-w-0 flex-shrink-0"
                    title={tab.label}
                  >
                    <i className={`bi me-1.5 sm:me-2 flex-shrink-0 ${tab.icon}`} aria-hidden />
                    <span className="hidden lg:inline">{tab.label}</span>
                    <span className="lg:hidden">{tab.shortLabel}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 sm:p-6 shadow-sm">
                  <AssetsTabBody tabValue={tab.value} refreshKey={refreshKey} handlers={tabHandlers} />
                </div>
            </TabsContent>
            ))}
          </Tabs>
        </main>

        {/* Mobile */}
        <MobilePageShell
          title="Assets Management"
          subtitle={currentDate}
          className="pt-4"
        >
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AssetsTabValue)} className="w-full">
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

            <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm mt-3">
              <AssetsTabBody tabValue={activeTab} refreshKey={refreshKey} handlers={tabHandlers} />
              </div>
          </Tabs>
        </MobilePageShell>
      </DgpPageFrame>

      <Suspense fallback={null}>
        <CloseSidebarOnAnyModalOpen
          showVendorTypeModal={showVendorTypeModal}
          showUserTypeModal={showUserTypeModal}
          showCostModelModal={showCostModelModal}
          showVehicleTypeModal={showVehicleTypeModal}
          showManagementTeamFunctionModal={showManagementTeamFunctionModal}
          showAdhocCategoryModal={showAdhocCategoryModal}
        />

        <VendorTypeModal
          show={showVendorTypeModal}
          onClose={closeVendorType}
          onSave={onSaveVendorType}
          vendorType={selectedVendorType}
        />
        <UserTypeModal
          show={showUserTypeModal}
          onClose={closeUserType}
          onSave={onSaveUserType}
          userType={selectedUserType}
        />
        <CostModelModal
          show={showCostModelModal}
          onClose={closeCostModel}
          onSave={onSaveCostModel}
          costModel={selectedCostModel}
        />
        <VehicleTypeModal
          show={showVehicleTypeModal}
          onClose={closeVehicleType}
          onSave={onSaveVehicleType}
          vehicleType={selectedVehicleType}
        />
        <ManagementTeamFunctionModal
          show={showManagementTeamFunctionModal}
          onClose={closeManagementTeamFunction}
          onSave={onSaveManagementTeamFunction}
          item={selectedManagementTeamFunction}
        />
        <AdhocCategoryModal
          show={showAdhocCategoryModal}
          onClose={closeAdhocCategory}
          onSave={onSaveAdhocCategory}
          item={selectedAdhocCategory}
        />
      </Suspense>
    </NavbarWrapper>
  );
}
