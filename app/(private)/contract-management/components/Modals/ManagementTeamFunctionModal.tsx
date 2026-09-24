'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';
import {
  type ManagementTeamFunction,
  type ManagementTeamFunctionCreateDTO,
  type ManagementTeamFunctionUpdateDTO,
} from '@/lib/types-config-api';
import { fetchDeposits, type DepositDTO } from '@/lib/api/deposits';
import { fetchVendors, type Vendor } from '@/lib/vendors';
import { fetchServicePartners, type ServicePartnerDTO } from '@/lib/service-partners-api';
import { SearchableSelect, type SelectItem } from '@/components/ui/searchable-select';

interface ManagementTeamFunctionModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: ManagementTeamFunctionCreateDTO | ManagementTeamFunctionUpdateDTO, id?: number) => Promise<void>;
  item: ManagementTeamFunction | null;
}

const ManagementTeamFunctionModal: React.FC<ManagementTeamFunctionModalProps> = ({ show, onClose, onSave, item }) => {
  const [formData, setFormData] = useState<{
    functionName: string;
    depositId: string;
    userId: string;
    servicePartnerId: string;
  }>({ functionName: '', depositId: '', userId: '', servicePartnerId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();
  const [deposits, setDeposits] = useState<DepositDTO[]>([]);
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [servicePartners, setServicePartners] = useState<ServicePartnerDTO[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const depositsForSelect = useMemo(() => {
    return deposits;
  }, [deposits]);

  const userOptions = useMemo<SelectItem[]>(() => {
    return allVendors.map((u) => {
      const fullName = u.fullName?.trim() || `User ${u.userId}`;
      const nameParts = fullName.split(/\s+/);
      const secondaryLabel = nameParts.length > 1 ? nameParts.at(-1) : fullName;
      // O SearchableSelect busca por label, value e secondaryLabel — sobrenome
      // exposto como secondaryLabel garante match isolado por last name.
      return {
        value: String(u.userId),
        label: fullName,
        secondaryLabel,
      };
    });
  }, [allVendors]);

  useEffect(() => {
    if (show) {
      setLoadingOptions(true);
      Promise.allSettled([fetchDeposits(), fetchVendors(), fetchServicePartners()])
        .then(([depositsRes, vendorsRes, servicePartnersRes]) => {
          if (depositsRes.status === 'fulfilled') setDeposits(depositsRes.value ?? []);
          else { console.error('Error loading deposits:', depositsRes.reason); setDeposits([]); }

          if (vendorsRes.status === 'fulfilled') setAllVendors(vendorsRes.value ?? []);
          else { console.error('Error loading vendors:', vendorsRes.reason); setAllVendors([]); }

          if (servicePartnersRes.status === 'fulfilled') setServicePartners(servicePartnersRes.value ?? []);
          else { console.error('Error loading service partners:', servicePartnersRes.reason); setServicePartners([]); }

          if (item) {
            setFormData({
              functionName: item.functionName || '',
              depositId: item.depositId != null ? String(item.depositId) : '',
              userId: item.userId != null ? String(item.userId) : '',
              servicePartnerId: item.servicePartnerId != null ? String(item.servicePartnerId) : '',
            });
          } else {
            setFormData({ functionName: '', depositId: '', userId: '', servicePartnerId: '' });
          }
        })
        .finally(() => setLoadingOptions(false));
    }
  }, [show, item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.functionName.trim() || !formData.depositId.trim() || !formData.userId.trim()) {
      alert('Function name, deposit and user are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const depId = formData.depositId.trim() ? parseInt(formData.depositId, 10) : null;
      const uid = formData.userId.trim() ? parseInt(formData.userId, 10) : null;
      const spId = formData.servicePartnerId.trim() ? parseInt(formData.servicePartnerId, 10) : null;
      const payload: ManagementTeamFunctionCreateDTO | ManagementTeamFunctionUpdateDTO = {
        functionName: formData.functionName.trim(),
        depositId: Number.isFinite(depId) ? depId : null,
        userId: Number.isFinite(uid) ? uid : null,
        servicePartnerId: Number.isFinite(spId) ? spId : null,
      };
      await onSave(payload, item?.managementTeamFunctionId);
      onClose();
    } catch (error) {
      console.error('Error saving management team function:', error);
      alert(
        `Error: ${error instanceof Error ? error.message : 'Failed to save management team function'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 1055, position: 'fixed' }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 1056 }}>
        <div className="modal-content" style={{ zIndex: 1057, backgroundColor: '#fff', color: '#212529' }}>
          <div className="modal-header">
            <h5 className="modal-title text-dark">
              {item ? 'Edit Management Team Function' : 'Create Management Team Function'}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={isSubmitting}
            />
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label text-dark" htmlFor="functionName">
                  Function name *
                </label>
                <input
                  type="text"
                  name="functionName"
                  id="functionName"
                  className="form-control text-dark"
                  value={formData.functionName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter function name"
                  style={{ backgroundColor: '#fff', color: '#212529' }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-dark" htmlFor="depositId">
                  Deposit *
                </label>
                <select
                  name="depositId"
                  id="depositId"
                  className="form-control text-dark"
                  value={formData.depositId}
                  onChange={handleChange}
                  disabled={isSubmitting || loadingOptions}
                  required
                  style={{ backgroundColor: '#fff', color: '#212529' }}
                >
                  <option value="">— Select deposit —</option>
                  {depositsForSelect.map((d) => (
                    <option key={d.depositId} value={d.depositId}>
                      {d.depositName || `Deposit ${d.depositId}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label text-dark" htmlFor="userId">
                  User *
                </label>
                <SearchableSelect
                  items={userOptions}
                  value={formData.userId}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, userId: v }))}
                  placeholder="— Select user —"
                  searchPlaceholder="Search by first or last name..."
                  emptyText="No users found."
                  disabled={isSubmitting}
                  loading={loadingOptions}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-dark" htmlFor="servicePartnerId">
                  Service Partner
                </label>
                <select
                  name="servicePartnerId"
                  id="servicePartnerId"
                  className="form-control text-dark"
                  value={formData.servicePartnerId}
                  onChange={handleChange}
                  disabled={isSubmitting || loadingOptions}
                  style={{ backgroundColor: '#fff', color: '#212529' }}
                >
                  <option value="">— Select service partner —</option>
                  {servicePartners.map((sp) => (
                    <option key={sp.servicePartnerId} value={String(sp.servicePartnerId)}>
                      {sp.partnerName || `Service Partner ${sp.servicePartnerId}`}
                    </option>
                  ))}
                </select>
              </div>
              {item && (item.createdBy != null || item.createdAt || item.updatedAt) && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Additional information</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    {item.createdBy != null && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created by:</span>
                        <span>{item.createdBy}</span>
                      </div>
                    )}
                    {item.createdAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created at:</span>
                        <span>
                          {new Date(item.createdAt).toLocaleString('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                    {item.updatedAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Updated at:</span>
                        <span>
                          {new Date(item.updatedAt).toLocaleString('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <p className="text-muted small mb-0">Fields marked with * are required.</p>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" pending={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : item
                    ? 'Update'
                    : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div
        className="modal-backdrop fade show"
        style={{
          zIndex: 1050,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'auto',
        }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      />
    </div>
  );
};

export default ManagementTeamFunctionModal;

