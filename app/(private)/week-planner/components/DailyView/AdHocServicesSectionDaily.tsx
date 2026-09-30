"use client";

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { formatDate, isWeekend } from '../../utils/dateUtils';
import type { Route } from '@/lib/api/routes';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Vendor } from '@/lib/vendors';
import RouteLabel from '../Common/RouteLabel';
import DayCell from '../WeeklyView/DayCell';
import { getOrganizedRoutes, filterAdHocRoutesByDepot } from '../../utils/routeOrganizationUtils';
import AdHocServiceModal from '../modals/AdHocServiceModal';
import type { DragItem } from '../../hooks/useDragAndDrop';

export interface AdHocServicesSectionDailyProps {
  depotKey: string;
  depotName: string;
  date: Date;
  data: {
    assignments: WeekPlannerRecord[];
    routes: Route[];
    vendors: Vendor[];
  };
  onDrop: (e: React.DragEvent<HTMLDivElement>, routeId: number, dateStr: string) => void;
  onEdit: (assignment: WeekPlannerRecord) => void;
  draggedItem: DragItem | null;
  draggedFromCell: HTMLElement | null;
  onDragStart: (e: React.DragEvent, data: DragItem, cell: HTMLElement) => void;
  onAddAdHocService?: (service: { name: string; type: string; depot: string }) => void;
  onSwitchWeekPlanner?: (
    weekPlannerId: number,
    type: 'date' | 'route',
    direction: 'prev' | 'next',
    currentDate?: string,
    currentRouteId?: number
  ) => Promise<void>;
  onRemoveVendorFromRoute?: (weekPlannerId: number) => Promise<void>;
  onRemoveVendorFromWeek?: (userId: number, weekStartDate: string) => Promise<void>;
  weekStartDate?: string;
}

const adhocServiceTypes = [
  { value: 'cmp_unload', label: 'CMP Unload' },
  { value: 'flyer_sort', label: 'Flyer Sort' },
  { value: 'boat', label: 'Boat' },
  { value: 'pre9_delivery', label: 'Pre-9 Delivery' },
];

const AdHocServicesSectionDaily: React.FC<AdHocServicesSectionDailyProps> = ({
  depotKey,
  depotName,
  date,
  data,
  onDrop,
  onEdit,
  draggedItem,
  draggedFromCell,
  onDragStart,
  onAddAdHocService,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter ad-hoc routes for this depot
  const adHocRoutes = filterAdHocRoutesByDepot(data.routes, depotKey);
  const organized = getOrganizedRoutes(adHocRoutes, true);
  
  const isWeekendDay = isWeekend(date);
  const dateForDisplay = formatDate(date, 'dd/mm');

  const handleAddService = (service: { name: string; type: string; depot: string }) => {
    if (onAddAdHocService) {
      onAddAdHocService(service);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="w-full mt-4">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-xs font-bold text-orange-600 mb-0" style={{ lineHeight: '1.1' }}>
            AD-HOC Services
          </h2>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
            title="Add new ADHOC service"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
        <div className="h-0.5 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
      </div>

      {/* Grid Container - Same structure as DailyView routes */}
      <div className="w-full max-w-full overflow-hidden relative min-w-0 [contain:layout_style]">
        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-0 items-stretch border border-slate-300/20 rounded-lg overflow-hidden bg-white shadow-sm min-w-0 [contain:layout_style]">
          {/* Header Row */}
          <div className="px-3 py-2 text-[0.7rem] font-bold text-center border-r border-slate-300/20 border-b border-slate-300/20 bg-gradient-to-br from-orange-500 to-orange-600 text-white h-[30px] min-h-[30px] max-h-[30px] flex items-center justify-center uppercase tracking-[0.05em]">
            <span className="text-[0.75rem] font-bold tracking-[0.05em]">Route</span>
          </div>
          <div className={`px-3 py-2 text-[0.7rem] font-bold text-center border-b border-slate-300/20 bg-gradient-to-br from-slate-50 to-slate-100 h-[30px] min-h-[30px] max-h-[30px] flex flex-col items-center justify-center uppercase tracking-[0.05em] ${isWeekendDay ? 'from-amber-100 to-amber-200 text-amber-900' : 'text-slate-700'}`}>
            <span className="text-[0.68rem] font-bold">
              {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
            </span>
            <span className="text-[0.62rem] font-medium">{dateForDisplay}</span>
          </div>

          {/* Route Rows - CORE Routes */}
          {organized.core.map((route) => (
            <React.Fragment key={route.routeId}>
              <RouteLabel route={route} />
              <DayCell
                route={route}
                date={date}
                isWeekend={isWeekendDay}
                assignments={data.assignments}
                vendors={data.vendors}
                routes={data.routes}
                onEditAssignment={onEdit}
                onDrop={(data, routeId, dateStr, e) => {
                  onDrop(e as React.DragEvent<HTMLDivElement>, routeId, dateStr);
                }}
                draggedItem={draggedItem}
                draggedFromCell={draggedFromCell}
                onDragStart={(e, data, cell) => onDragStart(e, data, cell)}
              />
            </React.Fragment>
          ))}

          {/* FLEX Routes Header */}
          {organized.flex.length > 0 && (
            <>
              <div className="px-3 py-2 text-[0.7rem] font-semibold text-center border-r border-slate-300/20 border-b-2 border-b-orange-500 bg-gradient-to-r from-slate-50 to-slate-100 h-[30px] min-h-[30px] max-h-[30px] flex items-center justify-start">
                <span className="bg-orange-200 text-orange-900 px-2 py-1 rounded text-[0.75rem] font-semibold">
                  FLEX ROUTES
                </span>
              </div>
              <div className="border-b-2 border-b-orange-500 bg-gradient-to-r from-slate-50 to-slate-100 h-[30px] min-h-[30px] max-h-[30px]" />
            </>
          )}

          {/* Route Rows - FLEX Routes */}
          {organized.flex.map((route) => (
            <React.Fragment key={route.routeId}>
              <RouteLabel route={{ ...route, isFlex: true }} />
              <DayCell
                route={route}
                date={date}
                isWeekend={isWeekendDay}
                assignments={data.assignments}
                vendors={data.vendors}
                routes={data.routes}
                onEditAssignment={onEdit}
                onDrop={(data, routeId, dateStr, e) => {
                  onDrop(e as React.DragEvent<HTMLDivElement>, routeId, dateStr);
                }}
                draggedItem={draggedItem}
                draggedFromCell={draggedFromCell}
                onDragStart={(e, data, cell) => onDragStart(e, data, cell)}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Add Service Modal */}
      <AdHocServiceModal
        isOpen={isModalOpen}
        addOnly
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddService}
        depotKey={depotKey}
        depotName={depotName}
        serviceTypes={adhocServiceTypes}
      />
    </div>
  );
};

export default AdHocServicesSectionDaily;



