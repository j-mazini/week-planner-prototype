import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  fetchAdhocServiceTypes,
  createServiceType, 
  updateServiceType, 
  deleteServiceType, 
  type ServiceTypeDTO 
} from '@/lib/serviceTypes';

export const useAdHocServices = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({ search: '', active: 'all' });

  const loadServiceTypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdhocServiceTypes();
      setServiceTypes(data);
    } catch (error) {
      console.error('Error fetching ad-hoc service types:', error);
      setError(error instanceof Error ? error.message : 'Error loading ad-hoc service types');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredServiceTypes = useMemo(() => {
    let filtered = serviceTypes;

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(st => 
        (st.name || '').toLowerCase().includes(searchLower) ||
        (st.description || '').toLowerCase().includes(searchLower) ||
        String(st.serviceTypeId || '').includes(searchLower) ||
        String(st.depositId || '').includes(searchLower) ||
        String(st.servicePartnerId || '').includes(searchLower)
      );
    }

    if (filter.active !== 'all') {
      const isActive = filter.active === 'active';
      filtered = filtered.filter(st => (st.active ?? true) === isActive);
    }

    return filtered;
  }, [serviceTypes, filter]);

  const handleSave = useCallback(async (
    serviceTypeData: Omit<ServiceTypeDTO, 'serviceTypeId'>,
    selectedServiceType: ServiceTypeDTO | null
  ) => {
    try {
      if (selectedServiceType?.serviceTypeId) {
        await updateServiceType(selectedServiceType.serviceTypeId, serviceTypeData);
      } else {
        await createServiceType(serviceTypeData);
      }
      await loadServiceTypes();
    } catch (error) {
      console.error('Error saving service type:', error);
      throw error;
    }
  }, [loadServiceTypes]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ServiceTypeDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = useCallback((serviceType: ServiceTypeDTO) => {
    setDeletingItem(serviceType);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteServiceType(deletingItem.serviceTypeId);
      await loadServiceTypes();
      setShowDeleteConfirm(false);
      setDeletingItem(null);
    } catch (error) {
      console.error('Error deleting service type:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete service type'}`);
    } finally {
      setIsDeleting(false);
    }
  }, [deletingItem, loadServiceTypes]);

  useEffect(() => {
    loadServiceTypes();
  }, [loadServiceTypes]);

  return {
    serviceTypes,
    filteredServiceTypes,
    isLoading,
    error,
    filter,
    setFilter,
    loadServiceTypes,
    handleSave,
    handleDelete: handleDeleteClick,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleConfirmDelete,
    isDeleting,
  };
};


