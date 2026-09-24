"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown, UserCheck } from 'lucide-react';
import type { Vendor } from '@/lib/vendors';
import type { DayOffEntry } from './DayOffModal';
import { formatDate } from '../utils/dateUtils';
import { classifyVendorsForDate } from '../utils/vendorClassification';
import VendorChip from './Common/VendorChip';
import { useDragAndDrop, type DragItem } from '../hooks/useDragAndDrop';

type VendorListProps = {
  vendors: Vendor[];
  dayOffEntries: DayOffEntry[];
  weekDates: Date[];
  assignments: Array<{ userId?: number; name?: string; date: string }>;
  onDragStart?: (userId: number) => void;
  onRemoveDayOff?: (entryId: string) => Promise<void>;
  showWeekends?: boolean;
};

const VendorList: React.FC<VendorListProps> = ({ 
  vendors, 
  dayOffEntries,
  weekDates,
  assignments,
  onDragStart,
  onRemoveDayOff,
  showWeekends = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { handleDragStart, cleanupDrag } = useDragAndDrop();

  const handleVendorChipDragStart = useCallback(
    (e: React.DragEvent, data: DragItem) => {
      handleDragStart(e, {
        type: 'off',
        id: data.id,
        userId: data.userId,
        status: data.status,
      });
    },
    [handleDragStart]
  );

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

    // Separate by category
    const holdVendors = classifiedVendors.filter(d => d.category === 'hold');
    const offVendors = classifiedVendors.filter(d => d.category === 'off');
    const _assignedVendors = classifiedVendors.filter(d => d.category === 'assigned');

    const hasOffVendors = offVendors.length > 0;
    const hasHoldVendors = holdVendors.length > 0;

    return (
      <div 
        key={dateStr} 
        className="vendor-day-card"
        style={{
          background: 'linear-gradient(150deg, rgba(255,255,255,0.98) 0%, rgba(235, 241, 255, 0.97) 45%, rgba(226, 244, 255, 0.98) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.32)',
          borderRadius: '14px',
          padding: '0.65rem 0.8rem',
          boxShadow: '0 18px 36px rgba(99, 102, 241, 0.12), 0 12px 24px rgba(14, 165, 233, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          minHeight: '180px',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 30px 52px rgba(99, 102, 241, 0.18), 0 16px 36px rgba(14, 165, 233, 0.16)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.38)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 18px 36px rgba(99, 102, 241, 0.12), 0 12px 24px rgba(14, 165, 233, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.32)';
        }}
      >
        {/* Day Header */}
        <div className="vendor-day-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.4rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        }}>
          <span className="vendor-day-name" style={{
            fontWeight: 600,
            fontSize: '0.9rem',
            color: '#1e293b',
          }}>{dayName}</span>
          <span className="vendor-day-date" style={{
            fontSize: '0.75rem',
            color: '#6c7a92',
          }}>{dayShort}</span>
        </div>

        {/* Lists Wrapper */}
        <div className="vendor-day-lists" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          flex: 1,
        }}>
          {/* Off Vendors List */}
          <div 
            className="vendor-day-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.24rem',
              flex: 1,
            }}
          >
            <div className="vendor-day-list-title" style={{
              fontSize: '0.66rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#6c7a92',
              letterSpacing: '0.05em',
            }}>Off</div>
            <div 
              className="vendor-chip-group"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.28rem',
                alignItems: 'stretch',
              }}
            >
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
                    onDragStart={handleVendorChipDragStart}
                    onDragEnd={cleanupDrag}
                  />
                );
              })}
              {!hasOffVendors && (
                <span 
                  className="vendor-chip-empty"
                  style={{
                    gridColumn: '1 / -1',
                    fontSize: '0.64rem',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '0.5rem',
                  }}
                >
                  No off vendors
                </span>
              )}
            </div>
          </div>

          {/* Hold Vendors List */}
          <div 
            className="vendor-day-list hold-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.24rem',
              flex: 1,
            }}
          >
            <div className="vendor-day-list-title" style={{
              fontSize: '0.66rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#6c7a92',
              letterSpacing: '0.05em',
            }}>Hold</div>
            <div 
              className="vendor-chip-group"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.28rem',
                alignItems: 'stretch',
              }}
            >
              {holdVendors.map((vendor) => (
                <VendorChip
                  key={`hold-${vendor.userId}`}
                  vendor={vendor}
                  type="holding"
                  draggable={!!onDragStart}
                  onDragStart={handleVendorChipDragStart}
                  onDragEnd={cleanupDrag}
                />
              ))}
              {!hasHoldVendors && (
                <span 
                  className="vendor-chip-empty"
                  style={{
                    gridColumn: '1 / -1',
                    fontSize: '0.64rem',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '0.5rem',
                  }}
                >
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
      className="vendors-panel"
      style={{
        width: '100%',
        maxWidth: '100%',
        maxHeight: '42vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'linear-gradient(150deg, rgba(255,255,255,0.98) 0%, rgba(239, 244, 255, 0.96) 55%, rgba(230, 245, 255, 0.95) 100%)',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        borderRadius: '18px',
        boxShadow: '0 18px 36px rgba(99, 102, 241, 0.12), 0 12px 24px rgba(14, 165, 233, 0.1)',
      }}
      onMouseEnter={(e) => {
        const content = e.currentTarget.querySelector('#off-vendors-content') as HTMLElement;
        if (content) {
          content.style.maxHeight = '70vh';
          content.style.overflow = 'auto';
          content.style.boxShadow = 'inset 0 -12px 16px rgba(15, 23, 42, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        const content = e.currentTarget.querySelector('#off-vendors-content') as HTMLElement;
        if (content) {
          content.style.maxHeight = '';
          content.style.overflow = '';
          content.style.boxShadow = '';
        }
      }}
    >
      {/* Collapsible Header */}
      <div 
        className="collapsible-header"
        role="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          cursor: 'pointer',
          borderBottom: '1px solid #e3e8ef',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <h5 style={{
          margin: 0,
          fontWeight: 600,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <UserCheck className="w-5 h-5" />
          Available Vendors
        </h5>
        <ChevronDown 
          className="collapsible-toggle-icon"
          style={{
            transition: 'transform 0.3s ease',
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          }}
        />
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div 
          id="off-vendors-content"
          className="collapse show"
          style={{
            flex: '1 1 auto',
            padding: '0.65rem 0.9rem 0.7rem',
            backgroundColor: '#fcfdff',
            overflow: 'hidden',
            transition: 'max-height 0.25s ease, box-shadow 0.25s ease',
          }}
        >
          <div 
            className="week-vendor-menu"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gridAutoRows: '1fr',
              gap: '0.65rem',
              alignItems: 'stretch',
              paddingBottom: '0.35rem',
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



