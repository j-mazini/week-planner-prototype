"use client";

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { UserCheck } from 'lucide-react';
import { hasAuthSession, getBearerAuthHeader } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { useDragAndDrop, type DragItem } from '../hooks/useDragAndDrop';
import VendorAssignCard from './Common/VendorAssignCard';
import type { Vendor } from '@/lib/vendors';
import type { Route } from '@/lib/api/routes';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import { getWeekDates, formatDate, isWeekend, parseLocalDate } from '../utils/dateUtils';
import type { DayOffEntry } from './DayOffModal';
import { normalizeVendorsToVendors } from '../utils/vendorUtils';

type AvailableVendorsProps = {
  routes?: Route[];
  onVendorDragStart?: (userId: number) => void;
  assignments?: WeekPlannerRecord[];
  date?: string; // YYYY-MM-DD format
  showWeekends?: boolean;
  dayOffEntries?: DayOffEntry[];
  isDailyView?: boolean; // If true, show only the specific day instead of the week
  vendors?: Record<string, unknown>[] | null; // Optional: pre-fetched vendors to avoid duplicate requests (null = not loaded yet, [] = loaded but empty)
  /** When true, grid aligns with week planner table (120px label column + day columns) */
  alignWithWeekPlanner?: boolean;
};

/**
 * Component that fetches available vendors from GET /vendor endpoint
 * and allows dragging them to week-planner loops
 */
const AvailableVendors: React.FC<AvailableVendorsProps> = ({
  routes = [],
  onVendorDragStart,
  assignments: _assignments = [],
  date,
  showWeekends = true,
  dayOffEntries = [],
  isDailyView = false,
  vendors: providedVendors,
  alignWithWeekPlanner = false,
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const { handleDragStart, cleanupDrag } = useDragAndDrop();

  // Track if we've already processed vendors to avoid duplicate processing
  const processedVendorsRef = useRef<Record<string, unknown>[] | null | undefined>(undefined);
  const isProcessingRef = useRef(false);

  /**
   * Fetch vendors from GET /vendor endpoint
   * Only fetches if vendors are not provided as prop
   */
  const fetchAvailableVendors = useCallback(async () => {
    // If vendors are provided as prop (not null/undefined), use them instead of fetching
    if (providedVendors !== undefined && providedVendors !== null) {
      // If it's an empty array, that's fine - just set empty vendors
      if (providedVendors.length === 0) {
        setVendors([]);
        setIsLoading(false);
        setError(null);
        return Promise.resolve();
      }

      // normalizeVendorsToVendors aplica todas as regras globais de elegibilidade:
      // active truthy, userId > 0, userTypeId em `ALLOWED_USER_TYPE_IDS`, endDate no futuro
      const normalizedVendors = normalizeVendorsToVendors(providedVendors);

      setVendors(normalizedVendors);
      setIsLoading(false);
      setError(null);
      return Promise.resolve();
    }

    // Only fetch from API if vendors are NOT provided
    // This should not happen if vendors are properly passed down
    console.warn('[AvailableVendors] Fetching vendors from API - vendors prop not provided. providedVendors:', providedVendors);
    const API_BASE_URL = getApiBaseUrl();

    if (!API_BASE_URL) {
      setError("API URL is not configured.");
      setIsLoading(false);
      return Promise.resolve();
    }

    if (!hasAuthSession()) {
      setError("Authentication token not found. Please login again.");
      setIsLoading(false);
      return Promise.resolve();
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/bff/vendor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getBearerAuthHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Invalid token. Please login again.");
          setIsLoading(false);
          return Promise.resolve();
        }
        throw new Error(`Failed to fetch vendors: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.json();

      // Handle different response formats
      let vendorsArray: Record<string, unknown>[] = [];

      if (Array.isArray(rawData)) {
        vendorsArray = rawData;
      } else if (rawData && typeof rawData === 'object') {
        if (Array.isArray(rawData.data)) {
          vendorsArray = rawData.data;
        } else if (Array.isArray(rawData.result)) {
          vendorsArray = rawData.result;
        } else if (Array.isArray(rawData.vendors)) {
          vendorsArray = rawData.vendors;
        } else if (Array.isArray(rawData.users)) {
          vendorsArray = rawData.users;
        } else if (Array.isArray(rawData.items)) {
          vendorsArray = rawData.items;
        }
      }

      // normalizeVendorsToVendors aplica todas as regras globais de elegibilidade
      const normalizedVendors = normalizeVendorsToVendors(vendorsArray);

      setVendors(normalizedVendors);
    } catch (err) {
      console.error("Error fetching available vendors:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch vendors");
    } finally {
      setIsLoading(false);
    }
  }, [providedVendors]);

  useEffect(() => {
    // Skip if already processing the same vendors
    if (isProcessingRef.current) {
      return;
    }

    // If vendors are provided (not null/undefined), use them
    if (providedVendors !== undefined && providedVendors !== null) {
      // Only process if vendors have changed
      if (processedVendorsRef.current === providedVendors) {
        return;
      }

      isProcessingRef.current = true;
      processedVendorsRef.current = providedVendors;
      fetchAvailableVendors().finally(() => {
        isProcessingRef.current = false;
      });
    } else if (providedVendors === null) {
      // Vendors are explicitly null (not loaded yet), wait - don't fetch
      if (processedVendorsRef.current !== null) {
        processedVendorsRef.current = null;
        setIsLoading(true);
      }
    } else if (!hasTriedFetch) {
      // Only fetch if vendors are not provided (undefined) and we haven't tried fetching yet
      // This should rarely happen if vendors are properly passed down
      console.warn('[AvailableVendors] Vendors not provided (undefined), will fetch from API');
      setHasTriedFetch(true);
      isProcessingRef.current = true;
      fetchAvailableVendors().finally(() => {
        isProcessingRef.current = false;
      });
    }
  }, [fetchAvailableVendors, providedVendors, hasTriedFetch]);

  const [searchTerm, setSearchTerm] = useState('');

  // Remove duplicates, filter by search term, and sort by name
  const filteredVendors = useMemo(() => {
    const seenUserIds = new Set<number>();
    const q = searchTerm.toLowerCase().trim();
    
    const filtered = vendors.filter((vendor) => {
      if (seenUserIds.has(vendor.userId)) {
        return false;
      }
      
      const nameMatch = (vendor.fullName || '').toLowerCase().includes(q);
      const idMatch = String(vendor.userId).includes(q);
      
      if (q && !nameMatch && !idMatch) {
        return false;
      }
      
      seenUserIds.add(vendor.userId);
      return true;
    });

    // Sort by fullName alphabetically
    return filtered.sort((a, b) => {
      const nameA = a.fullName?.toLowerCase() || '';
      const nameB = b.fullName?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }, [vendors, searchTerm]);

  // Use the filtered list for display
  const uniqueVendors = filteredVendors;

  // Calculate week dates or single day for daily view
  const weekDates = useMemo(() => {
    if (!date) return [];

    // If daily view, return only the specific day
    if (isDailyView) {
      const dayDate = parseLocalDate(date);
      return [dayDate];
    }

    // Otherwise, calculate week dates
    const allWeekDates = getWeekDates(date);
    return showWeekends
      ? allWeekDates
      : allWeekDates.filter((_, index) => index < 5); // Only Monday to Friday
  }, [date, showWeekends, isDailyView]);

  // All vendors are listed regardless of existing assignments on the day.
  // Differences between vendors are visual only (Spare grouping), not data filtering.
  const vendorsByDay = useMemo(() => {
    if (!date || weekDates.length === 0) {
      return {};
    }

    const vendorsByDayMap: Record<string, Vendor[]> = {};

    weekDates.forEach((dayDate) => {
      const dateStr = formatDate(dayDate, 'yyyy-mm-dd');
      vendorsByDayMap[dateStr] = uniqueVendors;
    });

    return vendorsByDayMap;
  }, [uniqueVendors, weekDates, date]);

  const handleVendorDragStart = useCallback(
    (event: React.DragEvent, vendor: Vendor, dateStr?: string) => {
      const dragItem: DragItem = {
        type: 'vendor',
        id: vendor.userId,
        userId: vendor.userId,
        vendorName: vendor.fullName,
        date: dateStr, // Include date if available
      };

      handleDragStart(event, dragItem);
      onVendorDragStart?.(vendor.userId);
    },
    [handleDragStart, onVendorDragStart]
  );

  if (isLoading) {
    return (
      <div className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Available Vendors
          </h3>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading vendors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Available Vendors
          </h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-red-600 mb-3 font-medium">{error}</p>
          <button
            onClick={fetchAvailableVendors}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 rounded-xl shadow-inner">
            <UserCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 m-0 tracking-tight">
              Available Vendors
            </h3>
            <p className="text-[11px] text-slate-500 m-0 mt-0.5 font-semibold uppercase tracking-wider">
              {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'} available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 md:max-w-md lg:max-w-lg">
          <div className="relative group w-full">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md transition-colors group-focus-within:text-indigo-600 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, last name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-11 pr-4 bg-white/80 border border-slate-200 rounded-xl text-sm font-medium transition-all duration-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400"
            />
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2.5 rounded-xl hover:bg-white/80 transition-all text-slate-500 hover:text-indigo-600 border border-transparent hover:border-slate-200 active:scale-95"
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className={`bg-slate-50/50 ${alignWithWeekPlanner ? 'p-0' : 'p-4'}`}>
          {weekDates.length > 0 ? (
            <div className={`grid ${alignWithWeekPlanner ? 'gap-0' : 'gap-3'} ${isDailyView ? 'grid-cols-1'
                : alignWithWeekPlanner
                  ? (showWeekends
                    ? 'grid-cols-[120px_repeat(7,minmax(0,1fr))] md:grid-cols-[120px_repeat(7,minmax(0,1fr))]'
                    : 'grid-cols-[120px_repeat(5,minmax(0,1fr))] md:grid-cols-[120px_repeat(5,minmax(0,1fr))]')
                  : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7'
              }`}>
              {/* Spacer column - aligns with route labels column in week planner when in drawer */}
              {alignWithWeekPlanner && !isDailyView && <div className="min-w-0" aria-hidden />}
              {weekDates.map((dayDate) => {
                const dateStr = formatDate(dayDate, 'yyyy-mm-dd');
                const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                const dateNum = formatDate(dayDate, 'dd/mm');
                const isWeekendDay = isWeekend(dayDate);
                // Vendors disponíveis para o dia: não alocados e também não marcados como OFF (day off)
                const dayVendors = (vendorsByDay[dateStr] || []).filter((vendor) =>
                  !dayOffEntries.some(
                    (entry) => entry.userId === vendor.userId && entry.date === dateStr
                  )
                );

                return (
                  <div
                    key={dateStr}
                    className={`flex flex-col gap-2 p-2.5 rounded-lg border transition-all duration-200 ${isWeekendDay
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                        : 'bg-white border-slate-200'
                      }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex flex-col gap-0.5">
                        <div className={`font-bold text-xs uppercase tracking-wide ${isWeekendDay ? 'text-amber-800' : 'text-slate-800'
                          }`}>
                          {dayName}
                        </div>
                        <div className={`text-[10px] font-medium ${isWeekendDay ? 'text-amber-700' : 'text-slate-600'
                          }`}>
                          {dateNum}
                        </div>
                      </div>
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-[10px] ${isWeekendDay
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-indigo-100 text-indigo-700'
                        }`}>
                        {dayVendors.length}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 min-h-[80px] max-h-[350px] overflow-y-auto pr-1">
                      {(() => {
                        const isSpareVendor = (vendor: Vendor) =>
                          Number(vendor.vendorTypeId ?? 0) === 7;
                        const spareVendors = dayVendors.filter(isSpareVendor);
                        const regularVendors = dayVendors.filter((vendor) => !isSpareVendor(vendor));

                        const sortVendorsWithDayOffFirst = (inputVendors: Vendor[]) => {
                          // OFF (day off) já foram filtrados em dayVendors; aqui só ordenamos alfabeticamente
                          const sorted = [...inputVendors];
                          sorted.sort((a, b) => {
                            const nameA = a.fullName?.toLowerCase() || '';
                            const nameB = b.fullName?.toLowerCase() || '';
                            return nameA.localeCompare(nameB);
                          });
                          return sorted;
                        };

                        const renderVendorCards = (inputVendors: Vendor[], keyPrefix: string) =>
                          sortVendorsWithDayOffFirst(inputVendors).map((vendor) => {
                            const uniqueKey = `${keyPrefix}-${dateStr}-${vendor.userId}`;
                            const hasDayOff = dayOffEntries.some(
                              (entry) => entry.userId === vendor.userId && entry.date === dateStr
                            );

                            return (
                              <VendorAssignCard
                                key={uniqueKey}
                                vendor={vendor}
                                routes={routes}
                                dayLabel=""
                                statusLabel=""
                                draggable={true}
                                isOff={false}
                                onDragStart={(event) => {
                                  if (!hasDayOff) {
                                    handleVendorDragStart(event, vendor, dateStr);
                                  } else {
                                    event.preventDefault();
                                  }
                                }}
                                onDragEnd={cleanupDrag}
                              />
                            );
                          });

                        if (regularVendors.length === 0 && spareVendors.length === 0) {
                          return (
                            <div className="text-center text-xs text-slate-400 py-3 italic">
                              No vendors
                            </div>
                          );
                        }

                        return (
                          <>
                            {regularVendors.length > 0 && (
                              <div className="flex flex-col gap-2">
                                {renderVendorCards(regularVendors, "available-vendor")}
                              </div>
                            )}

                            <div className="mt-2 border-t border-slate-200 pt-2">
                              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                                Spare Vendors
                              </div>
                              {spareVendors.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                  {renderVendorCards(spareVendors, "spare-vendor")}
                                </div>
                              ) : (
                                <div className="text-center text-xs text-slate-400 py-2 italic">
                                  No spare vendors
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : uniqueVendors.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {uniqueVendors.map((vendor) => {
                const uniqueKey = `available-vendor-${vendor.userId}`;
                return (
                  <VendorAssignCard
                    key={uniqueKey}
                    vendor={vendor}
                    routes={routes}
                    dayLabel=""
                    statusLabel=""
                    draggable={true}
                    onDragStart={(event) => {
                      handleVendorDragStart(event, vendor);
                    }}
                    onDragEnd={cleanupDrag}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <UserCheck className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No vendors available</p>
              <p className="text-xs text-slate-500 mt-1">Try refreshing the page</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps: AvailableVendorsProps, nextProps: AvailableVendorsProps) => {
  // If vendors prop changes reference but has same length, don't re-render
  if (prevProps.vendors !== nextProps.vendors) {
    const prevLength = prevProps.vendors?.length ?? -1;
    const nextLength = nextProps.vendors?.length ?? -1;
    // If both are arrays with same length and same reference check, allow re-render
    // Otherwise, check other props
    if (prevLength !== nextLength) {
      return false; // Different lengths, need to re-render
    }
    // Same length, but check other critical props
  }

  // Check other props that should trigger re-render
  return (
    prevProps.routes === nextProps.routes &&
    prevProps.assignments === nextProps.assignments &&
    prevProps.date === nextProps.date &&
    prevProps.showWeekends === nextProps.showWeekends &&
    prevProps.isDailyView === nextProps.isDailyView &&
    prevProps.alignWithWeekPlanner === nextProps.alignWithWeekPlanner &&
    prevProps.vendors === nextProps.vendors // Same reference means same data
  );
};

export default memo(AvailableVendors, areEqual);



