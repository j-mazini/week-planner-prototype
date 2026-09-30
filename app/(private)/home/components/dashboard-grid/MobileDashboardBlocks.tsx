"use client";

import React, { useState, useCallback } from "react";
import { type LucideIcon, Truck, CalendarDays, BarChart3, ShieldCheck, Car, ChevronDown, Activity } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { DashboardWidgetId } from "../../types/dashboard-grid-types";

const BLOCK_CONFIG: { id: DashboardWidgetId; label: string; icon: LucideIcon }[] = [
  { id: "disco", label: "My deliveries", icon: Truck },
  { id: "dayview", label: "Day view", icon: CalendarDays },
  { id: "myperformance", label: "My Performance", icon: Activity },
  { id: "operations", label: "Operations", icon: BarChart3 },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "vehicles", label: "Vehicles", icon: Car },
];

export interface MobileDashboardBlocksProps {
  widgets: Record<DashboardWidgetId, React.ReactNode>;
}

export function MobileDashboardBlocks({ widgets }: MobileDashboardBlocksProps) {
  const [openId, setOpenId] = useState<DashboardWidgetId | null>("disco");

  const handleOpenChange = useCallback((id: DashboardWidgetId, open: boolean) => {
    setOpenId(open ? id : null);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {BLOCK_CONFIG.map(({ id, label, icon: Icon }) => (
        <Collapsible
          key={id}
          open={openId === id}
          onOpenChange={(open) => handleOpenChange(id, open)}
          className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden"
        >
          <CollapsibleTrigger
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100/80 text-left hover:from-slate-100/80 hover:to-slate-50/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset"
            aria-expanded={openId === id}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5" aria-hidden />
            </div>
            <span className="flex-1 font-semibold text-slate-800 text-[15px]">{label}</span>
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 transition-transform duration-200 ${
                openId === id ? "rotate-180 bg-blue-100 text-blue-600" : "bg-slate-100"
              }`}
              aria-hidden
            >
              <ChevronDown className="w-5 h-5" />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="min-h-[280px] max-h-[72vh] overflow-auto bg-slate-50/50 p-2 sm:p-3 [&>section]:min-h-[240px]">
              {widgets[id]}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
