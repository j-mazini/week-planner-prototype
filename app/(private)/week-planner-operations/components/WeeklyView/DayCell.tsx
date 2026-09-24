"use client";

import React from 'react';
import { formatDate } from '../../utils/dateUtils';
import { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Route } from '@/lib/api/routes';
import type { Vendor } from '@/lib/vendors';
import VendorCard from '../Common/VendorCard';
import { useDragAndDrop, type DragItem } from '../../hooks/useDragAndDrop';
import VrnPlate from '@/components/vrn-plate';

type DayCellProps = {
  route: Route;
  date: Date;
  isWeekend: boolean;
  assignments: WeekPlannerRecord[];
  vendors: Vendor[];
  routes: Route[];
  onEditAssignment: (assignment: WeekPlannerRecord) => void;
  onDrop: (data: DragItem, routeId: number, dateStr: string, e: React.DragEvent) => void;
  draggedItem?: DragItem | null;
  draggedFromCell?: HTMLElement | null;
  onDragStart?: (e: React.DragEvent, data: DragItem, cell: HTMLElement) => void;
};

const DayCell: React.FC<DayCellProps> = ({
  route,
  date,
  isWeekend,
  assignments,
  vendors,
  routes,
  onEditAssignment,
  onDrop,
  draggedItem,
  draggedFromCell,
  onDragStart,
}) => {
  const { handleDragOver, handleDragLeave, handleDrop: handleDropInternal, cleanupDrag } = useDragAndDrop();

  const dateStr = formatDate(date, 'yyyy-mm-dd');
  const assignmentsInCell = assignments.filter(
    (a) => {
      const routeMatch =
        String(a.route) === String(route.routeId) ||
        String(a.route) === String(route.routeDefaultId) ||
        a.route === route.routeName ||
        (a.raw?.route as { routeId?: number } | undefined)?.routeId === route.routeId;
      return routeMatch && a.date === dateStr;
    }
  );

  const handleCellDrop = (data: DragItem, e: React.DragEvent) => {
    onDrop(data, route.routeId || 0, dateStr, e);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    const cell = e.currentTarget.closest('.day-cell') as HTMLElement;
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
  };

  const handleDragStart = (e: React.DragEvent, data: DragItem) => {
    const cell = e.currentTarget.closest('.day-cell') as HTMLElement;
    if (onDragStart && cell) {
      onDragStart(e, data, cell);
    }
    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (_e: React.DragEvent) => {
    cleanupDrag();
  };

  return (
    <div
      className={`day-cell ${isWeekend ? 'weekend' : ''}`}
      data-route-id={route.routeId}
      data-date={dateStr}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDropInternal(e, handleCellDrop)}
    >
      {assignmentsInCell.length > 0 ? (
        assignmentsInCell.map((assignment) => {
          // Try multiple ways to find the vendor
          const vendor = vendors.find(
            (d) => 
              d.userId === Number(assignment.name) || 
              d.fullName === assignment.name ||
              d.fullName?.toLowerCase() === assignment.name?.toLowerCase() ||
              (assignment.raw?.vendor as { userId?: number; fullName?: string } | undefined)?.userId === d.userId ||
              (assignment.raw?.vendor as { userId?: number; fullName?: string } | undefined)?.fullName === d.fullName
          );
          
          return vendor ? (
            <VendorCard
              key={assignment.weekPlannerId}
              vendor={vendor}
              assignment={assignment}
              routes={routes}
              onEdit={onEditAssignment}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ) : (
            // Fallback: show assignment even if vendor not found
            <div
              key={assignment.weekPlannerId}
              className="vendor-card"
              onClick={() => onEditAssignment(assignment)}
              title={`${assignment.name} - Click to edit`}
            >
              <div className="card-top">
                <span className="vendor-name">{assignment.name || 'Unknown Vendor'}</span>
              </div>
              <span className="vrn">
                <VrnPlate
                  vrn={assignment.registrationPlate || 'No VRN'}
                  size="sm"
                  showBadge={true}
                />
              </span>
            </div>
          );
        })
      ) : (
        <div className="empty-slot" style={{
          fontSize: '0.7rem',
          color: '#94a3b8',
          textAlign: 'center',
          padding: '1rem',
          fontStyle: 'italic',
        }}>
          -
        </div>
      )}
    </div>
  );
};

export default DayCell;


