'use client';

import { lazy, Suspense } from 'react';
import type { VendorType, UserType, CostModel, VehicleType, ManagementTeamFunction, AdhocCategory } from '@/lib/types-config-api';

const VendorTypeTab = lazy(() =>
  import('../../contract-management/components/VendorTypeTab').then((m) => ({ default: m.VendorTypeTab }))
);
const UserTypeTab = lazy(() =>
  import('../../contract-management/components/UserTypeTab').then((m) => ({ default: m.UserTypeTab }))
);
const CostModelTab = lazy(() =>
  import('../../contract-management/components/CostModelTab').then((m) => ({ default: m.CostModelTab }))
);
const VehicleTypeTab = lazy(() =>
  import('../../contract-management/components/VehicleTypeTab').then((m) => ({ default: m.VehicleTypeTab }))
);
const ManagementTeamFunctionTab = lazy(() =>
  import('../../contract-management/components/ManagementTeamFunctionTab').then((m) => ({ default: m.ManagementTeamFunctionTab }))
);
const AdhocCategoryTab = lazy(() =>
  import('../../contract-management/components/AdhocCategoryTab').then((m) => ({ default: m.AdhocCategoryTab }))
);

export type AssetsTabValue =
  | 'vendor-types'
  | 'user-types'
  | 'cost-models'
  | 'vehicle-types'
  | 'management_and_support_team'
  | 'adhoc-categories';

export interface AssetsTabBodyHandlers {
  onNewVendorType: () => void;
  onEditVendorType: (v: VendorType) => void;
  onNewUserType: () => void;
  onEditUserType: (v: UserType) => void;
  onEditCostModel: (v: CostModel) => void;
  onNewVehicleType: () => void;
  onEditVehicleType: (v: VehicleType) => void;
  onNewManagementTeamFunction: () => void;
  onEditManagementTeamFunction: (v: ManagementTeamFunction) => void;
  onNewAdhocCategory: () => void;
  onEditAdhocCategory: (v: AdhocCategory) => void;
}

function TabFallback() {
  return (
    <div className="flex items-center justify-center py-12 text-slate-500">
      <span className="animate-pulse">Loading...</span>
    </div>
  );
}

interface AssetsTabBodyProps {
  tabValue: AssetsTabValue;
  refreshKey: number;
  handlers: AssetsTabBodyHandlers;
}

export function AssetsTabBody({ tabValue, refreshKey, handlers }: AssetsTabBodyProps) {
  switch (tabValue) {
    case 'vendor-types':
      return (
        <Suspense fallback={<TabFallback />}>
          <VendorTypeTab
            key={`vendor-types-${refreshKey}`}
            onNewVendorType={handlers.onNewVendorType}
            onEditVendorType={handlers.onEditVendorType}
          />
        </Suspense>
      );
    case 'user-types':
      return (
        <Suspense fallback={<TabFallback />}>
          <UserTypeTab
            key={`user-types-${refreshKey}`}
            onNewUserType={handlers.onNewUserType}
            onEditUserType={handlers.onEditUserType}
          />
        </Suspense>
      );
    case 'cost-models':
      return (
        <Suspense fallback={<TabFallback />}>
          <CostModelTab
            key={`cost-models-${refreshKey}`}
            showAddButton={false}
            onEditCostModel={handlers.onEditCostModel}
          />
        </Suspense>
      );
    case 'vehicle-types':
      return (
        <Suspense fallback={<TabFallback />}>
          <VehicleTypeTab
            key={`vehicle-types-${refreshKey}`}
            onNewVehicleType={handlers.onNewVehicleType}
            onEditVehicleType={handlers.onEditVehicleType}
          />
        </Suspense>
      );
    case 'management_and_support_team':
      return (
        <Suspense fallback={<TabFallback />}>
          <ManagementTeamFunctionTab
            key={`management_and_support_team-${refreshKey}`}
            onNew={handlers.onNewManagementTeamFunction}
            onEdit={handlers.onEditManagementTeamFunction}
          />
        </Suspense>
      );
    case 'adhoc-categories':
      return (
        <Suspense fallback={<TabFallback />}>
          <AdhocCategoryTab
            key={`adhoc-categories-${refreshKey}`}
            onNewAdhocCategory={handlers.onNewAdhocCategory}
            onEditAdhocCategory={handlers.onEditAdhocCategory}
          />
        </Suspense>
      );
    default:
      return null;
  }
}
