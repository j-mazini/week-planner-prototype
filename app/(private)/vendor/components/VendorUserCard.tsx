'use client';

import React, { memo, useMemo } from 'react';
import type { Vendor } from '@/lib/vendors-api';
import { ServicePartnerBadge } from '@/components/service-partner-badge';

interface VendorUserCardProps {
  vendor: Vendor;
  vendorTypeName?: string;
  statusBadge: React.ReactNode;
  onClick: (vendor: Vendor) => void;
  servicePartnerName?: string | null;
}

function getInitials(vendor: Vendor): string {
  const first = (vendor.firstName || '').trim().charAt(0).toUpperCase();
  const last = (vendor.lastName || '').trim().charAt(0).toUpperCase();
  if (first && last) return `${first}${last}`;
  if (first) return first;
  if (last) return last;
  return (vendor.email || '?').charAt(0).toUpperCase();
}

function isVendorActive(vendor: Vendor): boolean {
  if (vendor.status) return vendor.status === 'Active';
  const today = new Date();
  return !vendor.finishDate || new Date(vendor.finishDate) > today;
}

function VendorUserCardComponent({ vendor, vendorTypeName, onClick, servicePartnerName }: VendorUserCardProps) {
  const spId = typeof vendor.servicePartnerId === 'string'
    ? parseInt(vendor.servicePartnerId, 10)
    : vendor.servicePartnerId;
  const hasServicePartner = spId != null && !Number.isNaN(spId);
  const name = [vendor.firstName, vendor.lastName].filter(Boolean).join(' ').trim() || '—';
  const initials = getInitials(vendor);
  const isActive = useMemo(() => isVendorActive(vendor), [vendor]);

  const iconClasses = isActive
    ? 'bg-green-100 text-green-800 border-green-200/60'
    : 'bg-red-100 text-red-800 border-red-200/60';

  return (
    <button
      type="button"
      onClick={() => onClick(vendor)}
      className="
        w-full text-left rounded-xl border border-slate-200/80 bg-white p-3
        shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        flex items-center gap-3 min-h-0
      "
      aria-label={`Open ${name} (${isActive ? 'Active' : 'Inactive'})`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border text-sm font-semibold ${iconClasses}`}
        title={isActive ? 'Active' : 'Inactive'}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-slate-800 text-sm break-words">{name}</p>
          {hasServicePartner && (
            <ServicePartnerBadge partnerName={servicePartnerName} />
          )}
        </div>
        {vendorTypeName && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{vendorTypeName}</p>
        )}
      </div>
    </button>
  );
}

export const VendorUserCard = memo(VendorUserCardComponent);
