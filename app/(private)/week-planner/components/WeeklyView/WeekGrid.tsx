"use client";

import React, { memo } from 'react';
import { formatDate, isWeekend } from '../../utils/dateUtils';
import type { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Route } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import type { DragItem } from '../../hooks/useDragAndDrop';
import DayCell from './DayCell';
import RouteLabel from '../Common/RouteLabel';
import { isFlexRoute } from '../../utils/depotOrganizationUtils';
import { BUSINESS_RULES } from '@/src/constants/businessRules';

const BASE_CELL_HEIGHT = 60;
const CARD_HEIGHT = 40;
const CARD_GAP = 6;
const CELL_PADDING = 12;

type WeekGridProps = {
  weekDates: Date[];
  showWeekends: boolean;
  routes: Route[];
  assignmentsByDate: Map<string, WeekPlannerRecord[]>;
  vendors: Vendor[];
  allRoutes: Route[];
  onEdit: (assignment: WeekPlannerRecord) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, routeId: number, dateStr: string) => void;
  draggedItem?: DragItem | null;
  draggedFromCell?: HTMLElement | null;
  onDragStart?: (e: React.DragEvent, data: DragItem, cell: HTMLElement) => void;
  onRemoveFlexRoute?: (routeId: number) => void;
  onRemoveAdHoc?: (routeId: number) => void;
  onQuickAdd?: (routeId: number, dateStr: string) => void;
  quickAddLabel?: string;
  quickAddClassName?: string;
  showQuickAddButton?: boolean;
  getAssignmentsInCell?: (route: Route, dateStr: string, assignmentsForDay: WeekPlannerRecord[]) => WeekPlannerRecord[];
  renderRouteLabel?: (args: { route: Route; isFlex: boolean; isAdHoc: boolean }) => React.ReactNode;
  headerBg?: string;
  headerText?: string;
  emptyMessage?: string;
  /** Supervisor assignment per date (yyyy-mm-dd) for the depot - shown as a fixed row when provided */
  supervisorByDate?: Map<string, WeekPlannerRecord>;
  /** Deposit name shown in the supervisor row label */
  depositName?: string;
  /** Called when user clicks Add in the supervisor row to add supervisor to this deposit */
  onAddSupervisor?: () => void;
  allowFlexibleCellHeight?: boolean;
};

const WeekGrid = memo<WeekGridProps>(({
  weekDates,
  showWeekends,
  routes,
  assignmentsByDate,
  vendors,
  allRoutes,
  onEdit,
  onDrop,
  draggedItem,
  draggedFromCell,
  onDragStart,
  onRemoveFlexRoute,
  onRemoveAdHoc,
  onQuickAdd,
  quickAddLabel,
  quickAddClassName,
  showQuickAddButton,
  getAssignmentsInCell,
  renderRouteLabel,
  headerBg: _headerBg = 'from-indigo-600 to-indigo-700',
  headerText = 'Route',
  emptyMessage = 'No routes available',
  supervisorByDate,
  depositName,
  onAddSupervisor: _onAddSupervisor,
  allowFlexibleCellHeight = false,
}) => {
  // Responsividade:
  // - Mobile: colunas com largura fixa + scroll horizontal no container
  // - Desktop: colunas fluidas (1fr) e sem scroll
  // - Hide weekends: 5 colunas (Mon-Fri) para evitar layout quebrado
  const gridCols = showWeekends
    ? 'grid-cols-[140px_repeat(7,160px)] md:grid-cols-[120px_repeat(7,minmax(0,1fr))]'
    : 'grid-cols-[140px_repeat(5,minmax(120px,1fr))] md:grid-cols-[120px_repeat(5,minmax(0,1fr))]';

  return (
    <div className="w-full overflow-x-auto md:overflow-visible pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div
        className={[
          "grid gap-0 items-stretch border border-slate-200 rounded-lg bg-white shadow-sm text-sm",
          // No overflow-hidden so sticky works relative to the scroll container (DepositSection)
          "w-max min-w-full md:w-full",
          "[&>*]:min-w-0",
          gridCols,
        ].join(" ")}
      >
        {/* Team Leader row - estilização alinhada ao grid (slate) */}
        {supervisorByDate && (
          <>
            {/* Label "Team Leader - <DepotName>" — alinhado ao Management and Support (sky) */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-3 py-2 bg-white border-r border-b border-slate-200 font-semibold text-xs h-[60px] box-border transition-colors duration-200 relative overflow-hidden min-w-0 last:border-r-0">
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                <span className="whitespace-nowrap overflow-hidden text-ellipsis font-semibold text-slate-900 text-xs leading-tight">
                  Team Leader
                </span>
                {depositName && (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                    {depositName}
                  </span>
                )}
              </div>
            </div>

            {/* Células dos dias — mesma estilização do Management and Support */}
            {weekDates.map((d, i) => {
              const isWeekendDay = isWeekend(d);
              const dateStr = formatDate(d, 'yyyy-mm-dd');
              const assignment = supervisorByDate.get(dateStr);
              const name = assignment?.name || '';
              return (
                <div
                  key={i}
                  className={[
                    'sticky top-0 z-20 relative flex flex-col overflow-hidden box-border transition-colors duration-200',
                    'min-h-[60px] h-[60px] max-h-[60px] p-1 gap-1',
                    'border-r border-b border-blue-200/30 bg-white last:border-r-0',
                    'hover:bg-blue-50',
                    isWeekendDay ? 'bg-amber-50' : '',
                  ].join(' ')}
                >
                  {name ? (
                    <div
                      className={[
                        'w-full flex-1 flex flex-col justify-center items-start rounded-lg border cursor-pointer',
                        'bg-blue-100 border-blue-300 shadow-sm transition-all duration-200 hover:bg-blue-200 hover:border-blue-400',
                        'text-[0.65rem] px-1 py-0.5',
                      ].join(' ')}
                      title={`${name} - Click to edit`}
                      onClick={() => onEdit(assignment!)}
                    >
                      <span className="font-semibold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis w-full min-w-0">
                        {name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[0.7rem] text-slate-400 italic text-center pointer-events-none">
                      -
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Header Row - ROUTE e dias da semana; fundo branco sólido para evitar conteúdo por trás ao scroll */}
        <div className={`sticky z-20 px-3 py-2 text-xs font-semibold text-center bg-white border-r border-slate-200 border-b border-slate-200 text-slate-800 uppercase tracking-wider h-10 min-h-[40px] flex items-center justify-center shadow-sm ${supervisorByDate ? 'top-[60px]' : 'top-0'}`}>
          <span className="text-xs font-bold">{headerText}</span>
        </div>

        {weekDates.map((d, i) => {
          const isWeekendDay = isWeekend(d);
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
          const dateNum = formatDate(d, 'dd/mm');
          return (
            <div
              key={i}
              className={`sticky z-20 px-3 py-2 text-xs font-semibold text-center border-r border-slate-200 border-b border-slate-200 uppercase tracking-wider h-10 min-h-[40px] flex flex-col gap-0.5 items-center justify-center shadow-sm bg-white ${supervisorByDate ? 'top-[60px]' : 'top-0'} ${isWeekendDay ? 'text-amber-900' : 'text-slate-700'
                }`}
            >
              <span className={`text-xs font-bold ${isWeekendDay ? 'text-amber-900' : 'text-slate-900'}`}>
                {dayName}
              </span>
              <span className={`text-[10px] font-medium ${isWeekendDay ? 'text-amber-700' : 'text-slate-600'}`}>
                {dateNum}
              </span>
            </div>
          );
        })}

        {/* Route Rows */}
        {routes.length > 0 ? (
          routes.map((route, idx) => {
            const routeAsRoute: Route = {
              ...route, // Preserve all properties like adhocServiceId
            };

            // Detect if it's a flex route or adhoc
            const routeIsFlex = isFlexRoute(routeAsRoute);
            const routeNameLower = String(route.routeName || "").toLowerCase();
            const isAdHoc = routeNameLower.includes("adhoc") ||
              routeNameLower.includes("ad-hoc") ||
              route.routeId === BUSINESS_RULES.ROUTE.BRTE ||
              route.routeId === BUSINESS_RULES.ROUTE.DHOC;

            const rowKey = (route as Route & { adhocServiceId?: number }).adhocServiceId != null
              ? `adhoc-${(route as Route & { adhocServiceId?: number }).adhocServiceId}`
              : `route-${route.routeId ?? `fallback-${idx}`}`;

            // Calculate max assignments count across all days for this row (when flexible height is enabled)
            let maxAssignmentsInRow = 1;
            if (allowFlexibleCellHeight) {
              weekDates.forEach((dayDate) => {
                const dateStr = formatDate(dayDate, 'yyyy-mm-dd');
                const assignmentsForDay = assignmentsByDate.get(dateStr) || [];
                const assignmentsInCell = getAssignmentsInCell
                  ? getAssignmentsInCell(routeAsRoute, dateStr, assignmentsForDay)
                  : assignmentsForDay.filter((a) => {
                    const assignmentDate = String(a.date || '').split('T')[0];
                    const raw = (a.raw ?? {}) as Record<string, unknown>;
                    const rawRouteObj = raw.route && typeof raw.route === 'object'
                      ? (raw.route as Record<string, unknown>)
                      : null;
                    const assignmentRouteId = raw.routeId ?? rawRouteObj?.routeId;
                    const assignmentRouteDefaultId = raw.routeDefaultId ?? rawRouteObj?.routeDefaultId;
                    const routeMatch =
                      (assignmentRouteId != null && Number(assignmentRouteId) === Number(route.routeId)) ||
                      (assignmentRouteId == null && assignmentRouteDefaultId != null && Number(assignmentRouteDefaultId) === Number(route.routeId));
                    return routeMatch && assignmentDate === dateStr;
                  });
                maxAssignmentsInRow = Math.max(maxAssignmentsInRow, assignmentsInCell.length);
              });
            }

            // Calculate row height based on max assignments (minimum BASE_CELL_HEIGHT)
            // Formula: (cards * height) + (gaps between cards) + padding
            const rowHeight = allowFlexibleCellHeight && maxAssignmentsInRow > 1
              ? Math.max(BASE_CELL_HEIGHT, (maxAssignmentsInRow * CARD_HEIGHT) + ((maxAssignmentsInRow - 1) * CARD_GAP) + CELL_PADDING)
              : undefined;

            return (
              <React.Fragment key={rowKey}>
                {renderRouteLabel ? (
                  renderRouteLabel({ route: routeAsRoute, isFlex: routeIsFlex, isAdHoc })
                ) : (
                  <RouteLabel
                    route={{
                      ...routeAsRoute,
                      isFlex: routeIsFlex,
                      category: isAdHoc ? 'ad_hoc' : undefined,
                    }}
                    onRemoveFlexRoute={routeIsFlex ? onRemoveFlexRoute : undefined}
                    onRemoveAdHoc={isAdHoc ? onRemoveAdHoc : undefined}
                    allowFlexibleHeight={allowFlexibleCellHeight}
                    rowHeight={rowHeight}
                  />
                )}
                {weekDates.map((dayDate) => {
                  const isWeekendDay = isWeekend(dayDate);
                  const dateStr = formatDate(dayDate, 'yyyy-mm-dd');
                  const assignmentsForDay = assignmentsByDate.get(dateStr) || [];
                  const assignmentsInCellOverride = getAssignmentsInCell
                    ? getAssignmentsInCell(routeAsRoute, dateStr, assignmentsForDay)
                    : undefined;
                  return (
                    <DayCell
                      key={`${rowKey}-${dateStr}`}
                      route={routeAsRoute}
                      date={dayDate}
                      isWeekend={isWeekendDay}
                      assignments={assignmentsForDay}
                      assignmentsInCellOverride={assignmentsInCellOverride}
                      vendors={vendors}
                      routes={allRoutes}
                      onEditAssignment={onEdit}
                      onDrop={(data, routeId, dateStr, e) => {
                        onDrop(e as React.DragEvent<HTMLDivElement>, routeId, dateStr);
                      }}
                      draggedItem={draggedItem}
                      draggedFromCell={draggedFromCell}
                      onDragStart={onDragStart}
                      onQuickAdd={onQuickAdd}
                      showQuickAddButton={showQuickAddButton}
                      quickAddLabel={quickAddLabel}
                      quickAddClassName={quickAddClassName}
                      allowFlexibleCellHeight={allowFlexibleCellHeight}
                      rowHeight={rowHeight}
                    />
                  );
                })}
              </React.Fragment>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-slate-400 text-sm italic">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
});

WeekGrid.displayName = 'WeekGrid';

export default WeekGrid;



