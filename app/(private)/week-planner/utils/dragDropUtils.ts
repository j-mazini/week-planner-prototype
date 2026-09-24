/**
 * Utility functions for drag and drop operations
 */

export type DragData = {
  type: 'vendor' | 'assignment';
  id: number | string;
  data?: unknown;
};

/**
 * Serialize drag data to JSON string
 */
export const serializeDragData = (data: DragData): string => {
  return JSON.stringify(data);
};

/**
 * Deserialize drag data from JSON string
 */
export const deserializeDragData = (json: string): DragData | null => {
  try {
    return JSON.parse(json) as DragData;
  } catch (error) {
    console.error('Error deserializing drag data:', error);
    return null;
  }
};

/**
 * Check if a drop target is valid for the dragged item
 */
export const isValidDropTarget = (
  _draggedItem: DragData,
  _targetRouteId: number,
  _targetDate: string
): boolean => {
  return true;
};

/**
 * Get drop effect based on dragged item and target
 */
export const getDropEffect = (
  draggedItem: DragData,
  targetRouteId: number,
  targetDate: string
): 'move' | 'copy' | 'link' | 'none' => {
  if (isValidDropTarget(draggedItem, targetRouteId, targetDate)) {
    return draggedItem.type === 'assignment' ? 'move' : 'copy';
  }
  return 'none';
};

