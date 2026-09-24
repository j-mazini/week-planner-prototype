'use client';

import React, { memo } from 'react';
import type { Route } from '@/lib/api/routes';

interface RouteCardProps {
  route: Route;
  onEdit?: (route: Route) => void;
  onDelete?: (route: Route) => void;
  depositName?: string;
  serviceTypeName?: string;
  servicePartnerName?: string;
}

export const RouteCard = memo<RouteCardProps>(({
  route,
  onEdit,
  onDelete,
  depositName,
  serviceTypeName,
  servicePartnerName,
}) => {
  return (
    <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full ${
        route.active 
          ? 'bg-gradient-to-b from-emerald-600 to-emerald-500' 
          : 'bg-gradient-to-b from-rose-600 to-rose-500'
      }`} aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900">
              {route.routeName || `Route ${route.routeId}`}
            </h3>
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                route.active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {route.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
            {route.routeId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-hash text-[10px]" />
                ID: <span className="font-medium">{route.routeId}</span>
              </span>
            )}
            {route.depositId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-building text-[10px]" />
                Deposit: <span className="font-medium">{depositName || `#${route.depositId}`}</span>
              </span>
            )}
            {route.customerId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-person text-[10px]" />
                Customer: <span className="font-medium">{route.customerId}</span>
              </span>
            )}
            {route.serviceTypeId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-tag text-[10px]" />
                Service Type: <span className="font-medium">{serviceTypeName || `#${route.serviceTypeId}`}</span>
              </span>
            )}
            {route.servicePartnerId && (
              <span className="inline-flex items-center gap-1">
                <i className="bi bi-people text-[10px]" />
                Service Partner: <span className="font-medium">{servicePartnerName || `#${route.servicePartnerId}`}</span>
              </span>
            )}
          </div>
          {(route.createdAt || route.createdBy) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
              {route.createdAt && (
                <span>Created: {new Date(route.createdAt).toLocaleDateString()}</span>
              )}
              {route.createdBy && (
                <span>by {route.createdBy}</span>
              )}
            </div>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 ml-2">
            {onEdit && (
              <button
                onClick={() => onEdit(route)}
                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                title="Edit route"
                aria-label="Edit route"
              >
                <i className="bi bi-pencil text-sm"></i>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(route)}
                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Remove route"
                aria-label="Remove route"
              >
                <i className="bi bi-trash text-sm"></i>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

RouteCard.displayName = 'RouteCard';


