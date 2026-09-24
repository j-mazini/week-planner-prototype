/**
 * Drag and Drop handler functions
 */

import type { Assignment, Vendor } from '../types/planner';
import { isVendorOffOnDate, hasAssignmentForVendorOnDate } from './validationUtils';

export interface DragItem {
  type: 'card' | 'off' | 'assignment-card';
  id: string | number;
  assignmentId?: string | number;
  userId?: number;
  status?: string;
}

export interface DragState {
  draggedItem: DragItem | null;
  draggedFromCell: HTMLElement | null;
  currentDragOverCell: HTMLElement | null;
}

/**
 * Handle drag start for assignment cards
 */
export function handleDragStartCard(
  e: React.DragEvent,
  assignmentId: string | number,
  setDraggedItem: (item: DragItem | null) => void,
  setDraggedFromCell: (cell: HTMLElement | null) => void
) {
  const card = e.currentTarget as HTMLElement;
  const isWeeklyView = card.classList.contains('vendor-card');
  const isDailyView = card.classList.contains('daily-assignment-card');
  
  // Armazena o item arrastado no estado global
  setDraggedItem({
    type: isDailyView ? 'assignment-card' : 'card',
    id: assignmentId
  });
  
  // Marca a célula de origem
  if (isWeeklyView) {
    const dayCell = card.closest('.day-cell') as HTMLElement;
    setDraggedFromCell(dayCell);
  } else if (isDailyView) {
    const routeCard = card.closest('.daily-route-card') as HTMLElement;
    routeCard?.classList.add('drag-source');
  }
  
  // Efeito visual
  setTimeout(() => card.classList.add('dragging'), 0);
}

/**
 * Handle drag start for vendor chips (off/hold)
 */
export function handleDragStartOff(
  e: React.DragEvent,
  userId: number,
  status: string,
  setDraggedItem: (item: DragItem | null) => void
) {
  const tag = e.currentTarget as HTMLElement;
  
  setDraggedItem({
    type: 'off',
    id: userId,
    status: status // 'holding' ou 'off'
  });
  
  setTimeout(() => tag.classList.add('dragging'), 0);
}

/**
 * Handle drag over cell
 */
export function handleDragOverCell(
  e: React.DragEvent,
  draggedItem: DragItem | null,
  draggedFromCell: HTMLElement | null,
  currentDragOverCell: HTMLElement | null,
  setCurrentDragOverCell: (cell: HTMLElement | null) => void
) {
  e.preventDefault(); // Necessário para permitir drop
  const cell = (e.currentTarget as HTMLElement).closest('.day-cell') as HTMLElement;
  
  if (!cell) return;
  
  // Não permitir drop na mesma célula de origem
  if (draggedItem?.type === 'card' && cell === draggedFromCell) return;
  
  // Não permitir drop de vendors "OFF"
  if (draggedItem?.type === 'off' && draggedItem.status === 'off') return;
  
  // Aplicar efeito visual
  if (cell && cell !== currentDragOverCell) {
    currentDragOverCell?.classList.remove('drag-over');
    setCurrentDragOverCell(cell);
    cell.classList.add('drag-over');
  }
}

/**
 * Handle drag leave cell
 */
export function handleDragLeaveCell(
  e: React.DragEvent,
  currentDragOverCell: HTMLElement | null,
  setCurrentDragOverCell: (cell: HTMLElement | null) => void
) {
  const cell = (e.currentTarget as HTMLElement).closest('.day-cell') as HTMLElement;
  if (cell && cell === currentDragOverCell && !cell.contains(e.relatedTarget as Node)) {
    cell.classList.remove('drag-over');
    setCurrentDragOverCell(null);
  }
}

/**
 * Handle drop on cell
 */
export async function handleDropOnCell(
  e: React.DragEvent,
  targetRouteId: string | number,
  targetDate: string,
  draggedItem: DragItem | null,
  assignments: Assignment[],
  onMoveAssignment: (assignmentId: string | number, routeId: string | number, date: string) => Promise<void>,
  onCreateAssignment: (userId: number, routeId: string | number, date: string) => Promise<void>,
  cleanupDrag: () => void
) {
  e.preventDefault();
  (e.currentTarget as HTMLElement).closest('.day-cell');

  if (!draggedItem) return;
  
  // CASO 1: Movendo assignment existente
  if (draggedItem.type === 'card' || draggedItem.type === 'assignment-card') {
    await onMoveAssignment(draggedItem.id, targetRouteId, targetDate);
  }
  
  // CASO 2: Criando novo assignment com vendor do "Hold"
  else if (draggedItem.type === 'off' && draggedItem.status === 'holding' && draggedItem.userId) {
    await onCreateAssignment(draggedItem.userId, targetRouteId, targetDate);
  }
  
  cleanupDrag();
}

/**
 * Handle moving an assignment
 */
export async function handleMoveAssignment(
  assignmentId: string | number,
  targetRouteId: string | number,
  targetDate: string,
  assignments: Assignment[],
  vendors: Vendor[],
  dayOffEntries: unknown[],
  onUpdateAssignment: (id: string | number, updates: Partial<Assignment>) => Promise<Assignment>,
  onDeleteAssignment: (id: string | number) => Promise<void>,
  refreshView: () => Promise<void>
) {
  const assignment = assignments.find(a => String(a.id) === String(assignmentId));
  if (!assignment) return;
  
  // Verificar se já existe assignment no destino
  const assignmentsAtTarget = assignments.filter(
    item => String(item.routeId) === String(targetRouteId) && 
            item.date === targetDate && 
            String(item.id) !== String(assignmentId)
  );
  
  // Se existe, substituir
  if (assignmentsAtTarget.length > 0) {
    await handleAssignmentSubstitution(
      assignment,
      assignmentsAtTarget[0],
      targetRouteId,
      targetDate,
      onUpdateAssignment,
      onDeleteAssignment,
      refreshView
    );
    return;
  }
  
  // Validações
  if (hasAssignmentForVendorOnDate(assignment.userId, targetDate, assignments, assignmentId)) {
    alert('This vendor already has an assignment on this day.');
    return;
  }
  
  if (isVendorOffOnDate(assignment.userId, targetDate, vendors, dayOffEntries)) {
    alert('This vendor is marked as day off on this day.');
    return;
  }
  
  // Atualizar assignment
  const updates: Partial<Assignment> = {
    routeId: Number(targetRouteId),
    date: targetDate,
  };
  
  await onUpdateAssignment(assignmentId, updates);
  await refreshView();
}

/**
 * Handle assignment substitution
 */
export async function handleAssignmentSubstitution(
  source: Assignment,
  target: Assignment,
  newRouteId: string | number,
  newDate: string,
  onUpdateAssignment: (id: string | number, updates: Partial<Assignment>) => Promise<Assignment>,
  onDeleteAssignment: (id: string | number) => Promise<void>,
  refreshView: () => Promise<void>,
  getVendorName: (userId: number) => string
) {
  // Confirmar substituição
  const confirmed = window.confirm(
    `Replace ${getVendorName(target.userId)} with ${getVendorName(source.userId)}?`
  );
  
  if (!confirmed) return;
  
  try {
    // Deletar assignment alvo
    await onDeleteAssignment(target.id);
    
    // Atualizar assignment fonte
    const updates: Partial<Assignment> = {
      routeId: Number(newRouteId),
      date: newDate,
    };
    
    await onUpdateAssignment(source.id, updates);
    await refreshView();
    
  } catch (error) {
    console.error('Error during substitution:', error);
    alert('Failed to replace assignment.');
  }
}

/**
 * Cleanup drag state
 */
export function cleanupDrag(
  setDraggedItem: (item: DragItem | null) => void,
  setDraggedFromCell: (cell: HTMLElement | null) => void,
  setCurrentDragOverCell: (cell: HTMLElement | null) => void
) {
  document.querySelectorAll('.dragging').forEach((el) => el.classList.remove('dragging'));
  document.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
  document.querySelectorAll('.drag-source').forEach((el) => el.classList.remove('drag-source'));
  
  setDraggedItem(null);
  setDraggedFromCell(null);
  setCurrentDragOverCell(null);
}


