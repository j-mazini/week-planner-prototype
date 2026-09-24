"use client";

import { useState, useCallback } from 'react';

export type DragItem = {
  type: 'card' | 'off' | 'assignment-card';
  id: number | string;
  assignmentId?: number | string;
  userId?: number;
  status?: string;
};

export const useDragAndDrop = () => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverCell, setDragOverCell] = useState<HTMLElement | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
    
    setTimeout(() => {
      e.currentTarget.classList.add('dragging');
    }, 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const cell = e.currentTarget.closest('.day-cell, .daily-route-assignment') as HTMLElement;
    if (cell && cell !== dragOverCell) {
      if (dragOverCell) {
        dragOverCell.classList.remove('drag-over');
      }
      setDragOverCell(cell);
      cell.classList.add('drag-over');
    }
  }, [dragOverCell]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const cell = e.currentTarget.closest('.day-cell, .daily-route-assignment') as HTMLElement;
    if (cell && cell === dragOverCell && !cell.contains(e.relatedTarget as Node)) {
      cell.classList.remove('drag-over');
      setDragOverCell(null);
    }
  }, [dragOverCell]);

  const cleanupDrag = useCallback(() => {
    document.querySelectorAll('.dragging').forEach((el) => el.classList.remove('dragging'));
    document.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
    document.querySelectorAll('.drag-source').forEach((el) => el.classList.remove('drag-source'));
    if (dragOverCell) {
      dragOverCell.classList.remove('drag-over');
    }
    setDragOverCell(null);
    setDraggedItem(null);
  }, [dragOverCell]);

  const handleDrop = useCallback((e: React.DragEvent, onDropHandler: (data: DragItem, event: React.DragEvent) => void) => {
    e.preventDefault();
    
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr) as DragItem;
        onDropHandler(data, e);
      }
    } catch (error) {
      console.error('Drop data parsing error:', error);
    }
    
    cleanupDrag();
  }, [cleanupDrag]);

  return {
    draggedItem,
    dragOverCell,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    cleanupDrag,
  };
};

