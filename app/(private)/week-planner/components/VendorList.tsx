"use client";

import React, { useMemo, useState } from 'react';
import { ChevronDown, UserCheck } from 'lucide-react';
import type { Route } from '@/lib/api/routes';
import type { DayOffEntry } from './DayOffModal';
import { formatDate } from '../utils/dateUtils';
import { classifyVendorsForDate } from '../utils/vendorClassification';
import { useDragAndDrop, type DragItem } from '../hooks/useDragAndDrop';
import { Vendor } from '@/lib/vendors';
import VendorChip from './Common/VendorChip';

type VendorListProps = {
  vendors: Vendor[];
  routes?: Route[];
  dayOffEntries: DayOffEntry[];
  weekDates: Date[];
  assignments: Array<{ vendorId?: number; name?: string; date: string }>;
  onDragStart?: (vendorId: number) => void;
  onRemoveDayOff?: (entryId: string) => Promise<void>;
  showWeekends?: boolean;
};

const VendorList: React.FC<VendorListProps> = ({ 
  vendors,
  routes: _routes = [],
  dayOffEntries,
  weekDates,
  assignments,
  onDragStart,
  onRemoveDayOff,
  showWeekends = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { handleDragStart, cleanupDrag } = useDragAndDrop();

  // VendorChip passes data.type as string; cast to DragItem for the hook
  const handleChipDragStart = (e: React.DragEvent, data: { type: string; id: number; userId: number; status: string }) => {
    handleDragStart(e, data as DragItem);
  };

  // Filter week dates based on showWeekends
  const visibleWeekDates = useMemo(() => {
    if (showWeekends) return weekDates;
    return weekDates.filter((_, index) => index < 5); // Monday to Friday
  }, [weekDates, showWeekends]);

  // Render vendor chips for a specific day
  const renderDayVendors = (date: Date, dateStr: string) => {
    const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' });
    const dayShort = formatDate(date, 'dd/mm');

    // Use new classification utility
    const classifiedVendors = classifyVendorsForDate(
      vendors,
      assignments,
      dayOffEntries,
      date
    );

    // Separate by category and remove duplicates
    const seenVendorIds = new Set<number>();
    const uniqueClassifiedVendors = classifiedVendors.filter(d => {
      if (seenVendorIds.has(d.userId)) {
        return false;
      }
      seenVendorIds.add(d.userId);
      return true;
    });
    
    const holdVendors = uniqueClassifiedVendors.filter(d => d.category === 'hold');
    const offVendors = uniqueClassifiedVendors.filter(d => d.category === 'off');

    const hasOffVendors = offVendors.length > 0;
    const hasHoldVendors = holdVendors.length > 0;

    return (
      <div 
        key={dateStr} 
        className="group flex flex-col gap-3 p-3.5 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300/60 transition-all duration-200 hover:-translate-y-1 min-h-[200px]"
      >
        {/* Day Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/50">
          <span className="font-semibold text-sm text-slate-900 capitalize">{dayName}</span>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {dayShort}
          </span>
        </div>

        {/* Lists Wrapper */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Off Vendors List */}
          <div className="flex flex-col gap-2">
            <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-600">
              Off
            </div>
            <div className="grid grid-cols-2 gap-2">
              {offVendors.map((vendor) => {
                const dayOffEntry = dayOffEntries.find(e => e.userId === vendor.userId && e.date === dateStr);
                return (
                  <VendorChip
                    key={`off-${vendor.userId}`}
                    vendor={vendor}
                    type="off"
                    reason={vendor.reason}
                    dayOffEntry={dayOffEntry || undefined}
                    onRemoveDayOff={onRemoveDayOff}
                    onDragStart={handleChipDragStart}
                    onDragEnd={cleanupDrag}
                  />
                );
              })}
              {!hasOffVendors && (
                <span className="col-span-2 text-center text-xs text-slate-400 italic py-2">
                  No off vendors
                </span>
              )}
            </div>
          </div>

          {/* Hold Vendors List */}
          <div className="flex flex-col gap-2">
            <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-600">
              Hold
            </div>
            <div className="grid grid-cols-2 gap-2">
              {holdVendors.map((vendor) => (
                <VendorChip
                  key={`hold-${vendor.userId}-${dateStr}`}
                  vendor={vendor}
                  type="holding"
                  draggable={!!onDragStart}
                  onDragStart={handleChipDragStart}
                  onDragEnd={cleanupDrag}
                />
              ))}
              {!hasHoldVendors && (
                <span className="col-span-2 text-center text-xs text-slate-400 italic py-2">
                  No hold vendors
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      id="off-vendors-container"
      className="w-full max-w-full max-h-[42vh] flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm"
      onMouseEnter={(e) => {
        const content = e.currentTarget.querySelector('#off-vendors-content') as HTMLElement;
        if (content) {
          content.style.maxHeight = '70vh';
          content.style.overflow = 'auto';
        }
      }}
      onMouseLeave={(e) => {
        const content = e.currentTarget.querySelector('#off-vendors-content') as HTMLElement;
        if (content) {
          content.style.maxHeight = '';
          content.style.overflow = '';
        }
      }}
    >
      {/* Collapsible Header */}
      <div 
        className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50 cursor-pointer hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-100/50 transition-colors"
        role="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h5 className="m-0 font-semibold text-lg text-slate-900 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          Available Vendors
        </h5>
        <ChevronDown 
          className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${
            isCollapsed ? '-rotate-90' : 'rotate-0'
          }`}
        />
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div 
          id="off-vendors-content"
          className="collapse show p-4 bg-gradient-to-br from-slate-50/50 to-blue-50/30"
          style={{
            flex: '1 1 auto',
            overflow: 'hidden',
            transition: 'max-height 0.25s ease, box-shadow 0.25s ease',
          }}
        >
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
            style={{
              width: '100%',
            }}
          >
            {visibleWeekDates.length === 0 ? (
              <p style={{ 
                gridColumn: '1 / -1',
                textAlign: 'center',
                color: '#94a3b8',
                padding: '2rem',
              }}>
                No dates to display
              </p>
            ) : (
              visibleWeekDates.map((date) => {
                const dateStr = formatDate(date, 'yyyy-mm-dd');
                return renderDayVendors(date, dateStr);
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorList;


