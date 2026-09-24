"use client";

import React from 'react';
import type { Vendor } from '@/lib/vendors';
import { WeekPlannerRecord } from '../../contexts/PlannerContext';
import type { Route } from '@/lib/api/routes';
import VrnPlate from '@/components/vrn-plate';

import { DragItem } from '../../hooks/useDragAndDrop';

type VendorCardProps = {
  vendor: Vendor;
  assignment: WeekPlannerRecord;
  routes: Route[];
  onEdit: (assignment: WeekPlannerRecord) => void;
  onDragStart?: (e: React.DragEvent, data: DragItem) => void;
  onDragEnd?: (e: React.DragEvent) => void;
};

const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  assignment,
  routes,
  onEdit,
  onDragStart,
  onDragEnd,
}) => {
  // Find route by ID or name
  const findRouteById = (routeIdOrName: string | number | undefined): Route | null => {
    if (!routeIdOrName) return null;
    
    const routeIdStr = String(routeIdOrName);
    
    // Check if it's an ad-hoc route
    if (routeIdStr.startsWith('adhoc_board_')) {
      return {
        routeId: 0,
        routeName: 'Ad-hoc',
        routeDefaultId: 0,
        category: 'ad_hoc',
      } as Route;
    }

    // Search in routes array
    const route = routes.find(
      (r) =>
        String(r.routeId) === routeIdStr ||
        String(r.routeDefaultId) === routeIdStr ||
        r.routeName === routeIdStr
    );

    return route || null;
  };

  const route = findRouteById(assignment.route);
  const category = (route as Route & { category?: string })?.category || '';
  const isManagementOrOther =
    category === 'management' ||
    (category && !['loop', 'rota', 'ad_hoc'].includes(category));

  const sortStatus = assignment.routeSort?.toLowerCase() || '';
  const statusInfo: Record<string, { label: string; class: string }> = {
    yes: { label: 'SORT', class: 'status-sort-yes' },
    no: { label: 'NO SORT', class: 'status-sort-no' },
    flyers: { label: 'FLYERS', class: 'status-sort-flyers' },
    cmp: { label: 'CMP', class: 'status-sort-cmp' },
    boat: { label: 'BOAT', class: 'status-sort-boat' },
    pre9: { label: 'PRE-9', class: 'status-sort-pre9' },
  };

  const status = statusInfo[sortStatus] || { label: 'N/A', class: '' };

  const notesText = (assignment.notes || '').trim();
  const hasNotes = notesText.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(assignment);
  };

  const handleDragStartCard = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, {
        type: 'card',
        id: assignment.weekPlannerId,
        assignmentId: assignment.weekPlannerId,
        userId: vendor.userId,
      });
    }
  };

  const handleDragEndCard = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  return (
    <div
      className="vendor-card"
      draggable="true"
      data-assignment-id={assignment.weekPlannerId}
      data-vendor-id={vendor.userId}
      onClick={handleClick}
      onDragStart={handleDragStartCard}
      onDragEnd={handleDragEndCard}
      title={hasNotes ? notesText : ''}
    >
      {isManagementOrOther ? (
        <>
          <div className="card-top">
            <span className="vendor-name">{vendor.fullName || assignment.name}</span>
            {hasNotes && (
              <span className="note-indicator" aria-label="Assignment notes">
                !
              </span>
            )}
          </div>
          <span className="vrn"></span>
        </>
      ) : (
        <>
          <div className="card-top">
            <span className="vendor-name">{vendor.fullName || assignment.name}</span>
            <div className="card-meta">
              {hasNotes && (
                <span className="note-indicator" aria-label="Assignment notes">
                  !
                </span>
              )}
              <span className={`sort-status-badge ${status.class}`}>
                {status.label}
              </span>
            </div>
          </div>
          <span className="vrn">
            <VrnPlate
              vrn={assignment.registrationPlate || 'No VRN'}
              size="sm"
              showBadge={true}
            />
          </span>
        </>
      )}
    </div>
  );
};

export default VendorCard;


