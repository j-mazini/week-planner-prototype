'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  fetchManagementTeamFunctions,
  createManagementTeamFunction,
  updateManagementTeamFunction,
  deleteManagementTeamFunction,
  type ManagementTeamFunction,
  type ManagementTeamFunctionCreateDTO,
  type ManagementTeamFunctionUpdateDTO,
} from '@/lib/types-config-api';
import { fetchDeposits, type DepositDTO } from '@/lib/api/deposits';
import { fetchVendors, type Vendor } from '@/lib/vendors-api';
import { fetchServicePartners, type ServicePartnerDTO } from '@/lib/service-partners-api';

export const useManagementTeamFunctions = () => {
  const [items, setItems] = useState<ManagementTeamFunction[]>([]);
  const [deposits, setDeposits] = useState<DepositDTO[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [servicePartners, setServicePartners] = useState<ServicePartnerDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ search: string }>({ search: '' });

  const depositMap = useMemo(() => {
    const map = new Map<number, string>();
    deposits.forEach((d) => map.set(d.depositId, d.depositName));
    return map;
  }, [deposits]);

  const vendorMap = useMemo(() => {
    const map = new Map<number, string>();
    vendors.forEach((v) => {
      const fullName = `${v.firstName || ''} ${v.lastName || ''}`.trim();
      map.set(v.id, fullName || `ID: ${v.id}`);
    });
    return map;
  }, [vendors]);

  const getDepositName = useCallback((depositId: number | null | undefined): string => {
    if (depositId == null) return '—';
    return depositMap.get(depositId) || `ID: ${depositId}`;
  }, [depositMap]);

  const getVendorName = useCallback((userId: number | null | undefined): string => {
    if (userId == null) return '—';
    return vendorMap.get(userId) || `ID: ${userId}`;
  }, [vendorMap]);

  const servicePartnerMap = useMemo(() => {
    const map = new Map<number, string>();
    servicePartners.forEach((sp) => {
      const id = Number(sp.servicePartnerId);
      if (sp.partnerName) {
        map.set(id, sp.partnerName);
      }
    });
    return map;
  }, [servicePartners]);

  const getServicePartnerName = useCallback((servicePartnerId: number | string | null | undefined): string => {
    if (servicePartnerId == null) return '—';
    const id = Number(servicePartnerId);
    const name = servicePartnerMap.get(id);
    return name || `ID: ${id}`;
  }, [servicePartnerMap]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, depositsData, vendorsData, servicePartnersData] = await Promise.all([
        fetchManagementTeamFunctions(),
        fetchDeposits(),
        fetchVendors(),
        fetchServicePartners(),
      ]);
      setItems(data || []);
      setDeposits(depositsData || []);
      setVendors(vendorsData || []);
      setServicePartners(servicePartnersData || []);
    } catch (err) {
      console.error('Error loading management team functions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load management team functions';
      setError(errorMessage);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredItems = useMemo(() => {
    if (!filter.search) return items;
    const searchLower = filter.search.toLowerCase();
    return items.filter(
      (item) =>
        item.functionName?.toLowerCase().includes(searchLower) ||
        item.managementTeamFunctionId?.toString().includes(searchLower) ||
        item.depositId?.toString().includes(searchLower) ||
        getDepositName(item.depositId).toLowerCase().includes(searchLower) ||
        item.userId?.toString().includes(searchLower) ||
        getVendorName(item.userId).toLowerCase().includes(searchLower) ||
        item.servicePartnerId?.toString().includes(searchLower) ||
        getServicePartnerName(item.servicePartnerId).toLowerCase().includes(searchLower)
    );
  }, [items, filter, getDepositName, getVendorName, getServicePartnerName]);

  const handleSave = useCallback(
    async (
      data: ManagementTeamFunctionCreateDTO | ManagementTeamFunctionUpdateDTO,
      selected: ManagementTeamFunction | null
    ) => {
      if (selected?.managementTeamFunctionId) {
        await updateManagementTeamFunction(selected.managementTeamFunctionId, data as ManagementTeamFunctionUpdateDTO);
      } else {
        await createManagementTeamFunction(data as ManagementTeamFunctionCreateDTO);
      }
      await load();
    },
    [load]
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = useCallback((id: number) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deletingId === null) return;
    setIsDeleting(true);
    try {
      await deleteManagementTeamFunction(deletingId);
      await load();
      setShowDeleteConfirm(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting management team function:', err);
      alert('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  }, [deletingId, load]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    filteredItems,
    isLoading,
    error,
    filter,
    setFilter,
    load,
    handleSave,
    handleDelete: handleDeleteClick,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleConfirmDelete,
    isDeleting,
    getDepositName,
    getVendorName,
    getServicePartnerName,
  };
};

