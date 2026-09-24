'use client';

import React, { memo, useMemo } from 'react';
import type { Vendor, VendorType } from '@/lib/vendors-api';
import type { ServicePartnerDTO } from '@/lib/service-partners-api';
import { VendorUserCard } from './VendorUserCard';
import { vendorStyles } from '../styles';

interface VendorCardGridProps {
  vendors: Vendor[];
  vendorTypes: VendorType[];
  isLoading: boolean;
  getStatusBadge: (vendor: Vendor) => JSX.Element;
  onCardClick: (vendor: Vendor) => void;
  servicePartners?: ServicePartnerDTO[];
}

const vendorTypeMapFromList = (vendorTypes: VendorType[]): Map<string, string> => {
  const map = new Map<string, string>();
  vendorTypes.forEach((vt) => {
    const key = String(vt.vendorTypeId ?? '');
    map.set(key, vt.nameType || key);
  });
  return map;
};

function VendorCardGridComponent({
  vendors,
  vendorTypes,
  isLoading,
  getStatusBadge,
  onCardClick,
  servicePartners = [],
}: VendorCardGridProps) {
  const typeMap = useMemo(() => vendorTypeMapFromList(vendorTypes), [vendorTypes]);

  const servicePartnerMap = useMemo(() => {
    const m = new Map<number, string>();
    servicePartners.forEach((sp) => m.set(sp.servicePartnerId, sp.partnerName));
    return m;
  }, [servicePartners]);

  if (isLoading) {
    return (
      <div className={vendorStyles.mobileLoadingContainer}>
        <div className={vendorStyles.mobileLoadingSpinner}>
          <div className={vendorStyles.mobileLoadingIcon} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className={vendorStyles.mobileEmptyContainer}>
        No vendors found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
      {vendors.map((vendor, idx) => {
        const spIdRaw = vendor.servicePartnerId;
        const spId = typeof spIdRaw === 'string' ? parseInt(spIdRaw, 10) : spIdRaw;
        const spName = spId != null && !Number.isNaN(spId) ? servicePartnerMap.get(spId) ?? null : null;
        return (
          <VendorUserCard
            key={`vendor-${vendor.id}-${idx}`}
            vendor={vendor}
            vendorTypeName={vendor.vendorType ? (typeMap.get(String(vendor.vendorType)) || String(vendor.vendorType)) : undefined}
            statusBadge={getStatusBadge(vendor)}
            onClick={onCardClick}
            servicePartnerName={spName}
          />
        );
      })}
    </div>
  );
}

export const VendorCardGrid = memo(VendorCardGridComponent);

