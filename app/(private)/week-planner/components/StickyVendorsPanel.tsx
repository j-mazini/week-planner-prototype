"use client";

import React, { memo } from 'react';
import VendorsDrawer from './VendorsDrawer';
import type { Route } from '@/lib/api/routes';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import type { DayOffEntry } from './DayOffModal';

interface StickyVendorsPanelProps {
  routes: Route[];
  assignments: WeekPlannerRecord[];
  date: string;
  showWeekends: boolean;
  dayOffEntries: DayOffEntry[];
  headerRef: React.RefObject<HTMLDivElement>;
  onVendorDragStart?: (userId: number) => void;
  isDailyView?: boolean;
  vendors?: Record<string, unknown>[] | null; // Pre-fetched vendors to avoid duplicate requests (null = not loaded yet, [] = loaded but empty)
}

/**
 * Vendors panel component with drawer functionality
 * 
 * Features:
 * - Collapsible drawer that slides in from the right
 * - Floating toggle button when collapsed
 * - Smooth animations and transitions
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <StickyVendorsPanel
 *   routes={routes}
 *   assignments={assignments}
 *   date={date}
 *   showWeekends={showWeekends}
 *   dayOffEntries={dayOffEntries}
 *   headerRef={headerRef}
 * />
 * ```
 */
const StickyVendorsPanel: React.FC<StickyVendorsPanelProps> = ({
  routes,
  assignments,
  date,
  showWeekends,
  dayOffEntries,
  headerRef: _headerRef,
  onVendorDragStart,
  isDailyView = false,
  vendors,
}) => {
  return (
    <VendorsDrawer
      routes={routes}
      assignments={assignments}
      date={date}
      showWeekends={showWeekends}
      dayOffEntries={dayOffEntries}
      onVendorDragStart={onVendorDragStart}
      isDailyView={isDailyView}
      vendors={vendors}
    />
  );
};

StickyVendorsPanel.displayName = 'StickyVendorsPanel';

export default memo(StickyVendorsPanel);

