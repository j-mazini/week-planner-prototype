'use client';

import React, { useEffect, useState } from 'react';
import { updateDeposit, type Deposit } from '@/lib/vendors-api';
import { fetchCustomers, type CustomerDTO } from '@/lib/customers-api';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface DepositEditModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: Deposit) => Promise<void>;
  deposit: Deposit | null;
}

const DepositEditModal: React.FC<DepositEditModalProps> = ({ 
  show, 
  onClose, 
  onSave, 
  deposit
}) => {
  const [formData, setFormData] = useState<Partial<Deposit>>({
    depositName: '',
    description: '',
    customerId: undefined,
  });
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  useEffect(() => {
    if (show && deposit) {
      setFormData({
        depositName: deposit.depositName || '',
        description: deposit.description || '',
        customerId: deposit.customerId,
      });
      loadCustomers();
    }
  }, [show, deposit]);

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
    const { name, value } = e.target;
    if (name === 'customerId') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.depositName?.trim()) {
      alert('Deposit name is required');
      return;
    }

    if (!deposit) {
      alert('Deposit data is missing');
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate deposit ID
      if (!deposit.depositId || deposit.depositId <= 0) {
        throw new Error('Invalid deposit ID. Cannot update deposit.');
      }

      const updatePayload: Partial<{ depositName: string; description?: string; customerId?: number }> = {
        depositName: formData.depositName.trim(),
      };

      if (formData.description !== undefined) {
        updatePayload.description = formData.description.trim() || undefined;
      }

      if (formData.customerId !== undefined) {
        updatePayload.customerId = formData.customerId;
      }

      const updatedDeposit = await updateDeposit(deposit.depositId, updatePayload);
      
      await onSave(updatedDeposit);
      onClose();
    } catch (error) {
      console.error('Error updating deposit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update deposit';
      alert(`Error: ${errorMessage}`);
      // Don't close modal on error so user can try again
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !deposit) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1055, position: 'fixed' }}>
      <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 1056 }}>
        <div className="modal-content" style={{ zIndex: 1057 }}>
          <div className="modal-header">
            <h5 className="modal-title">Edit Deposit</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Deposit Name *</label>
                <input
                  type="text"
                  name="depositName"
                  className="form-control"
                  value={formData.depositName || ''}
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
                  value={formData.description || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Customer</label>
                <select
                  name="customerId"
                  className="form-select"
                  value={formData.customerId || ''}
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
              
              {/* Informational fields (read-only) */}
              {(deposit.createdBy || deposit.createdAt || deposit.updatedAt) && (
                <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Additional Information</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    {deposit.createdBy && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created by:</span>
                        <span>{deposit.createdBy}</span>
                      </div>
                    )}
                    {deposit.createdAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created at:</span>
                        <span>{new Date(deposit.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    )}
                    {deposit.updatedAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Updated at:</span>
                        <span>{new Date(deposit.updatedAt).toLocaleString('en-US', {
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
                {isSubmitting ? 'Updating...' : 'Update Deposit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default DepositEditModal;


