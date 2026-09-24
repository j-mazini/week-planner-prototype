'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { DepositSelect } from './DepositSelect';
import { LoopFilter } from './LoopFilter';
import { RouteTypeFilter } from './RouteTypeFilter';
import { DepositCard } from './DepositCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import type { DepositWithLoopsAndRoutesDTO, RouteInDepositDTO, ServiceTypeDTO } from '@/lib/serviceTypes';
import type { RouteByDepositDTO } from '@/lib/api/routes';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';

interface DepotManagementTabProps {
  serviceTypesByDeposit: Map<number, ServiceTypeDTO[]>;
  routesByServiceType: Map<number, RouteInDepositDTO[]>;
  onViewRoute: (route: RouteByDepositDTO, depositName?: string) => void;
  onEditRoute?: (route: RouteInDepositDTO, depositId: number, loopId?: number, serviceTypeId?: number) => void;
  onDeleteRoute?: (route: RouteInDepositDTO, depositId: number) => void;
  depositsWithLoops: DepositWithLoopsAndRoutesDTO[];
  isLoadingDepositsWithRoutes: boolean;
  error: string | null;
  reloadDepositsWithRoutes: () => Promise<void>;
  reloadServiceTypes?: () => Promise<void>;
  exportButton?: React.ReactNode;
  servicePartners: ServicePartnerDTO[];
}

export const DepotManagementTab: React.FC<DepotManagementTabProps> = ({
  serviceTypesByDeposit,
  routesByServiceType,
  onViewRoute,
  onEditRoute,
  onDeleteRoute,
  depositsWithLoops,
  isLoadingDepositsWithRoutes,
  error,
  reloadDepositsWithRoutes: _reloadDepositsWithRoutes,
  reloadServiceTypes: _reloadServiceTypes,
  exportButton,
  servicePartners,
}) => {
  const [filter, setFilter] = useState({ search: '', loop: 'all', routeType: 'all', deposit: 'all' });
  const [expandedDeposits, setExpandedDeposits] = useState<Set<number>>(new Set());
  const [expandedLoops, setExpandedLoops] = useState<Set<string>>(new Set());
  const [expandedServiceTypes, setExpandedServiceTypes] = useState<Set<number>>(new Set());

  const availableDeposits = useMemo(
    () =>
      depositsWithLoops.map(dep => ({
        id: dep.depositId,
        name: dep.depositName || `Deposit ${dep.depositId}`,
      })),
    [depositsWithLoops]
  );

  const availableLoops = useMemo(() => {
    const loopsSet = new Set<string>();
    depositsWithLoops.forEach(dep => {
      dep.loops?.forEach(loop => {
        if (loop.loop_name) {
          loopsSet.add(loop.loop_name);
        }
      });
    });
    return Array.from(loopsSet).sort();
  }, [depositsWithLoops]);

  const toggleDeposit = useCallback((depositId: number) => {
    setExpandedDeposits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(depositId)) {
        newSet.delete(depositId);
      } else {
        newSet.add(depositId);
      }
      return newSet;
    });
  }, []);

  const toggleLoop = useCallback((loopKey: string) => {
    setExpandedLoops(prev => {
      const newSet = new Set(prev);
      if (newSet.has(loopKey)) {
        newSet.delete(loopKey);
      } else {
        newSet.add(loopKey);
      }
      return newSet;
    });
  }, []);

  const toggleServiceType = useCallback((serviceTypeId: number) => {
    setExpandedServiceTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceTypeId)) {
        newSet.delete(serviceTypeId);
      } else {
        newSet.add(serviceTypeId);
      }
      return newSet;
    });
  }, []);

  const filteredDeposits = useMemo(() => {
    let filtered = depositsWithLoops;

    if (filter.deposit !== 'all') {
      filtered = filtered.filter(dep => String(dep.depositId) === filter.deposit);
    }

    if (filter.loop !== 'all') {
      filtered = filtered.map(dep => ({
        ...dep,
        loops: dep.loops.filter(loop => loop.loop_name === filter.loop),
      })).filter(dep => dep.loops.length > 0);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(dep => {
        const nameMatch = (dep.depositName || '').toLowerCase().includes(searchLower);
        const idMatch = String(dep.depositId || '').toLowerCase().includes(searchLower);
        const loopMatch = dep.loops.some(loop => 
          (loop.loop_name || '').toLowerCase().includes(searchLower)
        );
        const routeMatch = dep.loops.some(loop => 
          loop.routes.some(route => 
            (route.routeName || '').toLowerCase().includes(searchLower) ||
            String(route.routeId || '').toLowerCase().includes(searchLower)
          )
        );
        return nameMatch || idMatch || loopMatch || routeMatch;
      }).map(dep => ({
        ...dep,
        loops: dep.loops.map(loop => ({
          ...loop,
          routes: loop.routes.filter(route => {
            const routeNameMatch = (route.routeName || '').toLowerCase().includes(filter.search.toLowerCase());
            const routeIdMatch = String(route.routeId || '').toLowerCase().includes(filter.search.toLowerCase());
            return routeNameMatch || routeIdMatch;
          }),
        })),
      }));
    }

    return filtered;
  }, [depositsWithLoops, filter]);

  return (
    <>
      {/* Action Buttons - Top */}
      <div className="flex flex-wrap gap-3 justify-end mb-4">
        {exportButton}
      </div>

      {/* API Error Message */}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        {/* Control column */}
        <aside className="space-y-4">
          <FiltersPanel onClear={() => setFilter({ search: '', loop: 'all', routeType: 'all', deposit: 'all' })}>
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search deposit or route"
            />
            <DepositSelect
              value={filter.deposit}
              onChange={(value) => setFilter({ ...filter, deposit: value })}
              deposits={availableDeposits}
            />
            <LoopFilter
              value={filter.loop}
              onChange={(value) => setFilter({ ...filter, loop: value })}
              loops={availableLoops}
            />
            <RouteTypeFilter
              value={filter.routeType}
              onChange={(value) => setFilter({ ...filter, routeType: value })}
            />
          </FiltersPanel>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {isLoadingDepositsWithRoutes ? (
            <LoadingSpinner message="Loading deposits..." />
          ) : filteredDeposits.length === 0 ? (
            <EmptyState
              title="No deposits found"
              subtitle="Try adjusting the filters or creating a new deposit."
            />
          ) : (
            <div className="space-y-1.5">
              {filteredDeposits.map((deposit) => (
                <DepositCard
                  key={deposit.depositId}
                  deposit={deposit}
                  isExpanded={expandedDeposits.has(deposit.depositId)}
                  onToggle={() => toggleDeposit(deposit.depositId)}
                  serviceTypes={serviceTypesByDeposit.get(deposit.depositId) || []}
                  routesByServiceType={routesByServiceType}
                  onViewRoute={(route) => {
                    // Convert RouteInDepositDTO to RouteByDepositDTO
                    const routeByDeposit: RouteByDepositDTO = {
                      routeId: route.routeId,
                      routeName: route.routeName,
                      active: route.active,
                      customerId: route.customerId,
                      depositId: route.depositId,
                      serviceTypeId: route.serviceTypeId || 0,
                    };
                    onViewRoute(routeByDeposit, deposit.depositName);
                  }}
                  onEditRoute={onEditRoute}
                  onDeleteRoute={onDeleteRoute}
                  expandedLoops={expandedLoops}
                  onToggleLoop={toggleLoop}
                  expandedServiceTypes={expandedServiceTypes}
                  onToggleServiceType={toggleServiceType}
                  servicePartners={servicePartners}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};


