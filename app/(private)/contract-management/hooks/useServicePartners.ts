import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  fetchServicePartners,
  createServicePartner,
  updateServicePartner,
  deleteServicePartner,
  type ServicePartnerDTO,
  type ServicePartnerCreateDTO,
  type ServicePartnerUpdateDTO,
} from '@/lib/service-partners-api';
import { getFullNameFromToken, getCompanyIdFromToken } from '@/lib/auth';

export const useServicePartners = () => {
  const [servicePartners, setServicePartners] = useState<ServicePartnerDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({ search: '' });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ServicePartnerDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchServicePartners();
      setServicePartners(data);
    } catch (err) {
      console.error('Error fetching service partners:', err);
      setError(err instanceof Error ? err.message : 'Error loading service partners');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredServicePartners = useMemo(() => {
    if (!filter.search) return servicePartners;
    const q = filter.search.toLowerCase();
    return servicePartners.filter(
      (sp) =>
        sp.partnerName.toLowerCase().includes(q) ||
        String(sp.servicePartnerId).includes(q) ||
        (sp.createdBy || '').toLowerCase().includes(q)
    );
  }, [servicePartners, filter.search]);

  const handleSave = useCallback(
    async (
      data: ServicePartnerUpdateDTO,
      selected: ServicePartnerDTO | null
    ) => {
      if (selected?.servicePartnerId) {
        await updateServicePartner(selected.servicePartnerId, data);
      } else {
        const fullName = getFullNameFromToken() || 'unknown';
        const payload: ServicePartnerCreateDTO = {
          partnerName: data.partnerName ?? '',
          createdBy: fullName,
          address: data.address,
          phone: data.phone,
          vatNumber: data.vatNumber,
          dailyServiceCharge: data.dailyServiceCharge,
          reimbursement: data.reimbursement,
          companyId: getCompanyIdFromToken() ?? undefined,
          costModels: data.costModels,
        };
        await createServicePartner(payload);
      }
      await load();
    },
    [load]
  );

  const handleDeleteClick = useCallback((sp: ServicePartnerDTO) => {
    setDeletingItem(sp);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteServicePartner(deletingItem.servicePartnerId);
      await load();
      setShowDeleteConfirm(false);
      setDeletingItem(null);
    } catch (err) {
      console.error('Error deleting service partner:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to delete service partner'}`);
    } finally {
      setIsDeleting(false);
    }
  }, [deletingItem, load]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    servicePartners,
    filteredServicePartners,
    isLoading,
    error,
    filter,
    setFilter,
    load,
    handleSave,
    handleDeleteClick,
    showDeleteConfirm,
    setShowDeleteConfirm,
    deletingItem,
    handleConfirmDelete,
    isDeleting,
  };
};
