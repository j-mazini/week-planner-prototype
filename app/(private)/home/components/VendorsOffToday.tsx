"use client";

import React from 'react';
import { useVendorsOffToday, type VendorOffInfo } from '../hooks/useVendorsOffToday';
import { VendorsOffSkeleton } from './VendorsOffSkeleton';

interface VendorsOffTodayProps {
  /**
   * Date in YYYY-MM-DD format (optional, default: today)
   */
  date?: string;
  
  /**
   * Callback when data is loaded
   */
  onDataLoaded?: (vendorsOff: VendorOffInfo[]) => void;
  
  /**
   * Render only the list (without container)
   */
  renderOnly?: boolean;
  
  /**
   * Custom CSS class for the container
   */
  className?: string;
}

/**
 * Component to display all vendors off for the current day
 */
export function VendorsOffToday({
  date,
  onDataLoaded,
  renderOnly = false,
  className = '',
}: VendorsOffTodayProps) {
  const { vendorsOff, isLoading, error } = useVendorsOffToday(date);

  React.useEffect(() => {
    if (onDataLoaded && !isLoading && !error) {
      onDataLoaded(vendorsOff);
    }
  }, [vendorsOff, isLoading, error, onDataLoaded]);

  if (renderOnly) {
    return null;
  }

  // Sempre renderizar algo, mesmo durante loading ou erro

  if (isLoading) {
    return (
      <div className={className}>
        <VendorsOffSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
            Vendors Off
          </h3>
        </div>
        <div className="p-3 sm:p-4 bg-rose-50 rounded-lg border border-rose-200">
          <div className="text-xs sm:text-sm text-rose-600 text-center break-words">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (vendorsOff.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
            Vendors Off (0)
          </h3>
        </div>
        <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs sm:text-sm text-slate-500 text-center">
            No vendors off today
          </div>
        </div>
      </div>
    );
  }

  const getReasonLabel = (reason: VendorOffInfo['reason']): string => {
    switch (reason) {
      case 'day_off':
        return 'Day off';
      case 'inactive':
        return 'Inactive';
      case 'on_leave':
        return 'On leave';
      default:
        return 'Off';
    }
  };

  const getReasonColor = (reason: VendorOffInfo['reason']): string => {
    switch (reason) {
      case 'day_off':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-slate-100 text-slate-800';
      case 'on_leave':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800">
          Vendors Off ({vendorsOff.length})
        </h3>
      </div>
      
      <div className="space-y-2 overflow-y-auto">
        {vendorsOff.map((item) => (
          <div
            key={`${item.vendor.userId}-${item.reason}`}
            className="flex items-start sm:items-center justify-between p-2.5 sm:p-3 bg-white rounded-lg border border-slate-200 transition-shadow cursor-pointer flex-shrink-0"
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="font-medium text-slate-900 text-sm sm:text-base truncate">
                {item.vendor.fullName}
              </div>
              {item.vendor.deposit?.depositName && (
                <div className="text-xs text-slate-500 mt-1 truncate">
                  {item.vendor.deposit.depositName}
                </div>
              )}
              {item.notes && (
                <div className="text-xs text-slate-600 mt-1 italic break-words">
                  {item.notes}
                </div>
              )}
            </div>
            
            {/* Mostrar flag apenas se não for folga */}
            {item.reason !== 'day_off' && (
              <div className="ml-2 sm:ml-4 flex-shrink-0">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getReasonColor(item.reason)}`}
                >
                  {getReasonLabel(item.reason)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook to use only the vendors off data (without rendering)
 */
export function useVendorsOffTodayData(date?: string) {
  return useVendorsOffToday(date);
}



