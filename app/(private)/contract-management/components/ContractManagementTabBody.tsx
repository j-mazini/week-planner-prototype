'use client';

import React from 'react';
import { lazy, Suspense } from 'react';
import type { DepositWithLoopsAndRoutesDTO, RouteInDepositDTO, ServiceTypeDTO } from '@/lib/serviceTypes';
import type { RouteByDepositDTO } from '@/lib/api/routes';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';
import { TableLoadingSkeleton } from '@/app/(private)/components/PrivateRouteLoading';

const DepotManagementTab = lazy(() =>
  import('./DepotManagementTab').then((m) => ({ default: m.DepotManagementTab }))
);
const BACostsCentersTab = lazy(() =>
  import('./BACostsCentersTab').then((m) => ({ default: m.BACostsCentersTab }))
);
const AdHocServicesTab = lazy(() =>
  import('./AdhocServiceConfigTab').then((m) => ({ default: m.AdhocServiceConfigTab }))
);
const ServicePartnerTab = lazy(() =>
  import('./ServicePartnerTab').then((m) => ({ default: m.ServicePartnerTab }))
);

export type ContractManagementTabValue = 'depot-management' | 'ba-costs-centers' | 'ad-hoc-services' | 'service-partner';

export interface DepotManagementTabProps {
  serviceTypesByDeposit: Map<number, ServiceTypeDTO[]>;
  routesByServiceType: Map<number, RouteInDepositDTO[]>;
  onViewRoute: (route: RouteByDepositDTO | RouteInDepositDTO, depositName?: string) => void;
  onEditRoute: (route: RouteInDepositDTO, depositId: number, loopId?: number, serviceTypeId?: number) => void;
  onDeleteRoute: (route: RouteInDepositDTO, depositId: number) => void;
  depositsWithLoops: DepositWithLoopsAndRoutesDTO[];
  isLoadingDepositsWithRoutes: boolean;
  error: string | null;
  reloadDepositsWithRoutes: () => Promise<void>;
  reloadServiceTypes: () => Promise<void>;
  exportButton: React.ReactNode;
  servicePartners: ServicePartnerDTO[];
}

export interface BACostsCentersTabProps {
  key: number;
  onNewRoute: () => void;
  onEditRoute: (route: import('@/lib/api/routes').Route) => void;
  onDeleteRoute: (route: import('@/lib/api/routes').Route) => void;
  exportButton: React.ReactNode;
}

export interface AdHocServicesTabProps {
  key?: number;
  onNewServiceType: () => void;
  onEditAdhocService?: (adhocService: import('@/lib/types-config-api').AdhocService) => void;
  exportButton: React.ReactNode;
}

export interface ServicePartnerTabProps {
  exportButton: React.ReactNode;
}

export interface ContractManagementTabBodyProps {
  tabValue: ContractManagementTabValue;
  depotProps: DepotManagementTabProps;
  baCostsProps: BACostsCentersTabProps;
  adHocProps: AdHocServicesTabProps;
  servicePartnerProps: ServicePartnerTabProps;
}

export function ContractManagementTabBody({
  tabValue,
  depotProps,
  baCostsProps,
  adHocProps,
  servicePartnerProps,
}: ContractManagementTabBodyProps) {
  switch (tabValue) {
    case 'depot-management':
      return (
        <Suspense fallback={<TableLoadingSkeleton />}>
          <DepotManagementTab
            serviceTypesByDeposit={depotProps.serviceTypesByDeposit}
            routesByServiceType={depotProps.routesByServiceType}
            onViewRoute={depotProps.onViewRoute}
            onEditRoute={depotProps.onEditRoute}
            onDeleteRoute={depotProps.onDeleteRoute}
            depositsWithLoops={depotProps.depositsWithLoops}
            isLoadingDepositsWithRoutes={depotProps.isLoadingDepositsWithRoutes}
            error={depotProps.error}
            reloadDepositsWithRoutes={depotProps.reloadDepositsWithRoutes}
            reloadServiceTypes={depotProps.reloadServiceTypes}
            exportButton={depotProps.exportButton}
            servicePartners={depotProps.servicePartners}
          />
        </Suspense>
      );
    case 'ba-costs-centers':
      return (
        <Suspense fallback={<TableLoadingSkeleton />}>
          <BACostsCentersTab
            key={baCostsProps.key}
            onNewRoute={baCostsProps.onNewRoute}
            onEditRoute={baCostsProps.onEditRoute}
            onDeleteRoute={baCostsProps.onDeleteRoute}
            exportButton={baCostsProps.exportButton}
          />
        </Suspense>
      );
    case 'ad-hoc-services':
      return (
        <Suspense fallback={<TableLoadingSkeleton />}>
          <AdHocServicesTab
            key={adHocProps.key}
            onNewAdhocService={adHocProps.onNewServiceType}
            onEditAdhocService={adHocProps.onEditAdhocService ?? (() => undefined)}
          />
        </Suspense>
      );
    case 'service-partner':
      return (
        <Suspense fallback={<TableLoadingSkeleton />}>
          <ServicePartnerTab
            exportButton={servicePartnerProps.exportButton}
          />
        </Suspense>
      );
    default:
      return null;
  }
}
