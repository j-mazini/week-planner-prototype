'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchAdhocCategories, deleteAdhocCategory, type AdhocCategory } from '@/lib/types-config-api';

export function useAdhocCategories() {
  const [adhocCategories, setAdhocCategories] = useState<AdhocCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({ search: '' });

  const loadAdhocCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdhocCategories();
      setAdhocCategories(data);
    } catch (err) {
      console.error('Error loading adhoc categories:', err);
      setError('Failed to load adhoc categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdhocCategories();
  }, []);

  const filteredAdhocCategories = useMemo(() => {
    return adhocCategories.filter((cat) => {
      const matchesSearch = !filter.search || 
        cat.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        (cat.description?.toLowerCase().includes(filter.search.toLowerCase()));
      return matchesSearch;
    });
  }, [adhocCategories, filter]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingId === null) return;
    
    setIsDeleting(true);
    try {
      await deleteAdhocCategory(deletingId);
      await loadAdhocCategories();
      setShowDeleteConfirm(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting adhoc category:', err);
      alert('Failed to delete adhoc category');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    adhocCategories,
    filteredAdhocCategories,
    isLoading,
    error,
    filter,
    setFilter,
    refresh: loadAdhocCategories,
    handleDelete: handleDeleteClick,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleConfirmDelete,
    isDeleting,
  };
}
