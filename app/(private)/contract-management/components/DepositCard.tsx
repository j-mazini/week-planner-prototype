'use client';

import { memo, useMemo } from 'react';
import type { DepositWithLoopsAndRoutesDTO, RouteInDepositDTO, ServiceTypeDTO } from '@/lib/serviceTypes';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';
import { ServicePartnerBadge } from '@/components/service-partner-badge';

interface DepositCardProps {
  deposit: DepositWithLoopsAndRoutesDTO;
  isExpanded: boolean;
  onToggle: () => void;
  serviceTypes: ServiceTypeDTO[];
  routesByServiceType: Map<number, RouteInDepositDTO[]>;
  onViewRoute: (route: RouteInDepositDTO) => void;
  onEditRoute?: (_route: RouteInDepositDTO, _depositId: number, _loopId?: number, _serviceTypeId?: number) => void;
  onDeleteRoute?: (_route: RouteInDepositDTO, _depositId: number) => void;
  expandedLoops: Set<string>;
  onToggleLoop: (loopKey: string) => void;
  expandedServiceTypes: Set<number>;
  onToggleServiceType: (serviceTypeId: number) => void;
  servicePartners: ServicePartnerDTO[];
}

export const DepositCard = memo<DepositCardProps>(({
  deposit,
  isExpanded,
  onToggle,
  serviceTypes,
  routesByServiceType,
  onViewRoute,
  onEditRoute: _onEditRoute,
  onDeleteRoute: _onDeleteRoute,
  expandedLoops,
  onToggleLoop,
  expandedServiceTypes,
  onToggleServiceType,
  servicePartners,
}) => {
  const servicePartnerMap = useMemo(() => {
    const map = new Map<number, string>();
    servicePartners.forEach(sp => {
      map.set(sp.servicePartnerId, sp.partnerName);
    });
    return map;
  }, [servicePartners]);

  const partnerName = useMemo(() => {
    if (!deposit.servicePartnerId) return null;
    const depositSpId = typeof deposit.servicePartnerId === 'string'
      ? parseInt(deposit.servicePartnerId, 10)
      : deposit.servicePartnerId;
    return servicePartnerMap.get(depositSpId) ?? null;
  }, [deposit.servicePartnerId, servicePartnerMap]);

  return (
    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-indigo-500 rounded-r-full" aria-hidden />
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-1.5 flex-1 min-w-0">
            <button
              onClick={onToggle}
              className="w-6 h-6 rounded-md border border-slate-200 bg-slate-50 grid place-items-center text-slate-800 transition hover:border-blue-200 hover:-translate-y-[1px] flex-shrink-0"
              aria-expanded={isExpanded}
              aria-label="Expand deposit"
            >
              <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} text-xs`} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {deposit.depositName || `Deposit ${deposit.depositId}`}
                </h3>
                {partnerName && (
                  <ServicePartnerBadge partnerName={partnerName} />
                )}
              </div>
              {partnerName && (
                <p className="text-xs text-slate-600 truncate">
                  {partnerName}
                </p>
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-2 mt-0.5 pt-1 border-t border-slate-200">
            {/* Service Types Section */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-slate-600">Service Types</span>
            </div>
            <div className="space-y-1 mb-3">
              {serviceTypes.length === 0 ? (
                <div className="text-[10px] text-slate-500 inline-flex items-center gap-1">
                  <i className="bi bi-tag text-[10px]" />
                  No service types registered.
                </div>
              ) : (
                serviceTypes.map((serviceType) => {
                  const isServiceTypeExpanded = expandedServiceTypes.has(serviceType.serviceTypeId);
                  
                  return (
                    <div
                      key={serviceType.serviceTypeId}
                      className="border border-indigo-200 rounded-md bg-indigo-50/30"
                    >
                      <div className="flex items-center justify-between gap-1.5 px-2 py-1.5">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleServiceType(serviceType.serviceTypeId);
                            }}
                            className="w-5 h-5 rounded border border-indigo-200 bg-white grid place-items-center text-indigo-700 transition hover:border-indigo-300 flex-shrink-0"
                            aria-expanded={isServiceTypeExpanded}
                            title="Toggle service type"
                          >
                            <i className={`bi bi-chevron-${isServiceTypeExpanded ? 'up' : 'down'} text-[10px]`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-800">
                                {serviceType.name || `Service Type ${serviceType.serviceTypeId}`}
                              </span>
                              {serviceType.active === false && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] font-semibold bg-rose-100 text-rose-700">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {serviceType.description && (
                              <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">{serviceType.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {isServiceTypeExpanded && (
                        <div className="px-2 pb-1.5 pt-1 border-t border-indigo-200 bg-white">
                          {serviceType.description && (
                            <p className="text-[10px] text-slate-600 mb-2">{serviceType.description}</p>
                          )}
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-semibold text-slate-600">Routes</span>
                          </div>
                          <div className="grid gap-1">
                            {(() => {
                              const routes = routesByServiceType.get(serviceType.serviceTypeId) || [];
                              return routes.length === 0 ? (
                                <div className="text-[9px] text-slate-500 inline-flex items-center gap-1">
                                  <i className="bi bi-signpost-2 text-[9px]" />
                                  No routes registered.
                                </div>
                              ) : (
                                routes.map((route) => {
                                  return (
                                    <div
                                      key={route.routeId}
                                      className={`flex items-center justify-between gap-2 px-1.5 py-1 rounded-md border transition hover:shadow-sm ${
                                        route.active
                                          ? 'border-emerald-200 bg-emerald-50/50'
                                          : 'border-rose-200 bg-rose-50/50'
                                      }`}
                                    >
                                      <div 
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={() => onViewRoute(route)}
                                      >
                                        <p className="mb-0 text-[10px] font-medium text-slate-800 truncate">
                                          {route.routeName || `Route ${route.routeId}`}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <span
                                          className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] font-semibold ${
                                            route.active
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : 'bg-rose-100 text-rose-700'
                                          }`}
                                        >
                                          {route.active ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Loops Section */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-slate-600">Loops</span>
            </div>
            <div className="space-y-1.5">
              {deposit.loops.length === 0 ? (
                <div className="text-[10px] text-slate-500 inline-flex items-center gap-1">
                  <i className="bi bi-diagram-3 text-[10px]" />
                  No loops registered.
                </div>
              ) : (
                deposit.loops.map((loop) => {
                  const loopKey = `${deposit.depositId}-${loop.loopId}`;
                  const isLoopExpanded = expandedLoops.has(loopKey);
                  
                  return (
                    <div
                      key={loop.loopId}
                      className="border border-slate-200 rounded-md bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between gap-1.5 px-2 py-1.5">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleLoop(loopKey);
                            }}
                            className="w-5 h-5 rounded border border-slate-200 bg-white grid place-items-center text-slate-700 transition hover:border-blue-200 flex-shrink-0"
                            aria-expanded={isLoopExpanded}
                            title="Toggle loop"
                          >
                            <i className={`bi bi-chevron-${isLoopExpanded ? 'up' : 'down'} text-[10px]`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-800">
                                {loop.loop_name || `Loop ${loop.loopId}`}
                              </span>
                              <span className="text-[9px] text-slate-500">
                                ({loop.routes.length} {loop.routes.length === 1 ? 'route' : 'routes'})
                              </span>
                            </div>
                            {loop.description && (
                              <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">{loop.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isLoopExpanded && (
                        <div className="px-2 pb-1.5 pt-1 border-t border-slate-200 bg-white">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-semibold text-slate-600">Routes</span>
                          </div>
                          <div className="grid gap-1">
                            {loop.routes.length === 0 ? (
                              <div className="text-[9px] text-slate-500 inline-flex items-center gap-1">
                                <i className="bi bi-signpost-2 text-[9px]" />
                                No routes registered.
                              </div>
                            ) : (
                              loop.routes.map((route) => {
                  return (
                    <div
                      key={route.routeId}
                      className={`flex items-center justify-between gap-2 px-1.5 py-1 rounded-md border transition hover:shadow-sm ${
                        route.active
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-rose-200 bg-rose-50/50'
                      }`}
                    >
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onViewRoute(route)}
                      >
                                      <p className="mb-0 text-[10px] font-medium text-slate-800 truncate">
                          {route.routeName || `Route ${route.routeId}`}
                        </p>
                      </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                                        className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] font-semibold ${
                            route.active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {route.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

DepositCard.displayName = 'DepositCard';


