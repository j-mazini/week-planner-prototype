"use client";

import React, { useState, memo, useCallback, useEffect, useLayoutEffect } from 'react';
import { Users } from 'lucide-react';
import AvailableVendors from './AvailableVendors';
import { useSidebar } from '@/components/ui/sidebar';
import type { Route } from '@/lib/api/routes';
import type { WeekPlannerRecord } from '../contexts/PlannerContext';
import type { DayOffEntry } from './DayOffModal';

interface VendorsDrawerProps {
  routes: Route[];
  assignments: WeekPlannerRecord[];
  date: string;
  showWeekends: boolean;
  dayOffEntries: DayOffEntry[];
  onVendorDragStart?: (userId: number) => void;
  isDailyView?: boolean;
  vendors?: Record<string, unknown>[] | null; // Pre-fetched vendors to avoid duplicate requests (null = not loaded yet, [] = loaded but empty)
}

/**
 * Horizontal drawer component for available vendors
 * Slides down from top and stays fixed when open
 */
const VendorsDrawer: React.FC<VendorsDrawerProps> = ({
  routes,
  assignments,
  date,
  showWeekends,
  dayOffEntries,
  onVendorDragStart,
  isDailyView = false,
  vendors,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { open: sidebarOpen, setOpen: setSidebarOpen, isMobile, setOpenMobile } = useSidebar();

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close sidebar when vendors drawer opens
  useEffect(() => {
    if (isOpen) {
      // Close the sidebar on both mobile and desktop
      if (isMobile) setOpenMobile(false);
      setSidebarOpen(false);
    }
  }, [isOpen, setSidebarOpen, isMobile, setOpenMobile]);

  // Close vendors drawer when sidebar opens (whenever sidebar is open, close the drawer)
  // useLayoutEffect guarantees synchronous execution before render
  useLayoutEffect(() => {
    if (sidebarOpen) {
      setIsOpen(false);
    }
  }, [sidebarOpen]);

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        className={`fixed top-4 right-4 z-[1031] flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] border border-[rgba(99,102,241,0.4)] rounded-lg shadow-[0_4px_16px_rgba(99,102,241,0.4),0_2px_8px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer transition-all duration-300 backdrop-blur-[8px] text-white text-[0.875rem] font-semibold hover:shadow-[0_6px_20px_rgba(99,102,241,0.5),0_4px_12px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-[2px] hover:bg-gradient-to-br hover:from-[#4f46e5] hover:via-[#6d28d9] hover:to-[#7c3aed] active:translate-y-0 ${isOpen ? 'bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d] border-[rgba(34,197,94,0.5)] shadow-[0_4px_16px_rgba(34,197,94,0.4),0_2px_8px_rgba(34,197,94,0.3)]' : ''} max-md:top-2 max-md:right-2 max-md:px-3 max-md:py-2 max-md:text-[0.75rem] max-[720px]:left-4 max-[720px]:right-auto`}
        onClick={handleToggle}
        aria-label={isOpen ? "Close vendors panel" : "Open vendors panel"}
        title="Available Vendors"
      >
        <Users className="w-5 h-5" />
        <span className="text-[0.875rem] font-semibold whitespace-nowrap max-md:text-[0.75rem]">
          {isOpen ? 'Hide' : 'Show'} Vendors
        </span>
      </button>

      {/* Horizontal drawer panel - fixed at top when open */}
      <div
        className={`fixed top-0 left-[calc(10%+1px)] right-[10%] w-[calc(80%-1px)] z-[1020] bg-gradient-to-br from-white/98 via-[rgba(239,244,255,0.96)] to-[rgba(230,245,255,0.95)] border-b border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] flex flex-col transition-all [transition-duration:400ms] backdrop-blur-[12px] overflow-hidden ${
          isOpen 
            ? 'max-h-[50vh] opacity-100 border-b-[#e3e8ef] translate-y-0 max-md:max-h-[45vh]' 
            : 'max-h-0 opacity-0 border-b-transparent -translate-y-full'
        }`}
      >
        {/* Drawer header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b border-[#e3e8ef] bg-white/50 flex-shrink-0 transition-opacity duration-300 ${isOpen ? 'opacity-100 delay-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-3 flex-1">
            <Users className="w-5 h-5" />
            <h3 className="text-[0.95rem] font-semibold text-[#1e293b] m-0">Available Vendors</h3>
          </div>
        </div>

        {/* Drawer content - align with week planner: same max-width and padding as page */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden py-3 min-h-0 transition-opacity duration-300 ${isOpen ? 'opacity-100 delay-150' : 'opacity-0'} w-full max-w-[1600px] mx-auto px-2 md:px-4 [&_.available-vendors-container]:m-0 [&_.available-vendors-container]:max-h-none [&_.available-vendors-container]:h-auto [&_.available-vendors-container]:border-0 [&_.available-vendors-container]:shadow-none [&_.available-vendors-container]:bg-transparent [&_.available-vendors-header]:hidden [&_.available-vendors-content]:max-h-[calc(50vh-100px)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black/5 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-[rgba(99,102,241,0.3)] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-[rgba(99,102,241,0.5)]`}>
          <AvailableVendors
            alignWithWeekPlanner={true}
            routes={routes}
            assignments={assignments}
            date={date}
            showWeekends={showWeekends}
            dayOffEntries={dayOffEntries}
            onVendorDragStart={onVendorDragStart}
            isDailyView={isDailyView}
            vendors={vendors}
          />
        </div>
      </div>
    </>
  );
};

VendorsDrawer.displayName = 'VendorsDrawer';

export default memo(VendorsDrawer);

