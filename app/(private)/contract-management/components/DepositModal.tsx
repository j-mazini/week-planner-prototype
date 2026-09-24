'use client';

import React, { useEffect, useState } from 'react';
import { fetchCustomers, type CustomerDTO } from '@/lib/customers-api';
import { ALLOWED_DEPOSIT_CODES } from '@/lib/allowedDeposits';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface DepositModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: { depositName: string; description?: string; customerId?: number }) => Promise<void>;
}

const initialState = {
  depositName: '',
  description: '',
  customerId: '',
};

const DepositModal: React.FC<DepositModalProps> = ({ show, onClose, onSave }) => {
  const [formData, setFormData] = useState<typeof initialState>(initialState);
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const { isSubmitting, guard } = useSubmitGuard();
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  useEffect(() => {
    if (show) {
      setFormData(initialState);
      loadCustomers();
    }
  }, [show]);

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.depositName.trim()) {
      alert('Deposit name is required');
      return;
    }

    await onSave({
      depositName: formData.depositName.trim(),
      description: formData.description.trim() || undefined,
      customerId: formData.customerId ? parseInt(formData.customerId, 10) : undefined,
    });
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1055, position: 'fixed' }}>
      <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 1056 }}>
        <div className="modal-content" style={{ zIndex: 1057 }}>
          <div className="modal-header">
            <h5 className="modal-title">Create Deposit</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <form onSubmit={guard(handleSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Quick pick (optional)</label>
                <select
                  className="form-select"
                  value={ALLOWED_DEPOSIT_CODES.includes(formData.depositName.trim().toUpperCase() as typeof ALLOWED_DEPOSIT_CODES[number]) ? formData.depositName.trim().toUpperCase() : ''}
                  onChange={(e) => {
                    const next = e.target.value;
                    setFormData(prev => ({ ...prev, depositName: next }));
                  }}
                  disabled={isSubmitting}
                >
                  <option value="">Select a depot code (LSE/LCY/MSE/BAOP)</option>
                  {ALLOWED_DEPOSIT_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Deposit Name *</label>
                <input
                  type="text"
                  name="depositName"
                  className="form-control"
                  value={formData.depositName}
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
                <label className="form-label">Customer</label>
                <select
                  name="customerId"
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
              <p className="text-muted small mb-0">Fields marked with * are required.</p>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" pending={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Deposit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}></div>
    </div>
  );
};

export default DepositModal;


