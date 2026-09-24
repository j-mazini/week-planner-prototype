"use client";

import { useState, useCallback } from 'react';

export type DragItem = {
  type: 'card' | 'off' | 'assignment-card' | 'vendor';
  id: number | string;
  assignmentId?: number | string;
  userId?: number;
  vendorName?: string;
  status?: string;
  date?: string; // Date string (YYYY-MM-DD) for vendor drag from available list
};

export const useDragAndDrop = () => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverCell, setDragOverCell] = useState<HTMLElement | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
    
    // Safely add dragging class to currentTarget
    const target = e.currentTarget;
    if (target && target instanceof HTMLElement && target.classList) {
      // Keep a marker class so cleanup can reliably find dragged elements
      target.classList.add('dragging');
      // Visual feedback (Tailwind utility classes) - replaces legacy CSS .dragging rules
      target.classList.add('opacity-60', 'scale-[1.05]', 'rotate-[1deg]', 'z-[1000]', 'shadow-lg');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const cell = e.currentTarget.closest('[data-day-cell], .daily-route-assignment') as HTMLElement;
    if (cell && cell !== dragOverCell) {
      if (dragOverCell) {
        dragOverCell.classList.remove('bg-gradient-to-br', 'from-indigo-500/20', 'to-indigo-600/15', 'border-2', 'border-dashed', 'border-indigo-500/60', 'shadow-[inset_0_0_20px_rgba(99,102,241,0.15),0_0_0_4px_rgba(99,102,241,0.1)]', 'scale-[1.02]');
      }
      setDragOverCell(cell);
      cell.classList.add('bg-gradient-to-br', 'from-indigo-500/20', 'to-indigo-600/15', 'border-2', 'border-dashed', 'border-indigo-500/60', 'shadow-[inset_0_0_20px_rgba(99,102,241,0.15),0_0_0_4px_rgba(99,102,241,0.1)]', 'scale-[1.02]');
    }
  }, [dragOverCell]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const cell = e.currentTarget.closest('[data-day-cell], .daily-route-assignment') as HTMLElement;
    if (cell && cell === dragOverCell && !cell.contains(e.relatedTarget as Node)) {
      cell.classList.remove('bg-gradient-to-br', 'from-indigo-500/20', 'to-indigo-600/15', 'border-2', 'border-dashed', 'border-indigo-500/60', 'shadow-[inset_0_0_20px_rgba(99,102,241,0.15),0_0_0_4px_rgba(99,102,241,0.1)]', 'scale-[1.02]');
      setDragOverCell(null);
    }
  }, [dragOverCell]);

  const cleanupDrag = useCallback(() => {
    document.querySelectorAll('.dragging').forEach((el) => {
      el.classList.remove('dragging', 'opacity-60', 'scale-[1.08]', 'rotate-[2deg]', 'z-[1000]');
    });
    document.querySelectorAll('[data-day-cell]').forEach((el) => {
      el.classList.remove('bg-gradient-to-br', 'from-indigo-500/20', 'to-indigo-600/15', 'border-2', 'border-dashed', 'border-indigo-500/60', 'shadow-[inset_0_0_20px_rgba(99,102,241,0.15),0_0_0_4px_rgba(99,102,241,0.1)]', 'scale-[1.02]');
    });
    document.querySelectorAll('.drag-source').forEach((el) => el.classList.remove('drag-source'));

    if (dragOverCell) {
      dragOverCell.classList.remove('bg-gradient-to-br', 'from-indigo-500/20', 'to-indigo-600/15', 'border-2', 'border-dashed', 'border-indigo-500/60', 'shadow-[inset_0_0_20px_rgba(99,102,241,0.15),0_0_0_4px_rgba(99,102,241,0.1)]', 'scale-[1.02]');
    }

    setDragOverCell(null);
    setDraggedItem(null);
  }, [dragOverCell]);

  const handleDrop = useCallback((e: React.DragEvent, onDropHandler: (data: DragItem, event: React.DragEvent) => void) => {
    e.preventDefault();
    e.stopPropagation();

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
