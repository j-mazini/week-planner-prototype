'use client';

import React, { useEffect, useState } from 'react';
import { type CostModel, type CostModelCreateDTO, type CostModelUpdateDTO } from '@/lib/types-config-api';
import { fetchCustomers, type CustomerDTO } from '@/lib/customers-api';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface CostModelModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: CostModelCreateDTO | CostModelUpdateDTO, id?: number) => Promise<void>;
  costModel: CostModel | null;
}

const CostModelModal: React.FC<CostModelModalProps> = ({ show, onClose, onSave, costModel }) => {
  const isEditMode = Boolean(costModel);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    isAdhocCategory: boolean;
    customerId: string;
    paymentMethod: string;
  }>({
    name: '',
    description: '',
    isAdhocCategory: false,
    customerId: '',
    paymentMethod: '',
  });
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  useEffect(() => {
    if (show) {
      if (costModel) {
        setFormData({
          name: costModel.name || '',
          description: costModel.description || '',
          isAdhocCategory: costModel.isAdhocCategory ?? false,
          customerId: costModel.customerId?.toString() || '',
          paymentMethod: costModel.paymentMethod || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          isAdhocCategory: false,
          customerId: '',
          paymentMethod: '',
        });
      }
      if (!costModel) loadCustomers();
    }
  }, [show, costModel]);

  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoadingCustomers(false);
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
    if (!isEditMode && !formData.name.trim()) {
      alert('Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const payload: CostModelUpdateDTO = {
          description: formData.description.trim() || undefined,
          paymentMethod: formData.paymentMethod.trim() || undefined,
        };
        await onSave(payload, costModel?.costModelId);
      } else {
        const payload: CostModelCreateDTO = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          isAdhocCategory: formData.isAdhocCategory,
          paymentMethod: formData.paymentMethod.trim() || undefined,
        };
        if (formData.customerId) {
          payload.customerId = parseInt(formData.customerId, 10);
        }
        await onSave(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error saving cost model:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save cost model'}`);
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
            <h5 className="modal-title">{costModel ? 'Edit Cost Model' : 'Create Cost Model'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body">
              {/* Edit mode: only description and paymentMethod are editable */}
              {isEditMode && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Cost Model (read-only)</p>
                  <div className="space-y-1 text-sm text-slate-700">
                    <div><span className="font-medium">Name:</span> {costModel?.name ?? '—'}</div>
                    {costModel?.customerId != null && (
                      <div><span className="font-medium">Customer ID:</span> {costModel.customerId}</div>
                    )}
                    {costModel?.isAdhocCategory && (
                      <div><span className="font-medium">Ad-Hoc Category:</span> Yes</div>
                    )}
                  </div>
                </div>
              )}

              {!isEditMode && (
                <>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="name">Name *</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      placeholder="Enter cost model name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="customerId">Customer</label>
                    <select
                      name="customerId"
                      id="customerId"
                      className="form-select"
                      value={formData.customerId}
                      onChange={handleChange}
                      disabled={isSubmitting || isLoadingCustomers}
                    >
                      <option value="">Select a customer (optional)</option>
                      {customers.map((customer) => (
                        <option key={customer.customerId} value={customer.customerId}>
                          {customer.customerName || `Customer ${customer.customerId}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="isAdhocCategory"
                        className="form-check-input"
                        checked={formData.isAdhocCategory}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        id="isAdhocCategory"
                      />
                      <label className="form-check-label" htmlFor="isAdhocCategory">
                        Is Ad-Hoc Category
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="mb-3">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  name="description"
                  id="description"
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Optional description"
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="paymentMethod">Payment method</label>
                <input
                  type="text"
                  name="paymentMethod"
                  id="paymentMethod"
                  className="form-control"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="e.g. invoice, prepaid"
                />
              </div>

              {/* Informational fields (read-only) */}
              {costModel && (costModel.createdBy || costModel.createdAt || costModel.updatedAt) && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Additional Information</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    {costModel.createdBy && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created by:</span>
                        <span>{costModel.createdBy}</span>
                      </div>
                    )}
                    {costModel.createdAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created at:</span>
                        <span>{new Date(costModel.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}
                    {costModel.updatedAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Updated at:</span>
                        <span>{new Date(costModel.updatedAt).toLocaleString('en-US', {
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

              <p className="text-muted small mb-0">{isEditMode ? 'Only description and payment method can be edited.' : 'Fields marked with * are required.'}</p>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" pending={isSubmitting}>
                {isSubmitting ? 'Saving...' : (costModel ? 'Update Cost Model' : 'Create Cost Model')}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default CostModelModal;



