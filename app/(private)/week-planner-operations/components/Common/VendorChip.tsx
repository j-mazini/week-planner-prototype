"use client";



import React from 'react';

import { X } from 'lucide-react';

import type { Vendor } from '@/lib/vendors';

import type { DayOffEntry } from '../DayOffModal';
import type { DragItem } from '../../hooks/useDragAndDrop';



type VendorChipProps = {

  vendor: Vendor;

  type: 'holding' | 'off';

  reason?: 'day_off' | 'inactive' | 'on_leave';

  draggable?: boolean;

  dayOffEntry?: DayOffEntry | null;

  onRemoveDayOff?: (entryId: string) => Promise<void>;

  onDragStart?: (e: React.DragEvent, data: DragItem) => void;

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



  const handleRemoveDayOff = async (e: React.MouseEvent) => {

    e.stopPropagation();

    if (onRemoveDayOff && dayOffEntry) {

      await onRemoveDayOff(dayOffEntry.id);

    }

  };



  const getTitle = () => {

    if (type === 'off') {

      return dayOffEntry

        ? `${vendor.fullName} • ${dayOffEntry.reason || 'Day Off'}${dayOffEntry.notes ? `\n${dayOffEntry.notes}` : ''}`

        : `${vendor.fullName} • OFF`;

    }

    return `${vendor.fullName} • ${type === 'holding' ? 'Hold' : 'Available'}`;

  };



  return (

    <div

      className={`vendor-off-tag ${type}`}

      data-vendor-id={vendor.userId}

      data-day-off-entry-id={dayOffEntry?.id}

      draggable={draggable}

      onDragStart={handleDragStartChip}

      onDragEnd={handleDragEndChip}

      title={getTitle()}

    >

      <span className="vendor-chip-label">{vendor.fullName}</span>



      {reason && <span style={{ display: 'none' }} data-reason={reason}></span>}



      {dayOffEntry && onRemoveDayOff && (

        <button

          type="button"

          className="day-off-remove-btn"

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







