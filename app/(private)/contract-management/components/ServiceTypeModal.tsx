'use client';

import React, { useEffect, useState } from 'react';
import { type ServiceTypeDTO } from '@/lib/serviceTypes';
import { fetchDeposits, type Deposit } from '@/lib/vendors-api';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';
import { fetchServicePartners, type ServicePartnerDTO } from '@/lib/service-partners-api';
import { filterAllowedDeposits } from '@/lib/allowedDeposits';

interface ServiceTypeModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: Omit<ServiceTypeDTO, 'serviceTypeId'>) => Promise<void>;
  serviceType: ServiceTypeDTO | null;
  depositId?: number; // Optional deposit ID to pre-select
  defaultIsAdhoc?: boolean; // Kept for backward compatibility (unused)
}

const ServiceTypeModal: React.FC<ServiceTypeModalProps> = ({ show, onClose, onSave, serviceType, depositId }) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    depositId: string;
    servicePartnerId: string;
    active: boolean;
  }>({
    name: '',
    description: '',
    depositId: '',
    servicePartnerId: '',
    active: true,
  });
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [servicePartners, setServicePartners] = useState<ServicePartnerDTO[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(false);
  const [isLoadingServicePartners, setIsLoadingServicePartners] = useState(false);

  useEffect(() => {
    if (show) {
      if (serviceType) {
        setFormData({
          name: serviceType.name || '',
          description: serviceType.description || '',
          depositId: serviceType.depositId?.toString() || '',
          servicePartnerId: serviceType.servicePartnerId?.toString() || '',
          active: serviceType.active ?? true,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          depositId: depositId?.toString() || '',
          servicePartnerId: '',
          active: true,
        });
      }
      loadDeposits();
      loadServicePartners();
    }
  }, [show, serviceType, depositId]);

  const loadDeposits = async () => {
    setIsLoadingDeposits(true);
    try {
      const data = await fetchDeposits();
      setDeposits(data);
    } catch (error) {
      console.error('Error loading deposits:', error);
    } finally {
      setIsLoadingDeposits(false);
    }
  };

  const loadServicePartners = async () => {
    setIsLoadingServicePartners(true);
    try {
      const data = await fetchServicePartners();
      setServicePartners(data);
    } catch (error) {
      console.error('Error loading service partners:', error);
    } finally {
      setIsLoadingServicePartners(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<ServiceTypeDTO, 'serviceTypeId'> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        active: formData.active,
      };

      if (formData.depositId) {
        payload.depositId = parseInt(formData.depositId, 10);
      }

      if (formData.servicePartnerId) {
        payload.servicePartnerId = parseInt(formData.servicePartnerId, 10);
      }

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error('Error saving service type:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save service type'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1055, position: 'fixed' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document" style={{ zIndex: 1056 }}>
        <div className="modal-content" style={{ zIndex: 1057 }}>
          <div className="modal-header">
            <h5 className="modal-title">{serviceType ? 'Edit Service Type' : 'Create Service Type'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Deposit</label>
                <select
                  name="depositId"
                  className="form-select"
                  value={formData.depositId}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoadingDeposits}
                >
                  <option value="">Select a deposit</option>
                  {filterAllowedDeposits(deposits).map((deposit) => (
                    <option key={deposit.depositId} value={deposit.depositId}>
                      {deposit.depositName || `Deposit ${deposit.depositId}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Service Partner</label>
                <select
                  name="servicePartnerId"
                  className="form-select"
                  value={formData.servicePartnerId}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoadingServicePartners}
                >
                  <option value="">Select a service partner (optional)</option>
                  {servicePartners.map((sp) => (
                    <option key={sp.servicePartnerId} value={sp.servicePartnerId}>
                      {sp.partnerName || `Service Partner ${sp.servicePartnerId}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="active"
                    className="form-check-input"
                    checked={formData.active}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    id="active"
                  />
                  <label className="form-check-label" htmlFor="active">
                    Active
                  </label>
                </div>
              </div>

              {/* Informational fields (read-only) */}
              {serviceType && (serviceType.createBy || serviceType.createdAt || serviceType.updatedAt) && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Additional Information</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    {serviceType.createBy && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created by:</span>
                        <span>{serviceType.createBy}</span>
                      </div>
                    )}
                    {serviceType.createdAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created at:</span>
                        <span>{new Date(serviceType.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}
                    {serviceType.updatedAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Updated at:</span>
                        <span>{new Date(serviceType.updatedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
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
                {isSubmitting ? 'Saving...' : (serviceType ? 'Update Service Type' : 'Create Service Type')}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default ServiceTypeModal;
