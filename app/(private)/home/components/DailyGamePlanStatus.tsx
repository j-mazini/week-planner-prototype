"use client";

import React from 'react';
import { useDailyGamePlanStatus, type DepositStatus, type DailyGamePlanStatus } from '../hooks/useDailyGamePlanStatus';
import { DailyGamePlanSkeleton } from './DailyGamePlanSkeleton';

interface DailyGamePlanStatusProps {
  /**
   * Date in YYYY-MM-DD format (optional, default: today)
   */
  date?: string;
  
  /**
   * Callback when data is loaded
   */
  onDataLoaded?: (depositsStatus: DepositStatus[]) => void;
  
  /**
   * Custom CSS class for the container
   */
  className?: string;
}

/**
 * Component to display the Daily Game Plan status for the current day
 */
export function DailyGamePlanStatus({
  date,
  onDataLoaded,
  className = '',
}: DailyGamePlanStatusProps) {
  const { depositsStatus, isLoading, error } = useDailyGamePlanStatus(date);

  React.useEffect(() => {
    if (onDataLoaded && !isLoading && !error) {
      onDataLoaded(depositsStatus);
    }
  }, [depositsStatus, isLoading, error, onDataLoaded]);

  const getStatusLabel = (status: DailyGamePlanStatus): string => {
    switch (status) {
      case 'started':
        return 'Operation started';
      case 'finished':
        return 'Operation Finished';
      case 'waiting':
        return 'Waiting for supervisor';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: DailyGamePlanStatus): string => {
    switch (status) {
      case 'started':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'finished':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'waiting':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: DailyGamePlanStatus): string => {
    switch (status) {
      case 'started':
        return 'bi-play-circle-fill';
      case 'finished':
        return 'bi-check-circle-fill';
      case 'waiting':
        return 'bi-clock-history';
      default:
        return 'bi-question-circle';
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <DailyGamePlanSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
            Daily Game Plan Status
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

  if (depositsStatus.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
            Daily Game Plan Status
          </h3>
        </div>
        <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs sm:text-sm text-slate-500 text-center">
            No deposits found
          </div>
        </div>
      </div>
    );
  }

  // Group by status for better visualization
  const groupedByStatus = depositsStatus.reduce((acc, deposit) => {
    if (!acc[deposit.status]) {
      acc[deposit.status] = [];
    }
    acc[deposit.status].push(deposit);
    return acc;
  }, {} as Record<DailyGamePlanStatus, DepositStatus[]>);

  const statusOrder: DailyGamePlanStatus[] = ['waiting', 'started', 'finished'];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800">
          Daily Game Plan Status
        </h3>
        <span className="text-xs sm:text-sm text-slate-500 font-medium whitespace-nowrap ml-2">
          {depositsStatus.length} {depositsStatus.length === 1 ? 'deposit' : 'deposits'}
        </span>
      </div>
      
      <div className="space-y-3 overflow-y-auto">
        {statusOrder.map((status) => {
          const deposits = groupedByStatus[status] || [];
          if (deposits.length === 0) return null;

          return (
            <div key={status} className="space-y-2 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <i className={`bi ${getStatusIcon(status)} text-sm flex-shrink-0`}></i>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {getStatusLabel(status)} ({deposits.length})
                </span>
              </div>
              
              <div className="space-y-2">
                {deposits.map((deposit) => (
                  <div
                    key={deposit.depositId}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg border ${getStatusColor(deposit.status)} bg-white cursor-pointer transition-colors flex-shrink-0`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <i className={`bi ${getStatusIcon(deposit.status)} text-sm sm:text-base flex-shrink-0`}></i>
                      <span className="font-medium text-sm sm:text-base truncate">
                        {deposit.depositName}
                      </span>
                    </div>
                    
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50 whitespace-nowrap ml-2 flex-shrink-0">
                      {getStatusLabel(deposit.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hook to use only the status data (without rendering)
 */
export function useDailyGamePlanStatusData(date?: string) {
  return useDailyGamePlanStatus(date);
}


