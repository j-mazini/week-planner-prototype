'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';
import {
  type AdhocService,
  type AdhocCategory,
  type AdhocServiceCreateDTO,
  type AdhocServiceUpdateDTO,
  fetchAdhocCategories,
  fetchAdhocServiceById,
} from '@/lib/types-config-api';
import { fetchServicePartners, type ServicePartnerDTO } from '@/lib/service-partners-api';

interface AdhocServiceModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: AdhocServiceCreateDTO | AdhocServiceUpdateDTO, id?: number) => Promise<void>;
  adhocService: AdhocService | null;
}

/** Resolve valor booleano de isAdhocSort ou is_adhocService (compatibilidade com backend) */
function resolveIsAdhocSort(item: AdhocService | Record<string, unknown> | null): boolean {
  if (!item) return false;
  const val = (item as Record<string, unknown>).isAdhocSort ?? (item as Record<string, unknown>).is_adhocService;
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === 'yes' || val === 1) return true;
  return false;
}

const AdhocServiceModal: React.FC<AdhocServiceModalProps> = ({ show, onClose, onSave, adhocService }) => {
  const [formData, setFormData] = useState<{
    adhocName: string;
    adhocReceivedPayment: string;
    adhocVendorPayment: string;
    isAdhocSort: boolean;
    adhocCategoryId: string;
    servicePartnerId: string;
  }>({
    adhocName: '',
    adhocReceivedPayment: '',
    adhocVendorPayment: '',
    isAdhocSort: false,
    adhocCategoryId: '',
    servicePartnerId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [adhocCategories, setAdhocCategories] = useState<AdhocCategory[]>([]);
  const [servicePartners, setServicePartners] = useState<ServicePartnerDTO[]>([]);

  const loadAdhocCategories = useCallback(async () => {
    try {
      const data = await fetchAdhocCategories();
      setAdhocCategories(data ?? []);
    } catch (err) {
      console.error('Error loading adhoc categories:', err);
      setAdhocCategories([]);
    }
  }, []);

  const loadServicePartners = useCallback(async () => {
    try {
      const data = await fetchServicePartners();
      setServicePartners(data ?? []);
    } catch (err) {
      console.error('Error loading service partners:', err);
      setServicePartners([]);
    }
  }, []);

  useEffect(() => {
    if (show) {
      loadAdhocCategories();
      loadServicePartners();
      if (adhocService) {
        setIsLoadingDetails(true);
        fetchAdhocServiceById(adhocService.adhocServiceId)
          .then((full) => {
            const categoryId = full.adhocCategoryId;
            const categoryIdText = categoryId != null && categoryId !== undefined
              ? String(categoryId)
              : '';
            setFormData({
              adhocName: full.adhocName || '',
              adhocReceivedPayment: full.adhocReceivedPayment?.toString() ?? '',
              adhocVendorPayment: full.adhocVendorPayment?.toString() ?? '',
              isAdhocSort: resolveIsAdhocSort(full),
              adhocCategoryId: categoryIdText,
              servicePartnerId: full.servicePartnerId != null ? String(full.servicePartnerId) : '',
            });
          })
          .catch((err) => {
            console.error('Error loading adhoc service details:', err);
            const fallback = adhocService;
            const categoryId = fallback?.adhocCategoryId;
            const categoryIdText = categoryId != null && categoryId !== undefined
              ? String(categoryId)
              : '';
            setFormData({
              adhocName: fallback?.adhocName || '',
              adhocReceivedPayment: fallback?.adhocReceivedPayment?.toString() ?? '',
              adhocVendorPayment: fallback?.adhocVendorPayment?.toString() ?? '',
              isAdhocSort: resolveIsAdhocSort(fallback ?? null),
              adhocCategoryId: categoryIdText,
              servicePartnerId: fallback?.servicePartnerId != null ? String(fallback.servicePartnerId) : '',
            });
          })
          .finally(() => setIsLoadingDetails(false));
      } else {
        setFormData({
          adhocName: '',
          adhocReceivedPayment: '',
          adhocVendorPayment: '',
          isAdhocSort: false,
          adhocCategoryId: '',
          servicePartnerId: '',
        });
      }
    }
  }, [show, adhocService, loadAdhocCategories, loadServicePartners]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.adhocName.trim()) {
      alert('Adhoc name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (adhocService) {
        // Update mode - use AdhocServiceUpdateDTO (no createdBy)
        const payload: AdhocServiceUpdateDTO = {
          adhocName: formData.adhocName.trim(),
          adhocReceivedPayment: formData.adhocReceivedPayment ? parseFloat(formData.adhocReceivedPayment) : undefined,
          adhocVendorPayment: formData.adhocVendorPayment ? parseFloat(formData.adhocVendorPayment) : undefined,
          isAdhocSort: formData.isAdhocSort,
          adhocCategoryId: formData.adhocCategoryId ? parseInt(formData.adhocCategoryId, 10) : undefined,
          servicePartnerId: formData.servicePartnerId ? parseInt(formData.servicePartnerId, 10) : undefined,
        };
        await onSave(payload, adhocService.adhocServiceId);
      } else {
        // Create mode - use AdhocServiceCreateDTO
        const payload: AdhocServiceCreateDTO = {
          adhocName: formData.adhocName.trim(),
          adhocReceivedPayment: formData.adhocReceivedPayment ? parseFloat(formData.adhocReceivedPayment) : undefined,
          adhocVendorPayment: formData.adhocVendorPayment ? parseFloat(formData.adhocVendorPayment) : undefined,
          isAdhocSort: formData.isAdhocSort,
          adhocCategoryId: formData.adhocCategoryId ? parseInt(formData.adhocCategoryId, 10) : undefined,
          servicePartnerId: formData.servicePartnerId ? parseInt(formData.servicePartnerId, 10) : undefined,
        };
        await onSave(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error saving adhoc service:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save adhoc service'}`);
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
            <h5 className="modal-title">{adhocService ? 'Edit Adhoc Service' : 'Create Adhoc Service'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSubmitting || isLoadingDetails}></button>
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body">
              {isLoadingDetails && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2 text-slate-600 text-sm">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  Loading adhoc service details...
                </div>
              )}
              <div className="mb-3">
                <label className="form-label text-slate-700 font-medium" htmlFor="adhocName">Adhoc Name *</label>
                <input
                  type="text"
                  name="adhocName"
                  id="adhocName"
                  className="form-control"
                  value={formData.adhocName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting || isLoadingDetails}
                  placeholder="Enter adhoc service name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-slate-700 font-medium" htmlFor="adhocReceivedPayment">Adhoc Received Payment</label>
                <input
                  type="number"
                  step="0.01"
                  name="adhocReceivedPayment"
                  id="adhocReceivedPayment"
                  className="form-control"
                  value={formData.adhocReceivedPayment}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoadingDetails}
                  placeholder="0.00"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-slate-700 font-medium" htmlFor="adhocVendorPayment">Adhoc Vendor Payment</label>
                <input
                  type="number"
                  step="0.01"
                  name="adhocVendorPayment"
                  id="adhocVendorPayment"
                  className="form-control"
                  value={formData.adhocVendorPayment}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoadingDetails}
                  placeholder="0.00"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-slate-700 font-medium" htmlFor="servicePartnerId">Service Partner</label>
                <select
                  name="servicePartnerId"
                  id="servicePartnerId"
                  className="form-select"
                  value={formData.servicePartnerId}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoadingDetails}
                >
                  <option value="">Select a service partner</option>
                  {servicePartners.map((sp) => (
                    <option key={sp.servicePartnerId} value={sp.servicePartnerId}>
                      {sp.partnerName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label text-slate-700 font-medium" htmlFor="adhocCategoryId">Adhoc Category</label>
                <select
                  name="adhocCategoryId"
                  id="adhocCategoryId"
                  className="form-select"
                  value={formData.adhocCategoryId}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoadingDetails}
                >
                  <option value="">Select an adhoc category</option>
                  {adhocCategories.map((category, index) => (
                    <option key={`${category.adhocCategoriesId}-${index}`} value={category.adhocCategoriesId}>
                      {category.name || `Category ${category.adhocCategoriesId}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="isAdhocSort"
                    id="isAdhocSort"
                    className="form-check-input"
                    checked={formData.isAdhocSort}
                    onChange={handleChange}
                    disabled={isSubmitting || isLoadingDetails}
                  />
                  <label className="form-check-label text-slate-700" htmlFor="isAdhocSort">
                    Is Adhoc Sort
                  </label>
                </div>
              </div>

              {/* Informational fields (read-only) */}
              {adhocService && (adhocService.createdBy || adhocService.createdAt || adhocService.updatedAt) && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Additional Information</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    {adhocService.createdBy && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created by:</span>
                        <span>{adhocService.createdBy}</span>
                      </div>
                    )}
                    {adhocService.createdAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created at:</span>
                        <span>{new Date(adhocService.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}
                    {adhocService.updatedAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Updated at:</span>
                        <span>{new Date(adhocService.updatedAt).toLocaleString('en-US', {
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
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoadingDetails}>
                Cancel
              </Button>
              <Button type="submit" pending={isSubmitting} disabled={isLoadingDetails}>
                {isSubmitting ? 'Saving...' : (adhocService ? 'Update Adhoc Service' : 'Create Adhoc Service')}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default AdhocServiceModal;




