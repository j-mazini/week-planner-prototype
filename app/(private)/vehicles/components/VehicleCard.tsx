'use client';

import React, { memo, useMemo } from 'react';
import VrnPlate from '@/components/vrn-plate';
import { ServicePartnerBadge } from '@/components/service-partner-badge';
import type { Vehicle } from '../utils/vehicleMappers';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: (vehicle: Vehicle) => void;
  servicePartnerName?: string | null;
}

function getIconClasses(status: string): string {
  const s = (status || '').trim();
  if (s === 'Active') return 'bg-green-100 text-green-800 border-green-200/60';
  if (s === 'Maintenance') return 'bg-amber-100 text-amber-800 border-amber-200/60';
  return 'bg-red-100 text-red-800 border-red-200/60';
}

function getStatusTitle(status: string): string {
  const s = (status || '').trim();
  if (s === 'Active') return 'Active';
  if (s === 'Maintenance') return 'Maintenance';
  return 'Inactive';
}

function VehicleCardComponent({ vehicle, onClick, servicePartnerName }: VehicleCardProps) {
  const displayLabel = vehicle.vrn?.trim() || `Vehicle #${vehicle.id}`;
  const subtitle = [vehicle.brand, vehicle.model].filter(Boolean).join(' ').trim() || undefined;
  const iconClasses = useMemo(() => getIconClasses(vehicle.status), [vehicle.status]);
  const statusTitle = useMemo(() => getStatusTitle(vehicle.status), [vehicle.status]);

  return (
    <button
      type="button"
      onClick={() => onClick(vehicle)}
      className="
        w-full text-left rounded-xl border border-slate-200/80 bg-white p-3
        shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        flex items-center gap-3 min-h-0
      "
      aria-label={`Open ${displayLabel} (${statusTitle})`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border text-sm font-semibold ${iconClasses}`}
        title={statusTitle}
      >
        <span className="text-base" aria-hidden>
          {vehicle.vrn?.trim().slice(0, 2).toUpperCase() || '—'}
        </span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <VrnPlate
            vrn={vehicle.vrn}
            size="xs"
            badgeVariant={vehicle.fuelType === 'Electric' ? 'green' : 'blue'}
            className="w-fit whitespace-nowrap shrink-0"
          />
          {vehicle.servicePartnerId && (
            <ServicePartnerBadge partnerName={servicePartnerName} />
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 truncate">{subtitle}</p>
        )}
      </div>
    </button>
  );
}

export const VehicleCard = memo(VehicleCardComponent);
