/**
 * Drag and Drop utility functions
 */

import type { Assignment, Vendor } from '../types/planner';

export interface DragItem {
  type: 'assignment' | 'vendor';
  data: Assignment | Vendor;
  fromRouteId?: number;
  fromDate?: string;
}

export function createDragItem(
  type: 'assignment' | 'vendor',
  data: Assignment | Vendor,
  fromRouteId?: number,
  fromDate?: string
): DragItem {
  return {
    type,
    data,
    fromRouteId,
    fromDate,
  };
}

export function isAssignment(item: DragItem): item is { type: 'assignment'; data: Assignment } {
  return item.type === 'assignment';
}

export function isVendor(item: DragItem): item is { type: 'vendor'; data: Vendor } {
  return item.type === 'vendor';
}

export function getDragDataString(item: DragItem): string {
  return JSON.stringify(item);
}

export function parseDragDataString(dataStr: string): DragItem | null {
  try {
    return JSON.parse(dataStr) as DragItem;
  } catch {
    return null;
  }
}


