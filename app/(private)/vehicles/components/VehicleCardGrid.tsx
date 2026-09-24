'use client';

import React, { useMemo } from 'react';
import type { Vehicle } from '../utils/vehicleMappers';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';
import { VehicleCard } from './VehicleCard';
import { vehiclesStyles } from '../styles';

interface VehicleCardGridProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onCardClick: (vehicle: Vehicle) => void;
  servicePartners?: ServicePartnerDTO[];
}

export function VehicleCardGrid({
  vehicles,
  isLoading,
  onCardClick,
  servicePartners = [],
}: VehicleCardGridProps) {
  const servicePartnerMap = useMemo(() => {
    const m = new Map<number, string>();
    servicePartners.forEach((sp) => m.set(sp.servicePartnerId, sp.partnerName));
    return m;
  }, [servicePartners]);
  if (isLoading) {
    return (
      <div className={vehiclesStyles.mobileLoadingContainer}>
        <div className={vehiclesStyles.mobileLoadingSpinner} />
        Loading...
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className={vehiclesStyles.mobileEmptyContainer}>
        No vehicles found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onClick={onCardClick}
          servicePartnerName={vehicle.servicePartnerId ? servicePartnerMap.get(vehicle.servicePartnerId) ?? null : null}
        />
      ))}
    </div>
  );
}
