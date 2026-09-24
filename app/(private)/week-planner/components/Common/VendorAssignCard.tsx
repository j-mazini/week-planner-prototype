"use client";

import React, { useMemo } from "react";
import type { Vendor } from "@/lib/vendors";
import type { Route } from "@/lib/api/routes";
import ServicePartnerBadge from "@/components/service-partner-badge";
import { useServicePartners } from "@/hooks/useServicePartners";

type VendorAssignCardProps = {
  vendor: Vendor;
  routes?: Route[];
  dayLabel?: string;
  dateLabel?: string;
  statusLabel?: string;
  draggable?: boolean;
  isOff?: boolean;
  onDragStart?: (event: React.DragEvent, payload: Record<string, unknown>) => void;
  onDragEnd?: (event: React.DragEvent) => void;
};

const VendorAssignCard: React.FC<VendorAssignCardProps> = ({
  vendor,
  routes = [],
  dayLabel,
  dateLabel,
  statusLabel = "Available",
  draggable = true,
  isOff = false,
  onDragStart,
  onDragEnd,
}) => {
  const handleDragStart = (event: React.DragEvent) => {
    if (!draggable) {
      event.preventDefault();
      return;
    }

    onDragStart?.(event, {
      type: "vendor",
      id: vendor.userId,
      vendorId: vendor.userId,
      vendorName: vendor.fullName,
      availability: "holding",
    });
  };

  const handleDragEnd = (event: React.DragEvent) => {
    onDragEnd?.(event);
  };

  // Find route associated with vendor
  const findRouteById = (routeId: number | null | undefined): Route | null => {
    if (!routeId || !routes.length) return null;
    
    const route = routes.find(
      (r) =>
        r.routeId === routeId ||
        r.routeDefaultId === routeId
    );
    
    return route || null;
  };

  const { servicePartners } = useServicePartners();
  const vendorSpId = useMemo(() => {
    const raw = (vendor as Vendor & { servicePartnerId?: number | string | null }).servicePartnerId;
    if (raw == null) return null;
    const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [vendor]);
  const servicePartnerName = useMemo(() => {
    if (vendorSpId == null) return null;
    const found = servicePartners.find((sp) => Number(sp.servicePartnerId) === vendorSpId);
    return found?.partnerName ?? null;
  }, [servicePartners, vendorSpId]);

  const vendorRoute = findRouteById(vendor.routeId);
  const routeName: string | null =
    (vendorRoute?.routeName as string | undefined) ||
    (vendorRoute?.routeDefaultName as string | undefined) ||
    null;
  const routeId: number | null =
    (vendorRoute?.routeId as number | undefined) ||
    (vendorRoute?.routeDefaultId as number | undefined) ||
    vendor.routeId ||
    null;

  return (
    <div
      className={`group relative flex flex-col justify-center gap-1.5 p-2 rounded-lg border transition-all duration-200 min-h-[48px] ${
        isOff
          ? 'bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed'
          : draggable
          ? 'bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-move'
          : 'bg-slate-50 border-slate-200 opacity-75'
      } ${!draggable ? 'pointer-events-none' : ''}`}
      draggable={draggable}
      data-vendor-id={vendor.userId}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={isOff 
        ? `${vendor.fullName} • OFF - Cannot be assigned to any route`
        : `${vendor.fullName}${routeName || routeId ? ` • Route: ${routeName || routeId}` : ''} • Drag to assign`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className={`font-semibold text-xs leading-tight break-words ${
              isOff ? 'text-slate-500' : 'text-slate-900'
            }`}>
              {vendor.fullName || 'Unknown Vendor'}
            </p>
            {vendorSpId != null && (
              <ServicePartnerBadge partnerName={servicePartnerName} size="xs" className="flex-shrink-0" />
            )}
          </div>
          {(routeName || routeId) && (
            <div className="mt-1">
              <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded whitespace-nowrap ${
                isOff 
                  ? 'bg-slate-200 text-slate-600' 
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {routeName || `Route ${routeId}`}
              </span>
            </div>
          )}
        </div>
        {statusLabel && (
          <span className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded whitespace-nowrap ${
            statusLabel === 'OFF'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {statusLabel}
          </span>
        )}
      </div>

      {(dayLabel || dateLabel) && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            {dayLabel && <span className="font-medium">{dayLabel}</span>}
            {dateLabel && <small className="text-slate-400">{dateLabel}</small>}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorAssignCard;


