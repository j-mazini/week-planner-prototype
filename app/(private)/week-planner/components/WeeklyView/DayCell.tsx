"use client";

import React from 'react';
import { formatDate } from '../../utils/dateUtils';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Route } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import VendorCard from '../Common/VendorCard';
import VrnPlate from '@/components/vrn-plate';
import { useDragAndDrop, type DragItem } from '../../hooks/useDragAndDrop';

type DayCellProps = {
  route: Route;
  date: Date;
  isWeekend: boolean;
  assignments: WeekPlannerRecord[];
  assignmentsInCellOverride?: WeekPlannerRecord[];
  vendors: Vendor[];
  routes: Route[];
  onEditAssignment: (assignment: WeekPlannerRecord) => void;
  onDrop: (data: DragItem, routeId: number, dateStr: string, e: React.DragEvent) => void;
  draggedItem?: DragItem | null;
  draggedFromCell?: HTMLElement | null;
  onDragStart?: (e: React.DragEvent, data: DragItem, cell: HTMLElement) => void;
  onQuickAdd?: (routeId: number, dateStr: string) => void;
  showQuickAddButton?: boolean;
  quickAddLabel?: string;
  quickAddClassName?: string;
  allowFlexibleCellHeight?: boolean;
  /** Calculated row height for uniform cell heights in a row (when flexible height is enabled) */
  rowHeight?: number;
};

const DayCell: React.FC<DayCellProps> = ({
  route,
  date,
  isWeekend,
  assignments,
  assignmentsInCellOverride,
  vendors,
  routes,
  onEditAssignment,
  onDrop,
  draggedItem,
  draggedFromCell,
  onDragStart,
  onQuickAdd,
  showQuickAddButton = true,
  quickAddLabel,
  quickAddClassName,
  allowFlexibleCellHeight = false,
  rowHeight,
}) => {
  const { handleDragOver, handleDragLeave, handleDrop: handleDropInternal, cleanupDrag } = useDragAndDrop();

  const dateStr = formatDate(date, 'yyyy-mm-dd');
  const assignmentsInCell = (assignmentsInCellOverride ?? assignments).filter((a) => {
    const assignmentDate = String(a.date || '').split('T')[0];
    if (assignmentsInCellOverride) return assignmentDate === dateStr;
    const raw = (a.raw ?? {}) as Record<string, unknown>;
    const rawRouteObj = raw.route && typeof raw.route === 'object'
      ? (raw.route as Record<string, unknown>)
      : null;
    const assignmentRouteId = raw.routeId ?? rawRouteObj?.routeId;
    const assignmentRouteDefaultId = raw.routeDefaultId ?? rawRouteObj?.routeDefaultId;
    // Show assignment only in the row whose routeId equals the assignment's routeId (avoids showing in route_defaultId-only rows)
    const routeMatch =
      (assignmentRouteId != null && Number(assignmentRouteId) === Number(route.routeId)) ||
      (assignmentRouteId == null && assignmentRouteDefaultId != null && Number(assignmentRouteDefaultId) === Number(route.routeId));
    return routeMatch && assignmentDate === dateStr;
  });

  const handleCellDrop = (data: DragItem, e: React.DragEvent) => {
    // For routeId 55 (BRTE/ADHOC Services), include depositId, depositName, and adhocServiceId in the data
    if (route.routeId === 55 && route.depositId) {
      const routeWithExtras = route as Route & { depositName?: string; adhocServiceId?: number };
      let depositName: string | undefined = undefined;
      if (routeWithExtras.depositName) {
        depositName = routeWithExtras.depositName;
      } else {
        try {
          const cellElement = e.currentTarget as HTMLElement;
          const adhocSectionContainer = cellElement.closest('[data-deposit-name]') as HTMLElement | null;
          if (adhocSectionContainer) {
            depositName = adhocSectionContainer.getAttribute('data-deposit-name') || undefined;
          }
        } catch (err) {
          console.warn('[DayCell] Error reading depositName from parent container:', err);
        }
      }
      const adhocServiceId = routeWithExtras.adhocServiceId;
      const enhancedData = {
        ...data,
        depositId: route.depositId,
        depositName: depositName,
        ...(adhocServiceId != null && Number.isFinite(adhocServiceId) ? { adhocServiceId } : {}),
      };
      e.dataTransfer.setData('application/json', JSON.stringify(enhancedData));
      onDrop(enhancedData, route.routeId || 0, dateStr, e);
    } else {
      onDrop(data, route.routeId || 0, dateStr, e);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    const cell = e.currentTarget.closest('[data-day-cell]') as HTMLElement;
    if (!cell) return;

    // Don't activate drag-over on the same cell for cards
    if (draggedItem?.type === 'card' && cell === draggedFromCell) {
      return;
    }

    // Don't allow "OFF" vendors
    if (draggedItem?.type === 'off' && draggedItem.status === 'off') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragStart = (e: React.DragEvent, data: DragItem) => {
    const cell = e.currentTarget.closest('[data-day-cell]') as HTMLElement;
    if (onDragStart && cell) {
      onDragStart(e, data, cell);
    }
    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.currentTarget.classList.add('dragging', 'opacity-60', 'scale-[1.05]', 'rotate-[1deg]', 'z-[1000]', 'shadow-lg');
  };

  const handleDragEnd = () => {
    cleanupDrag();
  };

  // When rowHeight is provided, use it for uniform row heights; otherwise use default flexible/fixed logic
  // When allowFlexibleCellHeight is true, allow the cell to grow naturally without scroll
  const cellHeightStyle = rowHeight ? { minHeight: `${rowHeight}px` } : undefined;
  const cellHeightClasses = allowFlexibleCellHeight
    ? 'min-h-[60px] p-1.5 gap-1.5' // No max-height or overflow - cell expands to fit all content
    : 'min-h-[60px] h-[60px] max-h-[60px] p-1 gap-1 overflow-hidden';

  return (
    <div
      className={[
        'relative flex flex-col box-border transition-colors duration-200',
        cellHeightClasses,
        'border-r border-b border-border/60 bg-white',
        'hover:bg-slate-50',
        'last:border-r-0',
        isWeekend ? 'bg-amber-50' : '',
      ].join(' ')}
      style={cellHeightStyle}
      data-day-cell
      data-route-id={route.routeId}
      data-date={dateStr}
      {...(route.routeId === 55 && route.depositId ? {
        'data-deposit-id': route.depositId,
      } : {})}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDropInternal(e, handleCellDrop)}
    >
      {assignmentsInCell.length > 0 ? (
        <div
          className={[
            'flex flex-col w-full gap-1',
            allowFlexibleCellHeight ? 'h-auto overflow-visible' : 'h-full overflow-y-auto pr-0.5',
          ].join(' ')}
        >
          {assignmentsInCell.map((assignment, index) => {
          // Try multiple ways to find the vendor
          const vendor = vendors.find(
            (d) =>
              d.userId === Number(assignment.name) ||
              d.fullName === assignment.name ||
              d.fullName?.toLowerCase() === assignment.name?.toLowerCase() ||
              (assignment.raw?.vendor as Record<string, unknown> | undefined)?.userId === d.userId ||
              (assignment.raw?.vendor as Record<string, unknown> | undefined)?.fullName === d.fullName
          );

          // Generate unique key: use weekPlannerId if > 0, otherwise use combination of fields
          const uniqueKey = assignment.weekPlannerId > 0
            ? assignment.weekPlannerId
            : `temp-${dateStr}-${route.routeId}-${(assignment.raw as Record<string, unknown>)?.userId || assignment.name}-${index}`;

          // Task 2: itens com adhoc service is_adhoc_sort = true não exibem veículo (NOVEHICLE placeholder).
          const adhocSvcObj = assignment.raw?.adhocService && typeof assignment.raw.adhocService === 'object'
            ? (assignment.raw.adhocService as Record<string, unknown>)
            : null;
          const isAdhocSortAssignment =
            adhocSvcObj?.isAdhocSort === true ||
            (assignment.raw as Record<string, unknown>)?.isAdhocSort === true;

            return vendor ? (
              <VendorCard
                key={uniqueKey}
                vendor={vendor}
                assignment={assignment}
                routes={routes}
                onEdit={onEditAssignment}
                onDragStart={(e, data) => handleDragStart(e, data as DragItem)}
                onDragEnd={handleDragEnd}
              />
            ) : (
              // Fallback: show assignment even if vendor not found
              <div
                key={uniqueKey}
                className="flex w-full flex-shrink-0 min-h-[48px] items-center justify-between gap-2 rounded-md border border-indigo-500/25 bg-indigo-500/10 px-2 py-1.5 text-xs shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/35 hover:bg-indigo-500/15 hover:shadow-md dark:border-indigo-400/25 dark:bg-indigo-400/10"
                onClick={() => onEditAssignment(assignment)}
                title={`${assignment.name} - Click to edit`}
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{assignment.name || 'Unknown Vendor'}</span>
                </div>
                {!isAdhocSortAssignment && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium px-1.5 py-0.5 bg-background/60 rounded text-xs inline-flex items-center">
                  <VrnPlate
                    vrn={
                      assignment.registrationPlate ||
                      (assignment.raw?.registration_plate ? String(assignment.raw.registration_plate) : '') ||
                      (assignment.raw?.vehicleRegistration_plate ? String(assignment.raw.vehicleRegistration_plate) : '') ||
                      (assignment.raw?.vehicleRegistrationPlate ? String(assignment.raw.vehicleRegistrationPlate) : '') ||
                      (assignment.raw?.vehicleDefaultRegistrationPlate ? String(assignment.raw.vehicleDefaultRegistrationPlate) : '') ||
                      (assignment.raw?.vehicle_default_registrationPlate ? String(assignment.raw.vehicle_default_registrationPlate) : '') ||
                      (assignment.raw?.registration_plates ? String(assignment.raw.registration_plates) : '') ||
                      (assignment.raw?.vehicle && typeof assignment.raw.vehicle === 'object'
                        ? String((assignment.raw.vehicle as Record<string, unknown>).vehicleRegistration_plate ||
                          (assignment.raw.vehicle as Record<string, unknown>).vehicleRegistrationPlate ||
                          (assignment.raw.vehicle as Record<string, unknown>).vehicleDefaultRegistrationPlate ||
                          (assignment.raw.vehicle as Record<string, unknown>).vehicle_default_registrationPlate ||
                          (assignment.raw.vehicle as Record<string, unknown>).registration_plate ||
                          (assignment.raw.vehicle as Record<string, unknown>).registrationPlate ||
                          (assignment.raw.vehicle as Record<string, unknown>).registrationPlate || '')
                        : '') ||
                      (Number(assignment.raw?.vehicleId ?? assignment.raw?.vehicleId ?? 0) === 55 ? 'NOVEHICLE' : undefined) ||
                      undefined
                    }
                    size="sm"
                    showBadge={false}
                  />
                </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full min-h-[52px] text-[0.68rem] text-muted-foreground/80 italic text-center p-2">
          {onQuickAdd ? (
            showQuickAddButton !== false ? (
              <button
                type="button"
                className={
                  quickAddClassName ||
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickAdd(route.routeId || 0, dateStr);
                }}
                title={quickAddLabel || "Open"}
              >
                {quickAddLabel || "Open"}
              </button>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center cursor-pointer select-none rounded-md hover:bg-emerald-500/10 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickAdd(route.routeId || 0, dateStr);
                }}
                title="Open"
              >
                -
              </div>
            )
          ) : (
            "-"
          )}
        </div>
      )}
    </div>
  );
};

export default DayCell;




