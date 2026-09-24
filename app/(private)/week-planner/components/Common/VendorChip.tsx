"use client";

import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import type { DayOffEntry } from '../DayOffModal';
import { Vendor } from '@/lib/vendors';
import ServicePartnerBadge from '@/components/service-partner-badge';
import { useServicePartners } from '@/hooks/useServicePartners';

type VendorChipProps = {
  vendor: Vendor;
  type: 'holding' | 'off';
  reason?: 'day_off' | 'inactive' | 'on_leave';
  draggable?: boolean;
  dayOffEntry?: DayOffEntry | null;
  onRemoveDayOff?: (entryId: string) => Promise<void>;
  onDragStart?: (e: React.DragEvent, data: { type: string; id: number; userId: number; status: string }) => void;
  onDragEnd?: (e: React.DragEvent) => void;
};

const VendorChip: React.FC<VendorChipProps> = ({
  vendor,
  type,
  reason = '',
  draggable = false,
  dayOffEntry = null,
  onRemoveDayOff,
  onDragStart,
  onDragEnd,
}) => {
  const handleDragStartChip = (e: React.DragEvent) => {
    if (!draggable) {
      e.preventDefault();
      return;
    }

    if (onDragStart) {
      onDragStart(e, {
        type: 'off',
        id: vendor.userId,
        userId: vendor.userId,
        status: type,
      });
    }
  };

  const handleDragEndChip = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  const { servicePartners } = useServicePartners();
  const vendorSpId = useMemo(() => {
    const raw = (vendor as Vendor & { servicePartnerId?: number | string | null }).servicePartnerId;
    if (raw == null) return null;
    const n = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [vendor]);
  const servicePartnerName = useMemo(() => {
    if (vendorSpId == null) return null;
    const found = servicePartners.find((sp) => Number(sp.servicePartnerId) === vendorSpId);
    return found?.partnerName ?? null;
  }, [servicePartners, vendorSpId]);

  const handleRemoveDayOff = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveDayOff && dayOffEntry) {
      await onRemoveDayOff(dayOffEntry.id);
    }
  };

  const getTitle = () => {
    if (type === 'off') {
      return dayOffEntry
        ? `${vendor.fullName} � ${dayOffEntry.reason || 'Day Off'}${dayOffEntry.notes ? `\n${dayOffEntry.notes}` : ''}`
        : `${vendor.fullName} � OFF`;
    }
    return `${vendor.fullName} � ${type === 'holding' ? 'Hold' : 'Available'}`;
  };

  return (
    <div
      className={`group relative flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-md border text-sm font-medium transition-all duration-200 ${
        type === 'off'
          ? 'bg-gradient-to-br from-red-50 to-red-100/80 border-red-200/60 text-red-900'
          : 'bg-gradient-to-br from-amber-50 to-amber-100/80 border-amber-200/60 text-amber-900'
      } ${draggable ? 'cursor-move hover:shadow-md hover:-translate-y-0.5 hover:border-opacity-80' : 'cursor-default'}`}
      data-vendor-id={vendor.userId}
      data-day-off-entry-id={dayOffEntry?.id}
      draggable={draggable}
      onDragStart={handleDragStartChip}
      onDragEnd={handleDragEndChip}
      title={getTitle()}
    >
      <span className="flex-1 break-words font-semibold leading-tight min-w-0">{vendor.fullName || 'Unknown Vendor'}</span>

      {vendorSpId != null && (
        <ServicePartnerBadge partnerName={servicePartnerName} size="xs" className="flex-shrink-0" />
      )}

      {reason && <span style={{ display: 'none' }} data-reason={reason}></span>}

      {dayOffEntry && onRemoveDayOff && (
        <button
          type="button"
          className="flex-shrink-0 p-0.5 rounded hover:bg-red-200/50 transition-colors text-red-700 hover:text-red-900"
          aria-label="Remove day off"
          onClick={handleRemoveDayOff}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default VendorChip;
