import { getApiBaseUrl } from "@/lib/apiBaseUrl";
﻿import { useState, useCallback } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { InsightRow } from '../types';
import { getBearerAuthHeader } from '@/lib/auth';
import { canEditOrDeleteOperationRow } from '../utils';
import { guardedFetch } from "@/lib/in-flight-guard";

interface UseDeleteOperationReturn {
  showDeleteModal: boolean;
  rowToDelete: InsightRow | null;
  isDeleting: boolean;
  openDeleteModal: (row: InsightRow) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<boolean>;
}

export const useDeleteOperation = (
  onSuccess: () => void
): UseDeleteOperationReturn => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<InsightRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  const openDeleteModal = useCallback((row: InsightRow) => {
    if (!canEditOrDeleteOperationRow(row)) return;
    // Fecha a sidebar imediatamente antes de abrir o modal
    if (isMobile) setOpenMobile(false);
    setOpen(false);
    setRowToDelete(row);
    setShowDeleteModal(true);
  }, [isMobile, setOpen, setOpenMobile]);

  const closeDeleteModal = useCallback(() => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setRowToDelete(null);
    }
  }, [isDeleting]);

  const confirmDelete = useCallback(async (): Promise<boolean> => {
    if (!rowToDelete || !canEditOrDeleteOperationRow(rowToDelete)) return false;

    setIsDeleting(true);
    try {
      const response = await guardedFetch(
        `${getApiBaseUrl()}/bff/operations/${rowToDelete.operationId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getBearerAuthHeader(),
          },
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        setRowToDelete(null);
        onSuccess();
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete register');
      }
    } catch (error: unknown) {
      console.error('Error deleting operation:', error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [rowToDelete, onSuccess]);

  return {
    showDeleteModal,
    rowToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
};

