'use client';

import React from 'react';
import { useRoutesBA } from '../hooks/useRoutesBA';
import { useNameLookups } from '../hooks/useNameLookups';
import { FiltersPanel } from './FiltersPanel';
import { SearchInput } from './SearchInput';
import { StatusFilter } from './StatusFilter';
import { RouteCard } from './RouteCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import type { Route } from '@/lib/api/routes';

interface BACostsCentersTabProps {
  onNewRoute: () => void;
  onEditRoute?: (route: Route) => void;
  onDeleteRoute?: (route: Route) => void;
  onRouteSaved?: () => void;
  exportButton?: React.ReactNode;
}

export const BACostsCentersTab: React.FC<BACostsCentersTabProps> = ({
  onNewRoute,
  onEditRoute: _onEditRoute,
  onDeleteRoute: _onDeleteRoute,
  onRouteSaved: _onRouteSaved,
  exportButton,
}) => {
  const { 
    filteredRoutes, 
    isLoading, 
    error, 
    filter, 
    setFilter,
  } = useRoutesBA();

  const { depositNameById, serviceTypeNameById, servicePartnerNameById, servicePartners } = useNameLookups();

  // Component will reload when key changes in parent

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        {exportButton}
        <button
          onClick={onNewRoute}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors text-sm"
        >
          <i className="bi bi-plus-lg text-sm"></i>
          Add Route
        </button>
      </div>

      {/* API Error Message */}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
        {/* Control column */}
        <aside className="space-y-4">
          <FiltersPanel onClear={() => setFilter({ search: '', active: 'all', servicePartnerId: 'all' })}>
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ ...filter, search: value })}
              placeholder="Search routes..."
            />
            <StatusFilter
              value={filter.active}
              onChange={(value) => setFilter({ ...filter, active: value })}
            />
            <div className="space-y-1">
              <label htmlFor="ba-service-partner-filter" className="text-xs font-medium text-slate-600">
                Service Partner
              </label>
              <select
                id="ba-service-partner-filter"
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filter.servicePartnerId === 'all' ? 'all' : String(filter.servicePartnerId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilter({
                    ...filter,
                    servicePartnerId: v === 'all' ? 'all' : Number(v),
                  });
                }}
              >
                <option value="all">All service partners</option>
                {servicePartners.map((sp) => (
                  <option key={sp.servicePartnerId} value={sp.servicePartnerId}>
                    {sp.partnerName}
                  </option>
                ))}
              </select>
            </div>
          </FiltersPanel>
        </aside>

        {/* Content */}
        <section className="space-y-4">
          {isLoading ? (
            <LoadingSpinner message="Loading routes..." />
          ) : filteredRoutes.length === 0 ? (
            <EmptyState
              icon="🚚"
              title="No routes found"
              subtitle="Try adjusting the filters or creating a new route."
            />
          ) : (
            <div className="space-y-1.5">
              {filteredRoutes.map((route) => (
                <RouteCard
                  key={route.routeId}
                  route={route}
                  depositName={route.depositId != null ? depositNameById.get(Number(route.depositId)) : undefined}
                  serviceTypeName={route.serviceTypeId != null ? serviceTypeNameById.get(Number(route.serviceTypeId)) : undefined}
                  servicePartnerName={route.servicePartnerId != null ? servicePartnerNameById.get(Number(route.servicePartnerId)) : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};


